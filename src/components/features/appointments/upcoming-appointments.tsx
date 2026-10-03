"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { AppointmentStatusActions } from "@/components/features/appointments/appointment-status-actions";
import { formatTime, fullName } from "@/lib/utils/format";
import type { AppointmentWithRelations } from "@/lib/appointments/types";

/**
 * The dashboard's "what is next" list, as a client component so the status can be
 * changed from here (FR-027). The row is patched in place from the route handler's
 * response rather than re-reading the list, because a status change cannot change
 * which appointments are in the future.
 */
export function UpcomingAppointments({
  initialAppointments,
  timeZone,
}: {
  initialAppointments: AppointmentWithRelations[];
  timeZone: string;
}) {
  const [appointments, setAppointments] = useState(initialAppointments);

  if (appointments.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Next appointments</CardTitle>
          <CardDescription>Times are shown in {timeZone}.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Nothing booked yet"
            description="Once clients start booking, their appointments will show up here."
            icon="▤"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Next appointments</CardTitle>
        <CardDescription>
          Times are shown in {timeZone}. You can close an appointment out from
          here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-neutral-200">
          {appointments.map((appointment) => (
            <li
              key={appointment.id}
              className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
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
                {appointment.cancellationReason ? (
                  <p className="text-sm text-danger">
                    Cancelled: {appointment.cancellationReason}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                <div className="flex items-center gap-3">
                  <StatusBadge status={appointment.status} />
                  <p className="text-sm text-neutral-700">
                    {formatTime(appointment.startsAt, timeZone)}
                  </p>
                </div>
                <AppointmentStatusActions
                  appointment={appointment}
                  onChanged={(next) =>
                    setAppointments((current) =>
                      current.map((item) =>
                        item.id === next.id ? next : item,
                      ),
                    )
                  }
                  onDeleted={(id) =>
                    setAppointments((current) =>
                      current.filter((item) => item.id !== id),
                    )
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
