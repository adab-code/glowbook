"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormAlert, FormField, FormRow } from "@/components/shared/form-field";
import { apiFetch, toFieldErrors, toMessage } from "@/lib/utils/api-client";

/**
 * Owner-only studio settings (FR profiles / management): name, timezone and
 * currency. Timezone ships as a datalist over the runtime's full IANA list so
 * the input stays a plain text field but only real zones are offered; the
 * server re-validates with `settingsSchema` either way.
 *
 * After a successful PATCH the client session is refreshed with
 * `useSession().update()` (see the `jwt` callback in `src/auth.ts`) and the
 * route is re-rendered, so the sidebar and dashboard pick up the new values
 * without a sign-out.
 */
export function SettingsForm({
  initial,
  timeZones,
}: {
  initial: { studioName: string; timezone: string; currency: string };
  timeZones: string[];
}) {
  const router = useRouter();
  const { update } = useSession();
  const [studioName, setStudioName] = useState(initial.studioName);
  const [timezone, setTimezone] = useState(initial.timezone);
  const [currency, setCurrency] = useState(initial.currency);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setFields({});
    try {
      const result = await apiFetch<{
        data: { studioName: string; timezone: string; currency: string };
      }>("/api/account", {
        method: "PATCH",
        body: JSON.stringify({ studioName, timezone, currency }),
      });
      // Refresh the JWT cookie with the saved values, then re-render the
      // server components (sidebar branding, dashboard bounds) on them.
      await update({
        studioName: result.data.studioName,
        timezone: result.data.timezone,
        currency: result.data.currency,
      });
      setMessage("Settings saved.");
      router.refresh();
    } catch (error) {
      setFields(toFieldErrors(error));
      setMessage(toMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={message} fields={fields} />
      <FormRow>
        <FormField label="Studio name" error={fields.studioName}>
          {({ id, invalid, describedBy }) => (
            <Input
              id={id}
              value={studioName}
              onChange={(event) => setStudioName(event.target.value)}
              maxLength={120}
              required
              aria-invalid={invalid}
              aria-describedby={describedBy}
            />
          )}
        </FormField>
        <FormField
          label="Timezone"
          error={fields.timezone}
          description="Day and week boundaries everywhere in the app follow this zone."
        >
          {({ id, invalid, describedBy }) => (
            <>
              <Input
                id={id}
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                list="settings-timezones"
                maxLength={64}
                required
                aria-invalid={invalid}
                aria-describedby={describedBy}
              />
              <datalist id="settings-timezones">
                {timeZones.map((zone) => (
                  <option key={zone} value={zone} />
                ))}
              </datalist>
            </>
          )}
        </FormField>
        <FormField
          label="Currency"
          error={fields.currency}
          description="Three-letter code, for example USD. Prices everywhere are formatted in it."
        >
          {({ id, invalid, describedBy }) => (
            <Input
              id={id}
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value.toUpperCase())
              }
              maxLength={3}
              required
              aria-invalid={invalid}
              aria-describedby={describedBy}
            />
          )}
        </FormField>
      </FormRow>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
