import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { AppointmentManager } from "@/components/features/appointments/appointment-manager";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { zonedDayBounds, toDateTimeLocalValue } from "@/lib/utils/datetime";
import { formatDateTime, formatDayLabel, fullName } from "@/lib/utils/format";
import { appointmentInclude } from "@/lib/appointments/types";

export const metadata: Metadata = {
  title: "Appointments",
  description:
    "Book clients into slots and manage today's appointment list, in your studio's timezone, with overlap protection.",
};

export default async function AppointmentsPage() {
  const user = await requireUser();
  const now = new Date();

  // Midnight in the studio's own zone, not the server's. At 21:00 Boise time a UTC
  // "today" has already rolled over, which used to hide the evening's appointments.
  const dayStart = zonedDayBounds(now, user.timezone);
  const dayEnd = zonedDayBounds(now, user.timezone, true);

  const [appointments, clients, services, staff] = await Promise.all([
    db.appointment.findMany({
      where: {
        accountId: user.accountId,
        startsAt: { gte: dayStart, lt: dayEnd },
      },
      orderBy: { startsAt: "asc" },
      include: appointmentInclude,
    }),
    db.client.findMany({
      where: { accountId: user.accountId, isArchived: false },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
    }),
    db.service.findMany({
      where: { accountId: user.accountId, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, priceCents: true, durationMinutes: true },
    }),
    db.staffUser.findMany({
      where: { accountId: user.accountId, isActive: true },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Book a client into a slot, then close it out as the day goes on. Times are shown in your studio's timezone."
      />
      <AppointmentManager
        initialAppointments={appointments}
        dayLabel={formatDayLabel(now, user.timezone)}
        nowLabel={formatDateTime(now, user.timezone)}
        dayQuery={{
          from: toDateTimeLocalValue(dayStart, user.timezone),
          to: toDateTimeLocalValue(dayEnd, user.timezone),
        }}
        currency={user.currency}
        timeZone={user.timezone}
        clients={clients.map((client) => ({
          id: client.id,
          label: fullName(client),
        }))}
        services={services.map((service) => ({
          id: service.id,
          label: service.name,
          priceCents: service.priceCents,
          durationMinutes: service.durationMinutes,
        }))}
        staff={staff.map((member) => ({
          id: member.id,
          label: fullName(member),
        }))}
      />
    </>
  );
}
