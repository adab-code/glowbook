"use client";

import { useActionState } from "react";
import { FormAlert, FormField } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { requestResetAction } from "@/lib/auth/actions";

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestResetAction, null);

  if (state?.status === "success") {
    return (
      <div className="space-y-3">
        <p className="rounded-[var(--radius-control)] bg-success-bg px-3 py-2 text-sm text-success">
          If that email is registered, a reset link is on its way. Check your
          inbox — in development the link is printed in the server terminal.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <FormAlert message={state?.error} />
      <FormField label="Email" error={state?.fields?.email}>
        {({ id, invalid, describedBy }) => (
          <Input
            id={id}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@studio.com"
            aria-invalid={invalid}
            aria-describedby={describedBy}
          />
        )}
      </FormField>
      <SubmitButton className="w-full" pendingLabel="Sending…">
        Send reset link
      </SubmitButton>
    </form>
  );
}
