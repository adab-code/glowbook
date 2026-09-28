import { z } from "zod";

const trimmed = z.string().trim();

export const emailSchema = trimmed
  .email("Enter a valid email address")
  .max(255);

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Passwords cannot exceed 128 characters");

export const registerSchema = z
  .object({
    studioName: trimmed
      .min(2, "Enter your studio name")
      .max(120, "Studio name cannot exceed 120 characters"),
    firstName: trimmed.min(1, "Enter your first name").max(80),
    lastName: trimmed.min(1, "Enter your last name").max(80),
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

// Not `.strict()`: both callers legitimately pass extra transport fields.
// Auth.js forwards `csrfToken` and `redirectTo` into the credentials provider,
// and the login form posts a hidden `from`. Strict mode rejected all three, so
// `authorize()` returned null and no one could ever sign in. Zod's default
// `strip` mode validates only the two declared fields and drops the rest.
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});

export const forgotPasswordSchema = z.object({ email: emailSchema }).strict();

export const resetPasswordSchema = z
  .object({
    token: trimmed.min(1, "Missing reset token"),
    password: passwordSchema,
    confirm: passwordSchema,
  })
  .strict()
  .refine((value) => value.password === value.confirm, {
    message: "Both passwords must match",
    path: ["confirm"],
  });

export const serviceSchema = z
  .object({
    name: trimmed
      .min(1, "Enter a service name")
      .max(120, "Service name cannot exceed 120 characters"),
    description: trimmed.max(2000).optional().or(z.literal("")),
    priceCents: z.coerce
      .number({ error: "Enter a price" })
      .int("Enter a whole amount")
      .min(0, "Price cannot be negative")
      .max(10_000_00, "Price looks too large"),
    durationMinutes: z.coerce
      .number({ error: "Enter a duration" })
      .int("Enter whole minutes")
      .min(1, "Duration must be at least 1 minute")
      .max(600, "Duration cannot exceed 10 hours"),
    isActive: z.coerce.boolean().default(true),
  })
  .strict();

// Kept as a plain object so both the create and the patch schemas can derive
// from it: Zod 4 refuses `.partial()` on an object that already carries a refine.
const clientFields = z
  .object({
    firstName: trimmed.min(1, "Enter a first name").max(80),
    lastName: trimmed.min(1, "Enter a last name").max(80),
    email: z.union([emailSchema, z.literal("")]).optional(),
    phone: trimmed.max(32).optional().or(z.literal("")),
    notes: trimmed.max(5000).optional().or(z.literal("")),
  })
  .strict();

const needsContact = (value: {
  email?: string | undefined;
  phone?: string | undefined;
}) => Boolean(value.email) || Boolean(value.phone);

export const clientSchema = clientFields.refine(needsContact, {
  message:
    "Add an email address or a phone number so you can reach this client",
  path: ["email"],
});

/** A patch may edit any single field, so contact details are only required together. */
export const clientPatchSchema = clientFields
  .partial()
  .extend({ isArchived: z.boolean().optional() })
  .refine(
    (value) =>
      value.isArchived !== undefined ||
      value.email === undefined ||
      value.phone === undefined ||
      needsContact(value),
    {
      message:
        "Add an email address or a phone number so you can reach this client",
      path: ["email"],
    },
  );

export const appointmentStatusSchema = z.enum([
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);

export const appointmentSchema = z
  .object({
    clientId: trimmed.uuid("Select a client"),
    serviceIds: z
      .array(trimmed.uuid())
      .min(1, "Select at least one service")
      .max(10, "An appointment cannot exceed 10 services"),
    startsAt: trimmed.min(1, "Pick a date and time"),
    staffUserId: trimmed.uuid().optional().or(z.literal("")),
    cancellationReason: trimmed.max(500).optional(),
  })
  .strict();

export const statusUpdateSchema = z
  .object({
    status: appointmentStatusSchema,
    cancellationReason: trimmed.max(500).optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.status !== "CANCELLED" || Boolean(value.cancellationReason),
    {
      message: "Add a short reason so the client history stays useful",
      path: ["cancellationReason"],
    },
  );

export const staffInviteSchema = z
  .object({
    email: emailSchema,
    role: z.enum(["OWNER", "STAFF"]).default("STAFF"),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;
export type StaffInviteInput = z.infer<typeof staffInviteSchema>;

/** Flatten a ZodError into `{ fieldName: message }` for the API error shape. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    result[key] ??= issue.message;
  }
  return result;
}
