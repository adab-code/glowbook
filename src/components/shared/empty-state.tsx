import type { ReactNode } from "react";

/**
 * Constitution §IV requires clear empty states instead of blank lists, so every
 * list view renders this rather than nothing.
 */
export function EmptyState({
  title,
  description,
  action,
  icon = "✦",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div
        aria-hidden
        className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-xl text-brand-500"
      >
        {icon}
      </div>
      <div className="max-w-sm space-y-1">
        <p className="font-medium text-neutral-800">{title}</p>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
      {action}
    </div>
  );
}
