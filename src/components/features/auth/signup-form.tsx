"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormAlert, FormField, FormRow } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { registerAction } from "@/lib/auth/actions";

export function SignupForm() {
  const [state, action] = useActionState(registerAction, null);

  return (
    <form action={action} className="space-y-4">
      <FormAlert message={state?.error} />
      <FormRow>
        <FormField
          label="Studio name"
          error={state?.fields?.studioName}
          description="This is what your clients will see."
        >
          {({ id, invalid, describedBy }) => (
            <Input
              id={id}
              name="studioName"
              required
              autoComplete="organization"
              placeholder="Aurea Lashes"
              aria-invalid={invalid}
              aria-describedby={describedBy}
            />
          )}
        </FormField>
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
      </FormRow>
      <div className="flex items-center justify-between gap-3">
        <Link href="/login" className="text-sm text-neutral-600 underline">
          I already have an account
        </Link>
        <SubmitButton pendingLabel="Creating your studio…">
          Create studio
        </SubmitButton>
      </div>
    </form>
  );
}
