/**
 * Studio-local date arithmetic.
 *
 * The server does not know the studio's wall clock: it runs in UTC, and Render
 * defaults to UTC too. `Account.timezone` is the only place the studio's zone lives,
 * so every "today", "this week" or `<input type="datetime-local">` value has to be
 * resolved through it. Doing this with `new Date(y, m, d)` would silently use the
 * server's zone, which is how the dashboard ended up counting a Boise day as a
 * different day and reporting revenue for appointments that had not happened yet.
 *
 * The technique is the standard inverse of `Intl.DateTimeFormat`: format the instant
 * in the target zone, read the wall-clock fields back as if they were UTC, and
 * subtract the zone's offset. Offsets are resolved twice so boundaries stay correct
 * on the day a DST transition happens.
 */

type WallClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const PARTS_CACHE = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = PARTS_CACHE.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    PARTS_CACHE.set(timeZone, formatter);
  }
  return formatter;
}

function wallClockOf(date: Date, timeZone: string): WallClock {
  const parts = partsFormatter(timeZone).formatToParts(date);
  const read = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  };
}

/** Milliseconds to add to a UTC instant to read it as the zone's wall clock. */
function offsetMsAt(date: Date, timeZone: string): number {
  const wall = wallClockOf(date, timeZone);
  return (
    Date.UTC(
      wall.year,
      wall.month - 1,
      wall.day,
      wall.hour,
      wall.minute,
      wall.second,
    ) - date.getTime()
  );
}

function asUtc(wall: WallClock): number {
  return Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
  );
}

/** Turn a studio-local wall clock into the UTC instant it names. */
export function instantFromWallClock(wall: WallClock, timeZone: string): Date {
  const naive = asUtc(wall);
  let instant = naive - offsetMsAt(new Date(naive), timeZone);
  instant = naive - offsetMsAt(new Date(instant), timeZone);
  return new Date(instant);
}

/**
 * Midnight of the studio's calendar day containing `date`, as a UTC instant.
 * `endOfDay` returns the exclusive start of the next day, so every range query can
 * use `gte`/`lt` and never has to add a day to a boundary.
 */
export function zonedDayBounds(
  date: Date,
  timeZone: string,
  endOfDay = false,
): Date {
  const wall = wallClockOf(date, timeZone);
  const target = endOfDay ? wall.day + 1 : wall.day;

  // Day 32 of the month is invalid in Date, so roll the overflow by hand.
  const shifted = new Date(Date.UTC(wall.year, wall.month - 1, target));
  return instantFromWallClock(
    {
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth() + 1,
      day: shifted.getUTCDate(),
      hour: 0,
      minute: 0,
      second: 0,
    },
    timeZone,
  );
}

/** First day of the studio's week containing `date`. `firstDayOfWeek` 0 = Sunday. */
export function zonedWeekBounds(
  date: Date,
  timeZone: string,
  firstDayOfWeek = 1,
  endOfWeek = false,
): Date {
  const wall = wallClockOf(date, timeZone);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);

  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const index = names.indexOf(weekday);
  const current = index === -1 ? 0 : index;

  // The end is the *start of the next week*, so it advances seven calendar days in
  // the studio's zone rather than 7 × 24h of absolute time. Adding 168h to the start
  // instead would land on the previous Sunday across a DST transition.
  const toWeekStart = (current - firstDayOfWeek + 7) % 7;
  const shifted = new Date(
    Date.UTC(
      wall.year,
      wall.month - 1,
      wall.day - toWeekStart + (endOfWeek ? 7 : 0),
    ),
  );

  return instantFromWallClock(
    {
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth() + 1,
      day: shifted.getUTCDate(),
      hour: 0,
      minute: 0,
      second: 0,
    },
    timeZone,
  );
}

/** "2026-09-30T14:30" — the value shape `<input type="datetime-local">` expects. */
export function toDateTimeLocalValue(date: Date, timeZone: string): string {
  const wall = wallClockOf(date, timeZone);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${wall.year}-${pad(wall.month)}-${pad(wall.day)}T${pad(wall.hour)}:${pad(wall.minute)}`;
}

/**
 * Inverse of {@link toDateTimeLocalValue}: read a `datetime-local` value as the
 * studio's wall clock. Returns `null` for unparseable input so callers can show a
 * field error instead of persisting an Invalid Date.
 */
export function fromDateTimeLocalValue(
  value: string,
  timeZone: string,
): Date | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
      value.trim(),
    );
  if (!match) return null;

  const [, year, month, day, hour, minute, second] = match;
  const wall = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second ?? 0),
  };

  if (wall.month < 1 || wall.month > 12 || wall.day < 1 || wall.day > 31) {
    return null;
  }
  if (wall.hour > 23 || wall.minute > 59 || wall.second > 59) return null;

  const instant = instantFromWallClock(wall, timeZone);
  return Number.isNaN(instant.getTime()) ? null : instant;
}
