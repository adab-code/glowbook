"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormAlert, FormField, FormRow } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/lib/auth/actions";

export function LoginForm({ from }: { from: string }) {
  const [state, action] = useActionState(loginAction, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="from" value={from} />
      <FormAlert message={state?.error} />
      <FormRow>
        <FormField label="Email" error={state?.fields?.email}>
          {({ id, invalid, describedBy }) => (
            <Input
              id={id}
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@studio.com"
              aria-invalid={invalid}
              aria-describedby={describedBy}
            />
          )}
        </FormField>
        <FormField label="Password" error={state?.fields?.password}>
          {({ id, invalid, describedBy }) => (
            <Input
              id={id}
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={invalid}
              aria-describedby={describedBy}
            />
          )}
        </FormField>
      </FormRow>
      <div className="flex items-center justify-between">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-brand-700 underline"
        >
          Forgot your password?
        </Link>
        <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
      </div>
    </form>
  );
}
