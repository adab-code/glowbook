import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { UpcomingAppointments } from "@/components/features/appointments/upcoming-appointments";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { zonedWeekBounds } from "@/lib/utils/datetime";
import { appointmentInclude } from "@/lib/appointments/types";
import {
  formatDateTime,
  formatDayLabel,
  formatMoney,
} from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "A daily overview of your studio: upcoming appointments, active clients, bookable services and revenue for the week.",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();

  // Every boundary is resolved in the studio's zone. The server runs in UTC, so
  // `new Date(y, m, d)` here would roll the day over at 17:00 Boise time and credit
  // tomorrow's completed appointments to today.
  const weekStart = zonedWeekBounds(now, user.timezone, 1);
  const weekEnd = zonedWeekBounds(now, user.timezone, 1, true);

  const [upcoming, upcomingCount, clientCount, serviceCount, weekRevenueCents] =
    await Promise.all([
      db.appointment.findMany({
        where: { accountId: user.accountId, startsAt: { gte: now } },
        orderBy: { startsAt: "asc" },
        take: 5,
        include: appointmentInclude,
      }),
      // Counted separately: `upcoming.length` was the length of a `take: 5` page, so
      // the card read "5" for every studio with more than five bookings.
      db.appointment.count({
        where: { accountId: user.accountId, startsAt: { gte: now } },
      }),
      db.client.count({
        where: { accountId: user.accountId, isArchived: false },
      }),
      db.service.count({
        where: { accountId: user.accountId, isActive: true },
      }),
      db.appointment
        .findMany({
          where: {
            accountId: user.accountId,
            status: "COMPLETED",
            // The studio's own Monday→Sunday, not "the next 168 hours from now",
            // which reached into the future and counted unearned money.
            startsAt: { gte: weekStart, lt: weekEnd },
          },
          select: { priceCentsTotal: true },
        })
        .then((rows) =>
          rows.reduce((sum, row) => sum + row.priceCentsTotal, 0),
        ),
    ]);

  const stats = [
    {
      label: "Upcoming appointments",
      value: String(upcomingCount),
      hint: upcomingCount > upcoming.length ? "Next 5 shown below" : undefined,
    },
    { label: "Active clients", value: String(clientCount) },
    { label: "Bookable services", value: String(serviceCount) },
    {
      label: "Revenue this week",
      value: formatMoney(weekRevenueCents, user.currency),
      hint: `${formatDayLabel(weekStart, user.timezone)} – ${formatDayLabel(weekEnd, user.timezone)}, completed only`,
    },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.firstName}`}
        description={`Here is what is happening at ${user.studioName}.`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/clients">Add client</Link>
            </Button>
            <Button asChild>
              <Link href="/services">Manage services</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm text-neutral-600">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-neutral-900">
                {stat.value}
              </p>
              {stat.hint ? (
                <p className="mt-1 text-xs text-neutral-500">{stat.hint}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <UpcomingAppointments
        initialAppointments={upcoming}
        timeZone={user.timezone}
      />

      <p className="mt-6 text-xs text-neutral-500">
        Showing the next {upcoming.length} of {upcomingCount} upcoming
        appointment
        {upcomingCount === 1 ? "" : "s"}, as of{" "}
        {formatDateTime(now, user.timezone)}.
      </p>
    </>
  );
}
