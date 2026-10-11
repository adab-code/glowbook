import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, conflict, jsonError } from "@/lib/api/errors";
import { requireOwner } from "@/lib/auth/session";
import { fieldErrors, staffInviteSchema } from "@/lib/validations/schemas";
import {
  generateToken,
  hashToken,
  STAFF_INVITE_TTL_MS,
} from "@/lib/utils/tokens";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

/** GET /api/staff/invitations — pending invitations for the studio (owner-only). */
export async function GET() {
  try {
    const user = await requireOwner();
    const invitations = await db.staffInvite.findMany({
      where: { accountId: user.accountId, acceptedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ data: invitations });
  } catch (error) {
    return jsonError(error);
  }
}

/** POST /api/staff/invitations — invite someone to the studio (owner-only). */
export async function POST(request: Request) {
  try {
    const user = await requireOwner();
    const parsed = staffInviteSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      throw badRequest(
        "Check the highlighted fields.",
        fieldErrors(parsed.error),
      );
    }

    const email = parsed.data.email.toLowerCase();

    // Someone already on the team cannot be invited again.
    const member = await db.staffUser.findUnique({
      where: { email },
      select: { id: true, accountId: true },
    });
    if (member) {
      throw conflict(
        member.accountId === user.accountId
          ? "That person is already on your team."
          : "That email address is already registered.",
        { email: "Use a different email address." },
      );
    }

    // One live invitation per email keeps the pending list meaningful.
    const pending = await db.staffInvite.findFirst({
      where: {
        accountId: user.accountId,
        email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });
    if (pending) {
      throw conflict("That person already has a pending invitation.", {
        email: "Revoke the pending invitation first, or wait for it to expire.",
      });
    }

    const token = generateToken();
    const invitation = await db.staffInvite.create({
      data: {
        accountId: user.accountId,
        email,
        role: parsed.data.role,
        token: hashToken(token),
        expiresAt: new Date(Date.now() + STAFF_INVITE_TTL_MS),
      },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    // No mail provider is wired up (same as password reset), so the owner
    // copies this link and sends it themselves.
    return NextResponse.json(
      {
        data: invitation,
        acceptUrl: `${siteUrl()}/invite?token=${token}`,
      },
      { status: 201 },
    );
  } catch (error) {
    return jsonError(error);
  }
}
