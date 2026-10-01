"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormAlert, FormField, FormRow } from "@/components/shared/form-field";
import { Input, Select } from "@/components/ui/input";
import { apiFetch, toFieldErrors, toMessage } from "@/lib/utils/api-client";
import { formatMoney } from "@/lib/utils/format";

type Option = { id: string; label: string; sublabel?: string };

export type AppointmentFormProps = {
  clients: Option[];
  services: (Option & { priceCents: number; durationMinutes: number })[];
  staff: Option[];
  currency: string;
  /** Pre-filled start, in the studio's wall clock. Defaults to the next half hour. */
  defaultStartsAt?: string;
  onDone: () => void;
  onCancel?: () => void;
};

function nextHalfHour(): string {
  const now = new Date(Date.now() + 30 * 60_000);
  now.setMinutes(now.getMinutes() > 30 ? 60 : 30, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function AppointmentForm({
  clients,
  services,
  staff,
  currency,
  defaultStartsAt,
  onDone,
  onCancel,
}: AppointmentFormProps) {
  const [clientId, setClientId] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState(defaultStartsAt ?? nextHalfHour());
  const [staffUserId, setStaffUserId] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const chosen = services.filter((service) => serviceIds.includes(service.id));
  const totalMinutes = chosen.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalCents = chosen.reduce((sum, s) => sum + s.priceCents, 0);

  function toggleService(id: string) {
    setServiceIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setFields({});

    try {
      await apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          clientId,
          serviceIds,
          startsAt,
          staffUserId,
        }),
      });
      onDone();
    } catch (error) {
      // A 409 carries its explanation on `fields.startsAt`, so the slot input lights up
      // rather than the clash being an anonymous banner (FR-021).
      setFields(toFieldErrors(error));
      setMessage(toMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book an appointment</CardTitle>
        <CardDescription>
          The end time and the total are worked out from the services you pick,
          so they can never be entered by mistake.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormAlert message={message} fields={fields} />
          <FormRow>
            <FormField label="Client" error={fields.clientId}>
              {({ id, invalid, describedBy }) => (
                <Select
                  id={id}
                  value={clientId}
                  onChange={(event) => setClientId(event.target.value)}
                  required
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                >
                  <option value="">Choose a client…</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.label}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>

            <FormField
              label="Services"
              error={fields.serviceIds}
              description="Pick every service this visit needs. The total duration and price follow."
            >
              {({ id, invalid, describedBy }) => (
                <fieldset
                  id={id}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  className="space-y-1 rounded-[var(--radius-control)] border border-neutral-300 p-3"
                >
                  <legend className="sr-only">Services</legend>
                  {services.length === 0 ? (
                    <p className="text-sm text-neutral-600">
                      You have no bookable services yet. Add one on the Services
                      page.
                    </p>
                  ) : (
                    services.map((service) => (
                      <label
                        key={service.id}
                        className="flex cursor-pointer items-start gap-2.5 py-1 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={serviceIds.includes(service.id)}
                          onChange={() => toggleService(service.id)}
                          className="mt-0.5 size-4 accent-brand-600"
                        />
                        <span className="flex-1">
                          <span className="block text-neutral-800">
                            {service.label}
                          </span>
                          <span className="block text-xs text-neutral-500">
                            {service.durationMinutes} min ·{" "}
                            {formatMoney(service.priceCents, currency)}
                          </span>
                        </span>
                      </label>
                    ))
                  )}
                </fieldset>
              )}
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Starts at"
                error={fields.startsAt}
                description="In your studio's timezone."
              >
                {({ id, invalid, describedBy }) => (
                  <Input
                    id={id}
                    type="datetime-local"
                    value={startsAt}
                    onChange={(event) => setStartsAt(event.target.value)}
                    required
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                  />
                )}
              </FormField>
              <FormField
                label="Team member"
                error={fields.staffUserId}
                description="Optional. Leave empty if nobody is assigned yet."
              >
                {({ id, invalid, describedBy }) => (
                  <Select
                    id={id}
                    value={staffUserId}
                    onChange={(event) => setStaffUserId(event.target.value)}
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                  >
                    <option value="">Unassigned</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.label}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
            </div>

            {chosen.length > 0 ? (
              <p className="rounded-[var(--radius-control)] bg-muted px-3 py-2 text-sm text-neutral-700">
                {chosen.length} service{chosen.length === 1 ? "" : "s"} ·{" "}
                {totalMinutes} min · {formatMoney(totalCents, currency)}
              </p>
            ) : null}
          </FormRow>

          <div className="flex justify-end gap-2">
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={saving || chosen.length === 0}>
              {saving ? "Booking…" : "Book appointment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export { nextHalfHour };
