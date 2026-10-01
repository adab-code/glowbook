import { db } from "@/lib/db";
import { badRequest, conflict, notFound } from "@/lib/api/errors";
import { appointmentInclude } from "@/lib/appointments/types";
import { formatTime, fullName } from "@/lib/utils/format";

/**
 * The pieces of booking that more than one route handler needs. Clients and services
 * each keep a `findOwned*` helper local to their own `[id]/route.ts`; this module is
 * different because the overlap rule, the duration/price derivation and the ownership
 * lookup are all shared by `appointments/route.ts`, `[id]/route.ts` and
 * `[id]/status/route.ts`. Duplicating them three ways is how they drift apart.
 */

export type BookingService = {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
  isActive: boolean;
};

export { appointmentInclude };

/**
 * Loads the selected services and refuses anything that is not this studio's.
 * Duplicates are collapsed first: `AppointmentService` has a composite primary key,
 * so the same service twice is a unique-violation, not a longer appointment.
 */
export async function resolveBookingServices(
  serviceIds: string[],
  accountId: string,
): Promise<BookingService[]> {
  const unique = [...new Set(serviceIds)];

  const services = await db.service.findMany({
    where: { id: { in: unique }, accountId },
  });

  // Same message whether the id does not exist or belongs to another studio, so this
  // endpoint cannot be used to probe which service ids are real.
  if (services.length !== unique.length) {
    throw badRequest("That service is not in your studio.", {
      serviceIds: "Pick services from your own catalogue.",
    });
  }

  const byId = new Map(services.map((service) => [service.id, service]));

  // Returned in the order the caller picked them, so the summary and the response
  // read the way the form showed them.
  const ordered = unique.map((id) => byId.get(id) as BookingService);

  const archived = ordered.find((service) => !service.isActive);
  if (archived) {
    throw badRequest("That service is archived.", {
      serviceIds: `“${archived.name}” is no longer bookable. Remove it to continue.`,
    });
  }

  return ordered;
}

/**
 * `endsAt` and `priceCentsTotal` are always derived here, never read from the request.
 * Accepting them from a client would let a caller book a two-hour slot that ends in
 * twenty minutes, or record a total of one cent.
 */
export function summariseBooking(services: BookingService[]) {
  return {
    durationMinutes: services.reduce((sum, s) => sum + s.durationMinutes, 0),
    priceCentsTotal: services.reduce((sum, s) => sum + s.priceCents, 0),
  };
}

export async function findOwnedAppointment(id: string, accountId: string) {
  const appointment = await db.appointment.findFirst({
    where: { id, accountId },
    include: appointmentInclude,
  });
  if (!appointment) throw notFound("That appointment");
  return appointment;
}

/** The client must be live in this studio. A field error, not a 404, to keep the form usable. */
export async function findBookableClient(clientId: string, accountId: string) {
  const client = await db.client.findFirst({
    where: { id: clientId, accountId, isArchived: false },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!client) {
    throw badRequest("That client is not in your studio.", {
      clientId: "Pick a client from your studio.",
    });
  }
  return client;
}

/** An empty string and an absent field both mean "unassigned". */
export async function resolveStaffUser(
  staffUserId: string | undefined,
  accountId: string,
): Promise<string | null> {
  if (!staffUserId) return null;

  const staff = await db.staffUser.findFirst({
    where: { id: staffUserId, accountId, isActive: true },
    select: { id: true },
  });
  if (!staff) {
    throw badRequest("That team member is not in your studio.", {
      staffUserId: "Pick someone from your team.",
    });
  }
  return staff.id;
}

type OverlapInput = {
  accountId: string;
  staffUserId: string | null;
  startsAt: Date;
  endsAt: Date;
  excludeId?: string;
};

/**
 * FR-021: warn when a booking overlaps an existing, non-cancelled appointment.
 *
 * Two half-open intervals overlap when `startsAt < other.endsAt && endsAt > other.startsAt`,
 * so a 10:00–11:00 booking does not clash with one starting at 11:00.
 *
 * The scope is the same *resource*: the same staff member, where "unassigned" is its own
 * resource. A booking assigned to Aaron can therefore overlap one assigned to Cierra,
 * which is what a multi-chair studio wants — but an unassigned booking and an Aaron
 * booking can overlap, because the app has no availability or capacity model to know
 * they are the same chair.
 *
 * Only `accountId` comes from the session, so this can never see another studio's rows.
 *
 * **Not race-safe.** Two requests in the same instant can both read "no conflict" and
 * both write. The durable fix is a Postgres exclusion constraint,
 * `EXCLUDE USING gist (staff_user_id WITH =, tstzrange(starts_at, ends_at) WITH &&)`
 * with `btree_gist` — documented in `docs/data-model.md`.
 */
export async function assertNoOverlap(
  { accountId, staffUserId, startsAt, endsAt, excludeId }: OverlapInput,
  context: { timeZone: string },
) {
  const clash = await db.appointment.findFirst({
    where: {
      accountId,
      status: { not: "CANCELLED" },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
      staffUserId: staffUserId ?? null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    include: { client: true, staffUser: true },
    orderBy: { startsAt: "asc" },
  });

  if (!clash) return;

  const who = clash.staffUser
    ? fullName(clash.staffUser)
    : "the unassigned slot";
  const message =
    `That overlaps ${fullName(clash.client)}’s appointment ` +
    `(${formatTime(clash.startsAt, context.timeZone)}–${formatTime(clash.endsAt, context.timeZone)}) ` +
    `with ${who}.`;

  // Reported against `startsAt` so the booking form can point at the field to change.
  throw conflict(message, { startsAt: message });
}
