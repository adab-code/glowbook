import { AuthCard } from "@/components/layout/auth-card";
import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      subtitle="We'll email you a link that works for one hour."
      footer={
        <p className="text-sm text-neutral-600">
          <a href="/login" className="font-medium text-brand-700 underline">
            Back to sign in
          </a>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
