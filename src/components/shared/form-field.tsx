"use client";

import { useId, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/format";

type FieldRenderProps = {
  id: string;
  invalid: boolean;
  describedBy?: string;
};

type FormFieldProps = {
  label: string;
  error?: string;
  description?: string;
  children: (props: FieldRenderProps) => ReactNode;
};

/**
 * Wires a visible label, an optional description, and an error message to a single
 * control via id / aria-describedby, so every form in the app is accessible the
 * same way without repeating the plumbing.
 */
export function FormField({
  label,
  error,
  description,
  children,
}: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;
  const describedBy =
    [error ? errorId : null, description ? descriptionId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children({ id, invalid: Boolean(error), describedBy })}
      {description ? (
        <p id={descriptionId} className="text-xs text-neutral-500">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

export function FormAlert({
  message,
  fields,
}: {
  message?: string | null;
  fields?: Record<string, string>;
}) {
  // A Zod issue with no path is filed under `form` by `fieldErrors()`. Rendering it
  // here means an error that belongs to no single input is still shown, instead of
  // the form claiming "check the highlighted fields" while nothing is highlighted.
  const formError = fields?.form;
  if (!message && !formError) return null;

  return (
    <div
      role="alert"
      className="rounded-[var(--radius-control)] bg-danger-bg px-3 py-2 text-sm text-danger"
    >
      {message ? <p>{message}</p> : null}
      {formError ? <p className="mt-1">{formError}</p> : null}
    </div>
  );
}
