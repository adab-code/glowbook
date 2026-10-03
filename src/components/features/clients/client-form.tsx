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
import { Input, Textarea } from "@/components/ui/input";
import { apiFetch, toFieldErrors, toMessage } from "@/lib/utils/api-client";

export type ClientFormValues = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
};

const EMPTY: ClientFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
};

export function ClientForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: ClientFormValues;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<ClientFormValues>(initial ?? EMPTY);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?.id);

  function update<K extends keyof ClientFormValues>(
    key: K,
    value: ClientFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setFields({});

    try {
      // `id` is the record's own identity, not an editable field. `clientPatchSchema`
      // is `.strict()`, so sending it back makes Zod reject the whole request with
      // `Unrecognized key: "id"` and every edit 400s. The path already carries it.
      const { id: _ignored, ...payload } = values;
      void _ignored;

      await apiFetch(isEdit ? `/api/clients/${initial?.id}` : "/api/clients", {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      onDone();
    } catch (error) {
      setFields(toFieldErrors(error));
      setMessage(toMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit client" : "New client"}</CardTitle>
        <CardDescription>
          Notes are visible to your team only and survive archiving.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormAlert message={message} fields={fields} />
          <FormRow>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="First name" error={fields.firstName}>
                {({ id, invalid, describedBy }) => (
                  <Input
                    id={id}
                    value={values.firstName}
                    onChange={(event) =>
                      update("firstName", event.target.value)
                    }
                    required
                    autoComplete="given-name"
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                  />
                )}
              </FormField>
              <FormField label="Last name" error={fields.lastName}>
                {({ id, invalid, describedBy }) => (
                  <Input
                    id={id}
                    value={values.lastName}
                    onChange={(event) => update("lastName", event.target.value)}
                    required
                    autoComplete="family-name"
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                  />
                )}
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Email"
                error={fields.email}
                description="An email or a phone number is required."
              >
                {({ id, invalid, describedBy }) => (
                  <Input
                    id={id}
                    type="email"
                    value={values.email}
                    onChange={(event) => update("email", event.target.value)}
                    autoComplete="email"
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                  />
                )}
              </FormField>
              <FormField label="Phone" error={fields.phone}>
                {({ id, invalid, describedBy }) => (
                  <Input
                    id={id}
                    type="tel"
                    value={values.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    autoComplete="tel"
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                  />
                )}
              </FormField>
            </div>
            <FormField
              label="Notes"
              error={fields.notes}
              description="Allergies, preferences, anything worth remembering."
            >
              {({ id, invalid, describedBy }) => (
                <Textarea
                  id={id}
                  rows={4}
                  value={values.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                />
              )}
            </FormField>
          </FormRow>
          <div className="flex justify-end gap-2">
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add client"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
