"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Spinner } from "@/components/shared/spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { AppointmentForm } from "@/components/features/appointments/appointment-form";
import { AppointmentStatusActions } from "@/components/features/appointments/appointment-status-actions";
import { apiFetch, toMessage } from "@/lib/utils/api-client";
import { formatMoney, formatTime, fullName } from "@/lib/utils/format";
import type { AppointmentWithRelations } from "@/lib/appointments/types";

type Option = { id: string; label: string };
type ServiceOption = Option & { priceCents: number; durationMinutes: number };

export function AppointmentManager({
  initialAppointments,
  clients,
  services,
  staff,
  currency,
  timeZone,
  dayLabel,
  nowLabel,
  dayQuery,
}: {
  initialAppointments: AppointmentWithRelations[];
  clients: Option[];
  services: ServiceOption[];
  staff: Option[];
  currency: string;
  timeZone: string;
  dayLabel: string;
  nowLabel: string;
  /** `from`/`to` for this day, as `YYYY-MM-DDTHH:mm` in the studio's wall clock. */
  dayQuery: { from: string; to: string };
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reloading, startReload] = useTransition();

  // Same pattern as ClientManager/ServiceManager: after a mutation the client re-reads
  // through the route handler and replaces its local state. No client cache library.
  function reload(after?: string) {
    startReload(async () => {
      try {
        const query = new URLSearchParams({
          from: dayQuery.from,
          to: dayQuery.to,
        });
        const result = await apiFetch<{
          data: AppointmentWithRelations[];
        }>(`/api/appointments?${query.toString()}`);
        setAppointments(result.data);
        setMessage(after ?? null);
      } catch (error) {
        setMessage(toMessage(error));
      }
    });
  }

  return (
    <div className="space-y-6">
      {message ? (
        <p
          role="status"
          className="rounded-[var(--radius-control)] bg-info-bg px-3 py-2 text-sm text-info"
        >
          {message}
        </p>
      ) : null}

      {booking ? (
        <AppointmentForm
          clients={clients}
          services={services}
          staff={staff}
          currency={currency}
          onDone={() => {
            setBooking(false);
            reload("Appointment booked.");
          }}
          onCancel={() => setBooking(false)}
        />
      ) : (
        <div>
          <Button onClick={() => setBooking(true)}>Book appointment</Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Today · {dayLabel}</CardTitle>
          <CardDescription>
            In chronological order, {timeZone}. As of {nowLabel}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          {appointments.length === 0 ? (
            <EmptyState
              title="Nothing booked for today"
              description="Appointments you book for today will appear here in the order they happen."
              action={
                <Button onClick={() => setBooking(true)}>
                  Book appointment
                </Button>
              }
              icon="▤"
            />
          ) : (
            <ul className="divide-y divide-neutral-200">
              {appointments.map((appointment) => (
                <li
                  key={appointment.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-neutral-900">
                        <span className="tabular-nums">
                          {formatTime(appointment.startsAt, timeZone)}
                        </span>
                        <span className="text-neutral-400">
                          {" – "}
                          {formatTime(appointment.endsAt, timeZone)}
                        </span>
                      </p>
                      <StatusBadge status={appointment.status} />
                    </div>
                    <p className="text-sm text-neutral-700">
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
                        : "No team member assigned"}{" "}
                      · {formatMoney(appointment.priceCentsTotal, currency)}
                    </p>
                    {appointment.cancellationReason ? (
                      <p className="text-sm text-danger">
                        Cancelled: {appointment.cancellationReason}
                      </p>
                    ) : null}
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
                    onDeleted={(id) => {
                      setAppointments((current) =>
                        current.filter((item) => item.id !== id),
                      );
                      setMessage(
                        "The appointment was removed from the schedule.",
                      );
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {reloading ? (
        <p className="flex items-center gap-2 text-sm text-neutral-600">
          <Spinner /> Refreshing the day…
        </p>
      ) : null}

      <p className="text-xs text-neutral-500">
        Today only. Rescheduling an existing booking and the weekly calendar
        grid are tracked in the next milestone — this view covers booking,
        cancelling and closing appointments, which is what the daily dashboard
        needs.
      </p>
    </div>
  );
}
