import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { formatDateTime, formatMoney, fullName } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Client" };

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const client = await db.client.findFirst({
    where: { id, accountId: user.accountId },
    include: {
      appointments: {
        orderBy: { startsAt: "desc" },
        include: { services: { include: { service: true } } },
      },
    },
  });

  if (!client) notFound();

  return (
    <>
      <PageHeader
        title={fullName(client)}
        description={
          [client.email, client.phone].filter(Boolean).join(" · ") ||
          "No contact details on file"
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>
              Shared with everyone on your team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm text-neutral-700">
              {client.notes || "No notes yet."}
            </p>
            {client.isArchived ? (
              <p className="mt-4 rounded-[var(--radius-control)] bg-neutral-100 px-3 py-2 text-sm text-neutral-600">
                This client is archived. Their history is preserved.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Appointment history</CardTitle>
            <CardDescription>
              Newest first. Prices are snapshots from the time of booking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {client.appointments.length === 0 ? (
              <EmptyState
                title="No appointments yet"
                description="When you book this client, their history will appear here."
                icon="▤"
              />
            ) : (
              <ul className="divide-y divide-neutral-200">
                {client.appointments.map((appointment) => (
                  <li key={appointment.id} className="py-4 first:pt-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-neutral-800">
                        {formatDateTime(appointment.startsAt, user.timezone)}
                      </p>
                      <StatusBadge status={appointment.status} />
                    </div>
                    <p className="mt-1 text-sm text-neutral-600">
                      {appointment.services
                        .map((entry) => entry.service.name)
                        .join(", ")}{" "}
                      ·{" "}
                      {formatMoney(appointment.priceCentsTotal, user.currency)}
                    </p>
                    {appointment.cancellationReason ? (
                      <p className="mt-1 text-sm text-danger">
                        Cancelled: {appointment.cancellationReason}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
