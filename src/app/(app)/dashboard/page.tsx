import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import {
  formatDateTime,
  formatMoney,
  formatTime,
  fullName,
} from "@/lib/utils/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [upcoming, clientCount, serviceCount, weekRevenueCents] =
    await Promise.all([
      db.appointment.findMany({
        where: { accountId: user.accountId, startsAt: { gte: now } },
        orderBy: { startsAt: "asc" },
        take: 5,
        include: {
          client: true,
          services: { include: { service: true } },
          staffUser: true,
        },
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
            startsAt: {
              gte: startOfDay,
              lt: new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000),
            },
          },
          select: { priceCentsTotal: true },
        })
        .then((rows) =>
          rows.reduce((sum, row) => sum + row.priceCentsTotal, 0),
        ),
    ]);

  const stats = [
    { label: "Upcoming appointments", value: String(upcoming.length) },
    { label: "Active clients", value: String(clientCount) },
    { label: "Bookable services", value: String(serviceCount) },
    {
      label: "Revenue this week",
      value: formatMoney(weekRevenueCents, user.currency),
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Next appointments</CardTitle>
          <CardDescription>Times are shown in {user.timezone}.</CardDescription>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <EmptyState
              title="Nothing booked yet"
              description="Once clients start booking, their appointments will show up here."
              icon="▤"
            />
          ) : (
            <ul className="divide-y divide-neutral-200">
              {upcoming.map((appointment) => (
                <li
                  key={appointment.id}
                  className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-neutral-800">
                      {fullName(appointment.client)}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {appointment.services
                        .map((entry) => entry.service.name)
                        .join(", ")}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {appointment.staffUser
                        ? `with ${fullName(appointment.staffUser)}`
                        : "No staff assigned"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={appointment.status} />
                    <p className="text-sm text-neutral-700">
                      {formatTime(appointment.startsAt, user.timezone)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-neutral-500">
        Full schedule view lands in the next milestone — today you can already
        read the next five bookings for {formatDateTime(now, user.timezone)}.
      </p>
    </>
  );
}
