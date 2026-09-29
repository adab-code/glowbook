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

export type ServiceFormValues = {
  id?: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  isActive: boolean;
};

const EMPTY: ServiceFormValues = {
  name: "",
  description: "",
  price: "",
  duration: "60",
  isActive: true,
};

export function ServiceForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: ServiceFormValues;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<ServiceFormValues>(initial ?? EMPTY);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?.id);

  function update<K extends keyof ServiceFormValues>(
    key: K,
    value: ServiceFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setFields({});

    // `Number("")` is 0, and the server accepts `priceCents` of 0 because a
    // free service is legitimate. That made a blank field indistinguishable
    // from a deliberate 0 and silently stored a $0.00 service. Catch the blank
    // case here, where we can still tell the user which field is wrong.
    if (values.price.trim() === "") {
      setFields({ priceCents: "Enter a price" });
      return;
    }

    setSaving(true);

    try {
      // The form speaks dollars/minutes; the API speaks integer cents.
      const priceCents = Math.round(Number(values.price) * 100);
      const payload = {
        name: values.name,
        description: values.description,
        priceCents,
        durationMinutes: Number(values.duration),
        isActive: values.isActive,
      };

      await apiFetch(
        isEdit ? `/api/services/${initial?.id}` : "/api/services",
        {
          method: isEdit ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );
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
        <CardTitle>{isEdit ? "Edit service" : "New service"}</CardTitle>
        <CardDescription>
          Prices are stored as whole cents so totals never drift.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormAlert message={message} />
          <FormRow>
            <FormField label="Name" error={fields.name}>
              {({ id, invalid, describedBy }) => (
                <Input
                  id={id}
                  value={values.name}
                  onChange={(event) => update("name", event.target.value)}
                  required
                  placeholder="Brow shaping"
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                />
              )}
            </FormField>
            <FormField label="Description" error={fields.description}>
              {({ id, invalid, describedBy }) => (
                <Textarea
                  id={id}
                  rows={3}
                  value={values.description}
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                  placeholder="Shape, tint and finish."
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                />
              )}
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Price (USD)"
                error={fields.priceCents}
                description="Whole dollars for now."
              >
                {({ id, invalid, describedBy }) => (
                  <Input
                    id={id}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    value={values.price}
                    onChange={(event) => update("price", event.target.value)}
                    required
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                  />
                )}
              </FormField>
              <FormField
                label="Duration (minutes)"
                error={fields.durationMinutes}
              >
                {({ id, invalid, describedBy }) => (
                  <Input
                    id={id}
                    type="number"
                    min="1"
                    step="5"
                    inputMode="numeric"
                    value={values.duration}
                    onChange={(event) => update("duration", event.target.value)}
                    required
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                  />
                )}
              </FormField>
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(event) => update("isActive", event.target.checked)}
                className="size-4 accent-brand-600"
              />
              Bookable right now
            </label>
          </FormRow>
          <div className="flex justify-end gap-2">
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add service"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
