import { describe, expect, it } from "vitest";
import {
  fromDateTimeLocalValue,
  instantFromWallClock,
  toDateTimeLocalValue,
  zonedDayBounds,
  zonedWeekBounds,
} from "@/lib/utils/datetime";

// America/Boise is UTC-6 (MDT) in September and UTC-7 (MST) in winter.
// US DST 2026: forward on March 8, back on November 1.

describe("zonedDayBounds", () => {
  it("returns midnight of the studio day as a UTC instant", () => {
    // Wednesday 2026-09-30 12:00 UTC is 06:00 in Boise (MDT).
    const noon = new Date("2026-09-30T12:00:00Z");
    expect(zonedDayBounds(noon, "America/Boise").toISOString()).toBe(
      "2026-09-30T06:00:00.000Z",
    );
    expect(zonedDayBounds(noon, "America/Boise", true).toISOString()).toBe(
      "2026-10-01T06:00:00.000Z",
    );
  });

  it("follows the server zone, never the studio zone", () => {
    // The same calendar day asserted twice: once interpreted in UTC and once
    // in a zone 13 hours ahead. Both must resolve to the same Boise midnight,
    // which fails if the implementation ever uses `new Date(y, m, d)`.
    const utcNoon = new Date("2026-09-30T12:00:00Z");
    const tokyoMorning = new Date("2026-09-30T01:00:00Z"); // 10:00 in Tokyo, still Sep 29 in Boise
    expect(zonedDayBounds(utcNoon, "America/Boise").getTime()).toBe(
      Date.UTC(2026, 8, 30, 6, 0, 0),
    );
    expect(zonedDayBounds(tokyoMorning, "America/Boise").getTime()).toBe(
      Date.UTC(2026, 8, 29, 6, 0, 0),
    );
  });

  it("spans 23 hours across the spring-forward transition", () => {
    const day = new Date("2026-03-08T12:00:00Z");
    const start = zonedDayBounds(day, "America/Boise");
    const end = zonedDayBounds(day, "America/Boise", true);
    expect(start.toISOString()).toBe("2026-03-08T07:00:00.000Z"); // MST
    expect(end.toISOString()).toBe("2026-03-09T06:00:00.000Z"); // MDT
    expect(end.getTime() - start.getTime()).toBe(23 * 3_600_000);
  });

  it("spans 25 hours across the fall-back transition", () => {
    const day = new Date("2026-11-01T12:00:00Z");
    const start = zonedDayBounds(day, "America/Boise");
    const end = zonedDayBounds(day, "America/Boise", true);
    expect(start.toISOString()).toBe("2026-11-01T06:00:00.000Z"); // MDT
    expect(end.toISOString()).toBe("2026-11-02T07:00:00.000Z"); // MST
    expect(end.getTime() - start.getTime()).toBe(25 * 3_600_000);
  });
});

describe("zonedWeekBounds", () => {
  it("returns the studio Monday-to-Sunday week as UTC instants", () => {
    // Wednesday 2026-09-30: week runs Mon Sep 28 → Mon Oct 5 (MDT).
    const wednesday = new Date("2026-09-30T12:00:00Z");
    expect(zonedWeekBounds(wednesday, "America/Boise", 1).toISOString()).toBe(
      "2026-09-28T06:00:00.000Z",
    );
    expect(
      zonedWeekBounds(wednesday, "America/Boise", 1, true).toISOString(),
    ).toBe("2026-10-05T06:00:00.000Z");
  });
});

describe("datetime-local roundtrip", () => {
  it("serialises a UTC instant to the studio wall clock and back", () => {
    const instant = new Date("2026-09-30T15:45:00Z");
    const value = toDateTimeLocalValue(instant, "America/Boise");
    expect(value).toBe("2026-09-30T09:45");
    expect(fromDateTimeLocalValue(value, "America/Boise")?.getTime()).toBe(
      instant.getTime(),
    );
  });

  it("rejects unparseable values with null instead of an Invalid Date", () => {
    expect(fromDateTimeLocalValue("not-a-date", "America/Boise")).toBeNull();
    expect(
      fromDateTimeLocalValue("2026-13-01T09:00", "America/Boise"),
    ).toBeNull();
    expect(
      fromDateTimeLocalValue("2026-09-30T25:00", "America/Boise"),
    ).toBeNull();
    expect(fromDateTimeLocalValue("", "America/Boise")).toBeNull();
  });
});

describe("instantFromWallClock", () => {
  it("resolves a wall clock to the matching UTC instant", () => {
    const instant = instantFromWallClock(
      { year: 2026, month: 9, day: 30, hour: 9, minute: 45, second: 0 },
      "America/Boise",
    );
    expect(instant.toISOString()).toBe("2026-09-30T15:45:00.000Z");
  });
});
