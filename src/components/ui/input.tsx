import * as React from "react";
import { cn } from "@/lib/utils/format";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "h-11 w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 text-sm text-neutral-800",
        "placeholder:text-neutral-400 focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-70",
        "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800",
        "placeholder:text-neutral-400 focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:outline-none",
        "aria-[invalid=true]:border-danger",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "h-11 w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 text-sm text-neutral-800",
        "focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}
