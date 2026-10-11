import { describe, expect, it } from "vitest";
import {
  dayKeyOf,
  groupByDay,
  monthGrid,
  weekDays,
} from "@/lib/appointments/calendar";

const ZONE = "America/Boise";

describe("dayKeyOf", () => {
  it("reads the studio-zone calendar day off an instant", () => {
    // 06:30 UTC is still Sep 29 in Boise (MDT).
    expect(dayKeyOf(new Date("2026-09-30T05:30:00Z"), ZONE)).toBe("2026-09-29");
    expect(dayKeyOf(new Date("2026-09-30T06:30:00Z"), ZONE)).toBe("2026-09-30");
  });
});

describe("groupByDay", () => {
  it("buckets items by their studio-zone day", () => {
    const groups = groupByDay(
      [
        { startsAt: new Date("2026-10-12T15:00:00Z") },
        { startsAt: new Date("2026-10-12T18:00:00Z") },
        { startsAt: new Date("2026-10-13T15:00:00Z") },
      ],
      ZONE,
    );
    expect([...groups.keys()]).toEqual(["2026-10-12", "2026-10-13"]);
    expect(groups.get("2026-10-12")).toHaveLength(2);
  });
});

describe("weekDays", () => {
  it("returns the Monday-first week containing the anchor", () => {
    // Wednesday 2026-09-30.
    const days = weekDays(new Date("2026-09-30T12:00:00Z"), ZONE);
    expect(days).toHaveLength(7);
    expect(days.map((day) => dayKeyOf(day, ZONE))).toEqual([
      "2026-09-28",
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
    ]);
  });
});

describe("monthGrid", () => {
  it("covers September 2026 in five Monday-first rows with padding", () => {
    // Sep 1 2026 is a Tuesday, so the grid opens on Mon Aug 31.
    const grid = monthGrid(new Date("2026-09-15T12:00:00Z"), ZONE);
    expect(grid).toHaveLength(5);
    for (const week of grid) expect(week).toHaveLength(7);
    expect(grid[0][0]).toMatchObject({
      key: "2026-08-31",
      dayNumber: 31,
      inMonth: false,
    });
    expect(grid[0][1]).toMatchObject({ key: "2026-09-01", inMonth: true });
    const last = grid[4][6];
    expect(last).toMatchObject({ key: "2026-10-04", inMonth: false });
  });

  it("spans six rows when the month needs them", () => {
    // Aug 1 2026 is a Saturday: Mon Jul 27 … Sun Sep 6.
    const grid = monthGrid(new Date("2026-08-15T12:00:00Z"), ZONE);
    expect(grid).toHaveLength(6);
    expect(grid[0][0].key).toBe("2026-07-27");
    expect(grid[5][6].key).toBe("2026-09-06");
  });
});
