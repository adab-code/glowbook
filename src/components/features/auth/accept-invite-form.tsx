"use client";

import { useActionState } from "react";
import { FormAlert, FormField, FormRow } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { acceptInviteAction } from "@/lib/auth/actions";

export function AcceptInviteForm({ token }: { token: string }) {
  const [state, action] = useActionState(acceptInviteAction, null);

  return (
    <form action={action} className="space-y-4">
      <FormAlert message={state?.error} />
      <input type="hidden" name="token" value={token} />
      <FormRow>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="First name" error={state?.fields?.firstName}>
            {({ id, invalid, describedBy }) => (
              <Input
                id={id}
                name="firstName"
                required
                autoComplete="given-name"
                aria-invalid={invalid}
                aria-describedby={describedBy}
              />
            )}
          </FormField>
          <FormField label="Last name" error={state?.fields?.lastName}>
            {({ id, invalid, describedBy }) => (
              <Input
                id={id}
                name="lastName"
                required
                autoComplete="family-name"
                aria-invalid={invalid}
                aria-describedby={describedBy}
              />
            )}
          </FormField>
        </div>
        <FormField
          label="Password"
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
        <FormField label="Confirm password" error={state?.fields?.confirm}>
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
      <SubmitButton pendingLabel="Joining the studio…">
        Join the studio
      </SubmitButton>
    </form>
  );
}
