import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { AppointmentManager } from "@/components/features/appointments/appointment-manager";
import { MonthView } from "@/components/features/appointments/month-view";
import { WeekView } from "@/components/features/appointments/week-view";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import {
  dayKeyOf,
  groupByDay,
  monthGrid,
  weekDays,
} from "@/lib/appointments/calendar";
import { appointmentInclude } from "@/lib/appointments/types";
import {
  addWallDays,
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
  zonedDayBounds,
  zonedMonthBounds,
} from "@/lib/utils/datetime";
import { formatDayLabel, fullName } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Appointments",
  description:
    "Book clients into slots and manage the schedule by day, week, or month, in your studio's timezone, with overlap protection.",
};

type View = "day" | "week" | "month";

const VIEWS: { key: View; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

function parseView(raw: unknown): View {
  return raw === "week" || raw === "month" ? raw : "day";
}

/** `YYYY-MM-DD` resolved as midnight in the studio's zone; null when unparseable. */
function parseDate(raw: unknown, timeZone: string): Date | null {
  if (typeof raw !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  return fromDateTimeLocalValue(`${raw}T00:00`, timeZone);
}

function viewParams(view: View, anchorKey: string) {
  return `/appointments?view=${view}&date=${anchorKey}`;
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const view = parseView(params.view);

  // Midnight in the studio's own zone, not the server's. At 21:00 Boise time a UTC
  // "today" has already rolled over, which used to hide the evening's appointments.
  const now = new Date();
  const anchor = parseDate(params.date, user.timezone) ?? now;
  const todayKey = dayKeyOf(now, user.timezone);
  const anchorKey = dayKeyOf(anchor, user.timezone);

  const [clients, services, staff] = await Promise.all([
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

  const clientOptions = clients.map((client) => ({
    id: client.id,
    label: fullName(client),
  }));
  const serviceOptions = services.map((service) => ({
    id: service.id,
    label: service.name,
    priceCents: service.priceCents,
    durationMinutes: service.durationMinutes,
  }));
  const staffOptions = staff.map((member) => ({
    id: member.id,
    label: fullName(member),
  }));

  // Range navigation per view, always on the calendar (DST-safe helpers).
  const prevKey =
    view === "day"
      ? dayKeyOf(addWallDays(anchor, user.timezone, -1), user.timezone)
      : view === "week"
        ? dayKeyOf(addWallDays(anchor, user.timezone, -7), user.timezone)
        : dayKeyOf(
            addWallDays(
              zonedMonthBounds(anchor, user.timezone),
              user.timezone,
              -1,
            ),
            user.timezone,
          );
  const nextKey =
    view === "day"
      ? dayKeyOf(addWallDays(anchor, user.timezone, 1), user.timezone)
      : view === "week"
        ? dayKeyOf(addWallDays(anchor, user.timezone, 7), user.timezone)
        : dayKeyOf(
            zonedMonthBounds(anchor, user.timezone, true),
            user.timezone,
          );

  const tabs = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="tablist"
        aria-label="Calendar view"
        className="inline-flex w-fit rounded-[var(--radius-control)] border border-neutral-300 bg-white p-1"
      >
        {VIEWS.map((tab) => (
          <Link
            key={tab.key}
            role="tab"
            aria-selected={view === tab.key}
            href={viewParams(tab.key, anchorKey)}
            className={`rounded-[calc(var(--radius-control)-4px)] px-4 py-1.5 text-sm font-medium ${
              view === tab.key
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={viewParams(view, prevKey)}
          aria-label="Previous"
          className="rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
        >
          ← Prev
        </Link>
        {anchorKey !== todayKey ? (
          <Link
            href={viewParams(view, todayKey)}
            className="rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            Today
          </Link>
        ) : null}
        <Link
          href={viewParams(view, nextKey)}
          aria-label="Next"
          className="rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
        >
          Next →
        </Link>
      </div>
    </div>
  );

  if (view === "week") {
    const days = weekDays(anchor, user.timezone);
    const rangeEnd = addWallDays(days[6], user.timezone, 1);
    const appointments = await db.appointment.findMany({
      where: {
        accountId: user.accountId,
        startsAt: { gte: days[0], lt: rangeEnd },
      },
      orderBy: { startsAt: "asc" },
      include: appointmentInclude,
    });
    const groups = groupByDay(appointments, user.timezone);

    return (
      <>
        <PageHeader
          title="Appointments"
          description="The week at a glance, in your studio's timezone. Open a day to book, move, or close appointments."
        />
        {tabs}
        <WeekView days={days} groups={groups} timeZone={user.timezone} />
      </>
    );
  }

  if (view === "month") {
    const monthStart = zonedMonthBounds(anchor, user.timezone);
    const monthEnd = zonedMonthBounds(anchor, user.timezone, true);
    const appointments = await db.appointment.findMany({
      where: {
        accountId: user.accountId,
        startsAt: { gte: monthStart, lt: monthEnd },
      },
      orderBy: { startsAt: "asc" },
      include: appointmentInclude,
    });
    const groups = groupByDay(appointments, user.timezone);

    return (
      <>
        <PageHeader
          title="Appointments"
          description="The month at a glance, in your studio's timezone. Open a day to book, move, or close appointments."
        />
        {tabs}
        <MonthView
          weeks={monthGrid(anchor, user.timezone)}
          groups={groups}
          timeZone={user.timezone}
        />
      </>
    );
  }

  const dayStart = zonedDayBounds(anchor, user.timezone);
  const dayEnd = zonedDayBounds(anchor, user.timezone, true);
  const appointments = await db.appointment.findMany({
    where: {
      accountId: user.accountId,
      startsAt: { gte: dayStart, lt: dayEnd },
    },
    orderBy: { startsAt: "asc" },
    include: appointmentInclude,
  });

  const dayLabel = formatDayLabel(anchor, user.timezone);
  return (
    <>
      <PageHeader
        title="Appointments"
        description="Book a client into a slot, then close it out as the day goes on. Times are shown in your studio's timezone."
      />
      {tabs}
      <AppointmentManager
        initialAppointments={appointments}
        canDelete={user.role === "OWNER"}
        heading={anchorKey === todayKey ? `Today · ${dayLabel}` : dayLabel}
        dayQuery={{
          from: toDateTimeLocalValue(dayStart, user.timezone),
          to: toDateTimeLocalValue(dayEnd, user.timezone),
        }}
        currency={user.currency}
        timeZone={user.timezone}
        clients={clientOptions}
        services={serviceOptions}
        staff={staffOptions}
      />
    </>
  );
}
