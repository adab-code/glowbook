import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import {
  TeamManager,
  type TeamInvitation,
  type TeamMember,
} from "@/components/features/team/team-manager";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Team",
  description:
    "Invite staff, assign roles and control who can edit the schedule.",
};

export default async function TeamPage() {
  const user = await requireUser();
  const isOwner = user.role === "OWNER";

  const members: TeamMember[] = (
    await db.staffUser.findMany({
      where: { accountId: user.accountId, isActive: true },
      orderBy: [{ role: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    })
  ).map((member) => ({ ...member, role: member.role as TeamMember["role"] }));

  // Pending invitations are owner-only data — STAFF gets an empty list and a
  // read-only view (the manager hides the invite UI without `canInvite`).
  const invitations: TeamInvitation[] = isOwner
    ? await db.staffInvite
        .findMany({
          where: { accountId: user.accountId, acceptedAt: null },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            role: true,
            expiresAt: true,
            createdAt: true,
          },
        })
        .then((rows) =>
          rows.map((row) => ({
            ...row,
            role: row.role as TeamInvitation["role"],
            expiresAt: row.expiresAt.toISOString(),
            createdAt: row.createdAt.toISOString(),
          })),
        )
    : [];

  return (
    <>
      <PageHeader
        title="Team"
        description={
          isOwner
            ? "Invite staff, assign roles and control who can edit the schedule."
            : "The people in your studio. Only the owner can invite or revoke."
        }
      />
      <TeamManager
        initialMembers={members}
        initialInvitations={invitations}
        canInvite={isOwner}
      />
    </>
  );
}
