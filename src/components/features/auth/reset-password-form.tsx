"use client";

import { useActionState } from "react";
import { FormAlert, FormField, FormRow } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { resetPasswordAction } from "@/lib/auth/actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <FormAlert message={state?.error} />
      <FormRow>
        <FormField
          label="New password"
          error={state?.fields?.password}
          description="At least 8 characters."
        >
          {({ id, invalid, describedBy }) => (
            <Input
              id={id}
              name="password"
              type="password"
              required
              autoComplete="new-password"
              aria-invalid={invalid}
              aria-describedby={describedBy}
            />
          )}
        </FormField>
        <FormField label="Confirm new password" error={state?.fields?.confirm}>
          {({ id, invalid, describedBy }) => (
            <Input
              id={id}
              name="confirm"
              type="password"
              required
              autoComplete="new-password"
              aria-invalid={invalid}
              aria-describedby={describedBy}
            />
          )}
        </FormField>
      </FormRow>
      <SubmitButton className="w-full" pendingLabel="Updating…">
        Update password
      </SubmitButton>
    </form>
  );
}
