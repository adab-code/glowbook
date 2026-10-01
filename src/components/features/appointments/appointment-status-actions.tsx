"use client";

import { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";
import { apiFetch, toFieldErrors, toMessage } from "@/lib/utils/api-client";
import type { AppointmentWithRelations } from "@/lib/appointments/types";
import type { AppointmentStatus } from "@/generated/prisma/enums";

/**
 * Status changes live next to the appointment instead of behind a detail page (FR-027):
 * marking someone as a no-show while they are standing in front of you should not cost
 * three navigations.
 *
 * Cancelling is the one action that needs input, so it opens a dialog asking for a
 * reason — `statusUpdateSchema` rejects a `CANCELLED` without one, and the client's
 * history shows it later.
 */
export function AppointmentStatusActions({
  appointment,
  onChanged,
  onDeleted,
}: {
  appointment: AppointmentWithRelations;
  onChanged: (next: AppointmentWithRelations) => void;
  onDeleted: (id: string) => void;
}) {
  const [busy, setBusy] = useState<AppointmentStatus | "DELETE" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();

  async function changeStatus(
    status: AppointmentStatus,
    cancellationReason?: string,
  ) {
    setBusy(status);
    setError(null);
    setFieldError(undefined);
    try {
      const result = await apiFetch<{ data: AppointmentWithRelations }>(
        `/api/appointments/${appointment.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify(
            cancellationReason === undefined
              ? { status }
              : { status, cancellationReason },
          ),
        },
      );
      onChanged(result.data);
      return true;
    } catch (cause) {
      setError(toMessage(cause));
      setFieldError(toFieldErrors(cause).cancellationReason);
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy("DELETE");
    setError(null);
    try {
      await apiFetch(`/api/appointments/${appointment.id}`, {
        method: "DELETE",
      });
      onDeleted(appointment.id);
    } catch (cause) {
      setError(toMessage(cause));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error ? (
        <p role="alert" className="w-full text-sm text-danger">
          {error}
        </p>
      ) : null}

      {appointment.status === "SCHEDULED" ? (
        <>
          <Button
            variant="outline"
            size="sm"
            disabled={busy !== null}
            onClick={() => changeStatus("COMPLETED")}
          >
            {busy === "COMPLETED" ? "Saving…" : "Mark completed"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={busy !== null}
            onClick={() => changeStatus("NO_SHOW")}
          >
            {busy === "NO_SHOW" ? "Saving…" : "No-show"}
          </Button>
          <CancelDialog
            appointment={appointment}
            onCancel={changeStatus}
            fieldError={fieldError}
          />{" "}
          <Button
            variant="ghost"
            size="sm"
            disabled={busy !== null}
            onClick={remove}
          >
            {busy === "DELETE" ? "Removing…" : "Delete"}
          </Button>
        </>
      ) : null}

      {appointment.status !== "SCHEDULED" ? (
        <Button
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={() => changeStatus("SCHEDULED")}
        >
          {busy === "SCHEDULED" ? "Reopening…" : "Reopen"}
        </Button>
      ) : null}
    </div>
  );
}

function CancelDialog({
  appointment,
  onCancel,
  fieldError,
}: {
  appointment: AppointmentWithRelations;
  onCancel: (
    status: AppointmentStatus,
    cancellationReason?: string,
  ) => Promise<boolean>;
  fieldError?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The single mutation lives in the parent so the row and the dialog cannot each
  // fire their own PATCH.
  async function submit() {
    setPending(true);
    setError(null);
    const ok = await onCancel("CANCELLED", reason.trim());
    setPending(false);
    if (ok) {
      setOpen(false);
      setReason("");
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <Button variant="danger" size="sm">
          Cancel
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-neutral-950/40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6 shadow-md">
          <AlertDialog.Title className="text-lg font-semibold text-neutral-900">
            Cancel this appointment?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-neutral-600">
            The slot is freed straight away and the client keeps this in their
            history. A short reason helps next time you speak to them.
          </AlertDialog.Description>

          <div className="mt-4 space-y-1.5">
            <label
              htmlFor={`cancel-reason-${appointment.id}`}
              className="block text-[13px] font-medium text-neutral-800"
            >
              Reason
            </label>
            <textarea
              id={`cancel-reason-${appointment.id}`}
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Client called to reschedule"
              aria-invalid={Boolean(error || fieldError)}
              aria-describedby={
                error || fieldError
                  ? `cancel-error-${appointment.id}`
                  : undefined
              }
              className="w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 py-2 text-sm aria-[invalid=true]:border-danger"
            />
            {error || fieldError ? (
              <p
                id={`cancel-error-${appointment.id}`}
                role="alert"
                className="text-sm text-danger"
              >
                {error ?? fieldError}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button variant="outline" disabled={pending}>
                Keep it
              </Button>
            </AlertDialog.Cancel>
            <Button variant="danger" onClick={submit} disabled={pending}>
              {pending ? "Cancelling…" : "Cancel appointment"}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
