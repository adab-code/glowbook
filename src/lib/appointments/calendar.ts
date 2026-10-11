import {
  addWallDays,
  toDateTimeLocalValue,
  zonedMonthBounds,
  zonedWeekBounds,
} from "@/lib/utils/datetime";

/** "2026-10-12" — the calendar-day key of an instant in the studio's zone. */
export function dayKeyOf(instant: Date, timeZone: string): string {
  return toDateTimeLocalValue(instant, timeZone).slice(0, 10);
}

export function groupByDay<T extends { startsAt: Date }>(
  items: T[],
  timeZone: string,
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = dayKeyOf(item.startsAt, timeZone);
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

export type MonthCell = {
  /** "2026-10-12" in the studio's zone. */
  key: string;
  /** Day-of-month number as shown in the cell. */
  dayNumber: number;
  /** False for the padding days borrowed from the adjacent months. */
  inMonth: boolean;
};

/**
 * Monday-first month grid for the studio month containing `anchor`. Every cell
 * is a studio-zone midnight (DST-safe: days are added on the calendar, and the
 * key is read back through the zone).
 */
export function monthGrid(anchor: Date, timeZone: string): MonthCell[][] {
  const monthStart = zonedMonthBounds(anchor, timeZone);
  const monthEnd = zonedMonthBounds(anchor, timeZone, true);
  const monthStartKey = dayKeyOf(monthStart, timeZone);

  let cursor = zonedWeekBounds(monthStart, timeZone);
  const weeks: MonthCell[][] = [];
  while (cursor < monthEnd) {
    const week: MonthCell[] = [];
    for (let i = 0; i < 7; i++) {
      const key = dayKeyOf(cursor, timeZone);
      week.push({
        key,
        dayNumber: Number(key.slice(8, 10)),
        inMonth: key >= monthStartKey && cursor < monthEnd,
      });
      cursor = addWallDays(cursor, timeZone, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/** The seven studio-zone midnights of the week containing `anchor` (Monday-first). */
export function weekDays(anchor: Date, timeZone: string): Date[] {
  const start = zonedWeekBounds(anchor, timeZone);
  return Array.from({ length: 7 }, (_, i) => addWallDays(start, timeZone, i));
}
