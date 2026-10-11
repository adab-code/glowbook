/**
 * Maps a database exclusion-violation on `appointment_no_overlap` back onto the
 * same 409 the application-level check returns.
 *
 * Two requests racing past `assertNoOverlap` both reach the INSERT/UPDATE; the
 * loser's write fails at the constraint instead of silently double-booking.
 * The code matches broadly on purpose: raw Postgres reports SQLSTATE 23P01
 * (exclusion) or 23505 (unique), Prisma's client reports P2002/P2034 depending
 * on version and driver adapter, and every shape carries the constraint name
 * in the message — which is the one check that cannot misfire.
 *
 * Deliberately dependency-free so unit tests can import it: anything pulling
 * in `src/lib/db.ts` cannot run under `vitest run` (see vitest.config.ts).
 */
export function isOverlapViolation(error: unknown): boolean {
  if (
    error instanceof Error &&
    error.message.includes("appointment_no_overlap")
  ) {
    return true;
  }
  const code = (error as { code?: unknown } | null)?.code;
  return (
    code === "P2002" || code === "P2034" || code === "23505" || code === "23P01"
  );
}
