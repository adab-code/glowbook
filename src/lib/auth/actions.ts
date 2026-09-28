"use server";

import { AuthError } from "next-auth";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import {
  fieldErrors,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validations/schemas";
import {
  hashToken,
  generateToken,
  PASSWORD_RESET_TTL_MS,
} from "@/lib/utils/tokens";

export type FormState = {
  status: "error" | "success";
  error?: string;
  fields?: Record<string, string>;
} | null;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Only ever redirect to a path inside this app. A crafted `from` of
 * `https://evil.com` or `//evil.com` would otherwise turn the login form
 * into an open redirect, so `//` is rejected alongside absolute URLs.
 */
function safeRedirect(raw: FormDataEntryValue | null): string {
  const value = typeof raw === "string" ? raw : "";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", fields: fieldErrors(parsed.error) };

  const { studioName, firstName, lastName, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await db.staffUser.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) {
    return {
      status: "error",
      fields: { email: "An account already exists with that email address." },
    };
  }

  const passwordHash = await hash(password, 12);

  try {
    await db.$transaction(async (tx) => {
      const slug = `${slugify(studioName) || "studio"}-${generateToken(3)}`;
      const account = await tx.account.create({
        data: { studioName, slug, timezone: "America/Boise", currency: "USD" },
      });
      await tx.staffUser.create({
        data: {
          accountId: account.id,
          email: normalizedEmail,
          passwordHash,
          role: "OWNER",
          firstName,
          lastName,
        },
      });
    });
  } catch (cause) {
    // Unique-violation race between the check above and the insert.
    if (cause instanceof Error && cause.message.includes("Unique constraint")) {
      return {
        status: "error",
        fields: { email: "An account already exists with that email address." },
      };
    }
    throw cause;
  }

  await signIn("credentials", {
    email: normalizedEmail,
    password,
    redirectTo: "/dashboard",
  });

  redirect("/dashboard");
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", fields: fieldErrors(parsed.error) };

  const email = parsed.data.email.toLowerCase();
  const redirectTo = safeRedirect(formData.get("from"));

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (cause) {
    if (cause instanceof AuthError) {
      // Never say which half was wrong.
      return { status: "error", error: "Invalid email or password." };
    }
    redirect(redirectTo);
  }

  redirect(redirectTo);
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function requestResetAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) {
    return { status: "error", fields: { email: "Enter your email address." } };
  }

  const user = await db.staffUser.findUnique({
    where: { email },
    select: { id: true },
  });

  // Always report success so this endpoint cannot be used to discover accounts.
  if (user) {
    const token = generateToken();
    await db.passwordResetToken.create({
      data: {
        staffUserId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      },
    });
    console.info(
      `[dev] password reset link for ${email}: /reset-password?token=${token}`,
    );
  }

  return { status: "success" };
}

export async function resetPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", fields: fieldErrors(parsed.error) };

  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return {
      status: "error",
      error: "That reset link is no longer valid. Request a new one.",
    };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await db.$transaction(async (tx) => {
    await tx.staffUser.update({
      where: { id: record.staffUserId },
      data: { passwordHash, emailVerifiedAt: new Date() },
    });
    await tx.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
  });

  redirect("/login?reset=1");
}
