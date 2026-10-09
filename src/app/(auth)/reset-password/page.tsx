import type { Metadata } from "next";
import { AuthCard } from "@/components/layout/auth-card";
import { ResetPasswordForm } from "@/components/features/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description:
    "Choose a new password for your GlowBook account. Reset links work once and expire after an hour.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Reset links work once and expire after an hour."
      footer={
        <p className="text-sm text-neutral-600">
          <a href="/login" className="font-medium text-brand-700 underline">
            Back to sign in
          </a>
        </p>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-sm text-danger">
          This link is missing its token. Request a new reset link.
        </p>
      )}
    </AuthCard>
  );
}
