import type { ReactNode } from "react";

/** Page title, one-line description, and a primary action slot. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-prose text-sm text-neutral-600">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
