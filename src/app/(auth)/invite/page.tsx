import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/layout/auth-card";
import { AcceptInviteForm } from "@/components/features/auth/accept-invite-form";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/utils/tokens";

export const metadata: Metadata = {
  title: "Accept invitation",
  description: "Join your studio on GlowBook with an invitation link.",
};

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  const invitation = token
    ? await db.staffInvite.findUnique({
        where: { token: hashToken(token) },
        include: { account: { select: { studioName: true } } },
      })
    : null;

  const valid =
    invitation && !invitation.acceptedAt && invitation.expiresAt > new Date();

  if (!valid) {
    return (
      <AuthCard
        title="Invitation not found"
        subtitle="That link is invalid, expired, or already used."
        footer={
          <p className="text-sm text-neutral-600">
            <Link
              href="/login"
              className="font-medium text-brand-700 underline"
            >
              Back to sign in
            </Link>
          </p>
        }
      >
        <p className="text-sm text-neutral-600">
          Ask the studio owner for a fresh invitation link.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={`Join ${invitation.account.studioName}`}
      subtitle={`Invited as ${invitation.email} (${invitation.role === "OWNER" ? "owner" : "staff"}). Set your name and password to finish.`}
      footer={
        <p className="text-sm text-neutral-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-700 underline">
            Sign in
          </Link>
        </p>
      }
    >
      <AcceptInviteForm token={token} />
    </AuthCard>
  );
}
