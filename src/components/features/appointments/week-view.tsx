import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { dayKeyOf } from "@/lib/appointments/calendar";
import { formatDayLabel, formatTime, fullName } from "@/lib/utils/format";
import type { AppointmentWithRelations } from "@/lib/appointments/types";

/** Server-rendered week grid: seven studio-zone days, Monday-first. */
export function WeekView({
  days,
  groups,
  timeZone,
}: {
  days: Date[];
  groups: Map<string, AppointmentWithRelations[]>;
  timeZone: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
      {days.map((day) => {
        const key = dayKeyOf(day, timeZone);
        const items = groups.get(key) ?? [];
        return (
          <Card key={key}>
            <CardContent className="space-y-2 p-3">
              <Link
                href={`/appointments?view=day&date=${key}`}
                className="block font-medium text-neutral-900 underline-offset-2 hover:underline"
              >
                {formatDayLabel(day, timeZone)}
              </Link>
              {items.length === 0 ? (
                <p className="text-xs text-neutral-600">Free</p>
              ) : (
                <ul className="space-y-2">
                  {items.map((appointment) => (
                    <li key={appointment.id} className="space-y-0.5 text-xs">
                      <span className="block font-medium tabular-nums text-neutral-900">
                        {formatTime(appointment.startsAt, timeZone)}
                      </span>
                      <span className="block truncate text-neutral-600">
                        {fullName(appointment.client)}
                      </span>
                      <StatusBadge status={appointment.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
