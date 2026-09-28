"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/spinner";

/**
 * Submit button that reflects the enclosing form's pending state, so a double
 * submit is impossible and the user always gets feedback while waiting.
 */
export function SubmitButton({
  children,
  pendingLabel,
  ...props
}: React.ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-busy={pending} {...props}>
      {pending ? <Spinner /> : null}
      {pending ? (pendingLabel ?? "Working…") : children}
    </Button>
  );
}
