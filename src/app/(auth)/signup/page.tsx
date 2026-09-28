import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthCard } from "@/components/layout/auth-card";
import { SignupForm } from "@/components/features/auth/signup-form";

export default async function SignupPage() {
  if (await auth()) redirect("/dashboard");

  return (
    <AuthCard
      title="Create your studio"
      subtitle="Start scheduling appointments instead of juggling messages."
      footer={
        <p className="text-sm text-neutral-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-700 underline">
            Sign in
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
