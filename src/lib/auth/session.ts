import { auth } from "@/auth";
import { ApiError, unauthorized } from "@/lib/api/errors";

export type SessionUser = {
  id: string;
  accountId: string;
  email: string;
  role: "OWNER" | "STAFF";
  studioName: string;
  timezone: string;
  currency: string;
  firstName: string;
  lastName: string;
};

/**
 * Authoritative session check for server components and route handlers.
 * `accountId` always comes from here — never from a request body or route
 * parameter — which is what keeps studio data isolated (constitution §III).
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) throw unauthorized();

  return {
    id: session.user.id,
    accountId: session.user.accountId,
    email: session.user.email ?? "",
    role: session.user.role,
    studioName: session.user.studioName,
    timezone: session.user.timezone,
    currency: session.user.currency,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
  };
}

export async function requireOwner(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "OWNER") {
    throw new ApiError(403, "forbidden", "Only the studio owner can do that.");
  }
  return user;
}
