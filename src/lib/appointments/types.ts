import type { Prisma } from "@/generated/prisma/client";

/**
 * The relation set every appointment read returns. Kept in its own module with no
 * `db` import so a client component can derive its prop type from it without pulling
 * the Prisma client into the browser bundle.
 */
export const appointmentInclude = {
  client: true,
  staffUser: true,
  services: { include: { service: true } },
} as const;

export type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: typeof appointmentInclude;
}>;
