import { describe, expect, it } from "vitest";
import {
  appointmentSchema,
  clientPatchSchema,
  clientSchema,
  inviteAcceptSchema,
  loginSchema,
  serviceSchema,
  settingsSchema,
  staffInviteSchema,
  statusUpdateSchema,
} from "@/lib/validations/schemas";

const SERVICE_ID = "123e4567-e89b-12d3-a456-426614174000";
const CLIENT_ID = "123e4567-e89b-12d3-a456-426614174001";

const validService = {
  name: "Classic lashes",
  priceCents: 5000,
  durationMinutes: 45,
};

describe("serviceSchema", () => {
  it("accepts a complete service and defaults isActive to true", () => {
    const parsed = serviceSchema.safeParse(validService);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.isActive).toBe(true);
  });

  it("rejects a blank price instead of coercing it to $0.00", () => {
    // Regression (W03): z.coerce.number() turned "" and null into 0, so a
    // cleared price field silently created a free service.
    expect(
      serviceSchema.safeParse({ ...validService, priceCents: "" }).success,
    ).toBe(false);
    expect(
      serviceSchema.safeParse({ ...validService, priceCents: null }).success,
    ).toBe(false);
  });

  it('parses the string "false" as false for isActive', () => {
    // Regression (W03): Boolean("false") is true, so the flag could never be
    // turned off through a form value.
    const parsed = serviceSchema.safeParse({
      ...validService,
      isActive: "false",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.isActive).toBe(false);
  });
});

describe("clientSchema", () => {
  it("requires at least one contact method", () => {
    expect(
      clientSchema.safeParse({ firstName: "Ana", lastName: "Ruiz" }).success,
    ).toBe(false);
    expect(
      clientSchema.safeParse({
        firstName: "Ana",
        lastName: "Ruiz",
        phone: "555-0100",
      }).success,
    ).toBe(true);
  });

  it("rejects a patch that clears the last contact method", () => {
    // Regression (W04): the guard short-circuited on `email === undefined`,
    // so `{ email: "" }` sailed through and left the client unreachable.
    expect(clientPatchSchema.safeParse({ email: "" }).success).toBe(false);
    expect(
      clientPatchSchema.safeParse({ notes: "Allergic to latex" }).success,
    ).toBe(true);
  });
});

describe("appointmentSchema", () => {
  const validBooking = {
    clientId: CLIENT_ID,
    serviceIds: [SERVICE_ID],
    startsAt: "2026-10-01T09:00",
  };

  it("accepts a booking with client, services and start time", () => {
    expect(appointmentSchema.safeParse(validBooking).success).toBe(true);
  });

  it("refuses server-derived fields from the client", () => {
    // endsAt and priceCentsTotal are recomputed on every write; accepting
    // them would let a caller forge durations and totals.
    expect(
      appointmentSchema.safeParse({
        ...validBooking,
        endsAt: "2026-10-01T09:15",
      }).success,
    ).toBe(false);
    expect(
      appointmentSchema.safeParse({ ...validBooking, priceCentsTotal: 1 })
        .success,
    ).toBe(false);
  });

  it("requires at least one service", () => {
    expect(
      appointmentSchema.safeParse({ ...validBooking, serviceIds: [] }).success,
    ).toBe(false);
  });
});

describe("statusUpdateSchema", () => {
  it("requires a reason to cancel", () => {
    expect(statusUpdateSchema.safeParse({ status: "CANCELLED" }).success).toBe(
      false,
    );
    expect(
      statusUpdateSchema.safeParse({
        status: "CANCELLED",
        cancellationReason: "Client called to reschedule",
      }).success,
    ).toBe(true);
  });
});

describe("settingsSchema", () => {
  it("accepts a complete studio update and normalises the currency", () => {
    const parsed = settingsSchema.safeParse({
      studioName: "Glow Studio",
      timezone: "America/Boise",
      currency: "usd",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.currency).toBe("USD");
  });

  it("rejects unknown timezones and malformed currency codes", () => {
    expect(
      settingsSchema.safeParse({
        studioName: "Glow Studio",
        timezone: "Mars/Olympus",
        currency: "USD",
      }).success,
    ).toBe(false);
    expect(
      settingsSchema.safeParse({
        studioName: "Glow Studio",
        timezone: "America/Boise",
        currency: "US",
      }).success,
    ).toBe(false);
  });

  it("is strict: unknown keys are rejected, not stripped", () => {
    expect(
      settingsSchema.safeParse({
        studioName: "Glow Studio",
        timezone: "America/Boise",
        currency: "USD",
        role: "OWNER",
      }).success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("strips Auth.js transport fields instead of rejecting them", () => {
    // Auth.js forwards csrfToken/redirectTo into the credentials provider;
    // strict mode rejected them and nobody could sign in.
    const parsed = loginSchema.safeParse({
      email: "owner@glowbook.dev",
      password: "password123",
      csrfToken: "transport-noise",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({
        email: "owner@glowbook.dev",
        password: "password123",
      });
    }
  });
});

describe("staffInviteSchema", () => {
  it("defaults the role to STAFF", () => {
    const parsed = staffInviteSchema.safeParse({
      email: "teammate@studio.com",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.role).toBe("STAFF");
  });

  it("rejects malformed emails and unknown roles", () => {
    expect(staffInviteSchema.safeParse({ email: "not-an-email" }).success).toBe(
      false,
    );
    expect(
      staffInviteSchema.safeParse({ email: "a@b.co", role: "ADMIN" }).success,
    ).toBe(false);
  });
});

describe("inviteAcceptSchema", () => {
  const validAccept = {
    token: "raw-invite-token",
    firstName: "Cierra",
    lastName: "Vega",
    password: "password123",
    confirm: "password123",
  };

  it("accepts a matching password pair", () => {
    expect(inviteAcceptSchema.safeParse(validAccept).success).toBe(true);
  });

  it("rejects mismatched passwords and a missing token", () => {
    expect(
      inviteAcceptSchema.safeParse({ ...validAccept, confirm: "other1234" })
        .success,
    ).toBe(false);
    expect(
      inviteAcceptSchema.safeParse({ ...validAccept, token: " " }).success,
    ).toBe(false);
  });
});
