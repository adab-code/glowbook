import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError, notFound } from "@/lib/api/errors";
import { requireOwner } from "@/lib/auth/session";

/** DELETE /api/staff/invitations/:id — revoke a pending invitation (owner-only). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireOwner();
    const { id } = await params;

    const invitation = await db.staffInvite.findFirst({
      where: { id, accountId: user.accountId, acceptedAt: null },
      select: { id: true },
    });
    if (!invitation) throw notFound("That invitation");

    await db.staffInvite.delete({ where: { id: invitation.id } });
    return NextResponse.json({ data: { id: invitation.id } });
  } catch (error) {
    return jsonError(error);
  }
}
