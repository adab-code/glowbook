import Link from "next/link";
import { formatTime, fullName } from "@/lib/utils/format";
import type { MonthCell } from "@/lib/appointments/calendar";
import type { AppointmentWithRelations } from "@/lib/appointments/types";

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Server-rendered month grid: day numbers plus the first two bookings a day. */
export function MonthView({
  weeks,
  groups,
  timeZone,
}: {
  weeks: MonthCell[][];
  groups: Map<string, AppointmentWithRelations[]>;
  timeZone: string;
}) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-1" aria-hidden>
        {WEEKDAY_HEADERS.map((day) => (
          <p
            key={day}
            className="px-1 py-1 text-center text-xs font-medium text-neutral-600"
          >
            {day}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((cell) => {
          const items = groups.get(cell.key) ?? [];
          return (
            <Link
              key={cell.key}
              href={`/appointments?view=day&date=${cell.key}`}
              aria-label={`${cell.key}, ${items.length} appointment${items.length === 1 ? "" : "s"}`}
              className={`min-h-16 rounded-[var(--radius-control)] border px-1 py-1 sm:min-h-20 ${
                cell.inMonth
                  ? "border-neutral-200 bg-white hover:border-brand-300"
                  : "border-transparent bg-neutral-100 text-neutral-500"
              }`}
            >
              <span
                className={`block text-xs font-medium tabular-nums ${
                  cell.inMonth ? "text-neutral-900" : "text-neutral-500"
                }`}
              >
                {cell.dayNumber}
              </span>
              <span className="mt-0.5 hidden space-y-0.5 sm:block">
                {items.slice(0, 2).map((appointment) => (
                  <span
                    key={appointment.id}
                    className="block truncate text-[11px] text-neutral-600"
                  >
                    {formatTime(appointment.startsAt, timeZone)}{" "}
                    {fullName(appointment.client)}
                  </span>
                ))}
                {items.length > 2 ? (
                  <span className="block text-[11px] font-medium text-brand-700">
                    +{items.length - 2} more
                  </span>
                ) : null}
              </span>
              {items.length > 0 ? (
                <span aria-hidden className="mt-1 flex gap-0.5 sm:hidden">
                  {items.slice(0, 3).map((appointment) => (
                    <span
                      key={appointment.id}
                      className="size-1.5 rounded-full bg-brand-500"
                    />
                  ))}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
