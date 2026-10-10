import { describe, expect, it } from "vitest";
import {
  STAFF_INVITE_TTL_MS,
  generateToken,
  hashToken,
} from "@/lib/utils/tokens";

describe("generateToken", () => {
  it("returns 64 hex characters (256 bits) by default", () => {
    expect(generateToken()).toMatch(/^[0-9a-f]{64}$/);
  });

  it("never repeats", () => {
    expect(generateToken()).not.toBe(generateToken());
  });
});

describe("hashToken", () => {
  it("is deterministic and keyed by input", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
    expect(hashToken("abc")).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
  });
});

describe("token TTLs", () => {
  it("keeps invites at 7 days", () => {
    expect(STAFF_INVITE_TTL_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
