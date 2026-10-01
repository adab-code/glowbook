import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, jsonError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/session";
import { fieldErrors, statusUpdateSchema } from "@/lib/validations/schemas";
import {
  appointmentInclude,
  assertNoOverlap,
  findOwnedAppointment,
} from "@/lib/appointments/scheduling";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PATCH /api/appointments/:id/status — move an appointment through its lifecycle
 * (FR-024). Split from the detail route because the status form sends a different body
 * and needs its own validation: `statusUpdateSchema` requires a `cancellationReason`
 * whenever the new status is `CANCELLED`, so a cancellation always says why.
 *
 * Re-opening a cancelled appointment frees its old slot and claims the new one, so the
 * overlap check runs again — otherwise cancelling and re-booking would be a one-click
 * way to double-book.
 */
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const current = await findOwnedAppointment(id, user.accountId);

    const parsed = statusUpdateSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      throw badRequest(
        "Check the highlighted fields.",
        fieldErrors(parsed.error),
      );
    }
    const { status, cancellationReason } = parsed.data;

    if (status === current.status && cancellationReason === undefined) {
      return NextResponse.json({ data: current });
    }

    // Completing or cancelling frees the slot; scheduling it again claims it.
    if (status === "SCHEDULED" && current.status !== "SCHEDULED") {
      await assertNoOverlap(
        {
          accountId: user.accountId,
          staffUserId: current.staffUserId,
          startsAt: current.startsAt,
          endsAt: current.endsAt,
          excludeId: current.id,
        },
        { timeZone: user.timezone },
      );
    }

    const appointment = await db.appointment.update({
      where: { id: current.id },
      data: {
        status,
        // Kept alongside the status so the reason survives a later re-open instead of
        // leaving stale text on an appointment that is scheduled again.
        cancellationReason:
          status === "CANCELLED" ? (cancellationReason ?? null) : null,
      },
      include: appointmentInclude,
    });

    return NextResponse.json({ data: appointment });
  } catch (error) {
    return jsonError(error);
  }
}
