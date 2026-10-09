import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthCard } from "@/components/layout/auth-card";
import { LoginForm } from "@/components/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your studio's schedule with GlowBook.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const from = typeof params.from === "string" ? params.from : "/dashboard";
  const justReset = params.reset === "1";

  if (!from.startsWith("/")) redirect("/login");

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to manage your studio's schedule."
      footer={
        <p className="text-sm text-neutral-600">
          New to GlowBook?{" "}
          <a href="/signup" className="font-medium text-brand-700 underline">
            Create a studio account
          </a>
        </p>
      }
    >
      {justReset ? (
        <p className="rounded-[var(--radius-control)] bg-success-bg px-3 py-2 text-sm text-success">
          Your password was updated. Sign in with your new password.
        </p>
      ) : null}
      <LoginForm from={from} />
    </AuthCard>
  );
}
