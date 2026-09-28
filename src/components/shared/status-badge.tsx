import type { AppointmentStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils/format";

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-info-bg text-info",
  COMPLETED: "bg-success-bg text-success",
  CANCELLED: "bg-danger-bg text-danger",
  NO_SHOW: "bg-warning-bg text-warning",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
};

/**
 * Status is never communicated by colour alone — the label is always rendered
 * next to the tinted background (design system §2.4, constitution §IV).
 */
export function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}
