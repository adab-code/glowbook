import { describe, expect, it } from "vitest";
import {
  formatDayLabel,
  formatMoney,
  formatTime,
  fullName,
  shortId,
} from "@/lib/utils/format";

describe("formatMoney", () => {
  it("formats integer cents as currency", () => {
    expect(formatMoney(5000, "USD")).toBe("$50.00");
    expect(formatMoney(0, "USD")).toBe("$0.00");
  });
});

describe("studio-zone formatting", () => {
  // 2026-09-30 15:45 UTC is 09:45 in Boise (MDT).
  const instant = new Date("2026-09-30T15:45:00Z");

  it("renders times in the studio zone, not the server zone", () => {
    expect(formatTime(instant, "America/Boise")).toBe("9:45 AM");
  });

  it("renders day labels in the studio zone", () => {
    expect(formatDayLabel(instant, "America/Boise")).toBe("Wed, Sep 30");
  });

  it("accepts ISO strings as well as Dates (route-handler JSON)", () => {
    // Client-side reloads through apiFetch hand formatters date strings, not
    // Date objects (RSC preserves Dates; JSON does not). Before the coercion
    // guard this crashed the appointments list with "Invalid time value".
    expect(formatTime("2026-09-30T15:45:00.000Z", "America/Boise")).toBe(
      "9:45 AM",
    );
    expect(formatDayLabel("2026-09-30T15:45:00.000Z", "America/Boise")).toBe(
      "Wed, Sep 30",
    );
  });
});

describe("names and ids", () => {
  it("joins first and last names", () => {
    expect(fullName({ firstName: "Ana", lastName: "Ruiz" })).toBe("Ana Ruiz");
  });

  it("shortens a UUID to its first 8 characters", () => {
    expect(shortId("123e4567-e89b-12d3-a456-426614174000")).toBe("123e4567");
  });
});
