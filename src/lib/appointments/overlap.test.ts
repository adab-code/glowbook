import { describe, expect, it } from "vitest";
import { isOverlapViolation } from "@/lib/appointments/overlap";

describe("isOverlapViolation", () => {
  it("matches the constraint name in any error message", () => {
    expect(
      isOverlapViolation(
        new Error(
          'Exclusion violation on "appointment_no_overlap" (SQLSTATE 23P01)',
        ),
      ),
    ).toBe(true);
  });

  it("matches Prisma and Postgres violation codes", () => {
    for (const code of ["P2002", "P2034", "23505", "23P01"]) {
      const error = new Error("write failed") as Error & { code: string };
      error.code = code;
      expect(isOverlapViolation(error)).toBe(true);
    }
  });

  it("ignores unrelated errors", () => {
    expect(isOverlapViolation(new Error("boom"))).toBe(false);
    expect(isOverlapViolation(null)).toBe(false);
    expect(isOverlapViolation({ code: "P2025" })).toBe(false);
  });
});
