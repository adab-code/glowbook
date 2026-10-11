"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormAlert, FormField, FormRow } from "@/components/shared/form-field";
import { Input } from "@/components/ui/input";
import { apiFetch, toFieldErrors, toMessage } from "@/lib/utils/api-client";

/** Move one booking to another slot. Overlap failures surface on the field. */
export function RescheduleForm({
  appointmentId,
  currentStartsAt,
  onDone,
  onCancel,
}: {
  appointmentId: string;
  /** Pre-filled start, in the studio's wall clock (`YYYY-MM-DDTHH:mm`). */
  currentStartsAt: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [startsAt, setStartsAt] = useState(currentStartsAt);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setFields({});

    try {
      await apiFetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        body: JSON.stringify({ startsAt }),
      });
      onDone();
    } catch (error) {
      // A 409 carries its explanation on `fields.startsAt`, same as booking.
      setFields(toFieldErrors(error));
      setMessage(toMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Move appointment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormAlert message={message} fields={fields} />
          <FormRow>
            <FormField
              label="New date and time"
              error={fields.startsAt}
              description="In your studio's timezone. The end time follows from the services."
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
          </FormRow>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Keep as is
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Moving…" : "Move appointment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
