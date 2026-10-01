import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, conflict, jsonError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/session";
import { fromDateTimeLocalValue } from "@/lib/utils/datetime";
import { appointmentPatchSchema, fieldErrors } from "@/lib/validations/schemas";
import {
  appointmentInclude,
  assertNoOverlap,
  findBookableClient,
  findOwnedAppointment,
  resolveBookingServices,
  resolveStaffUser,
  summariseBooking,
} from "@/lib/appointments/scheduling";

type RouteContext = { params: Promise<{ id: string }> };

const MINUTE = 60_000;

/** GET /api/appointments/:id — one booking, with the same shape as the list. */
export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const appointment = await findOwnedAppointment(id, user.accountId);
    return NextResponse.json({ data: appointment });
  } catch (error) {
    return jsonError(error);
  }
}

/**
 * PATCH /api/appointments/:id — move the time, swap the client or re-pick the services.
 *
 * Any change to the time or the services re-derives `endsAt` and `priceCentsTotal`
 * from the new selection, and re-runs the overlap check with this appointment excluded
 * so it does not conflict with its own current slot.
 */
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const current = await findOwnedAppointment(id, user.accountId);

    const parsed = appointmentPatchSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      throw badRequest(
        "Check the highlighted fields.",
        fieldErrors(parsed.error),
      );
    }
    const { clientId, serviceIds, startsAt, staffUserId, cancellationReason } =
      parsed.data;

    let nextStartsAt = current.startsAt;
    if (startsAt !== undefined) {
      const parsedStart = fromDateTimeLocalValue(startsAt, user.timezone);
      if (!parsedStart) {
        throw badRequest("Check the highlighted fields.", {
          startsAt: "Pick a valid date and time.",
        });
      }
      nextStartsAt = parsedStart;
    }

    const [client, services, resolvedStaffUserId] = await Promise.all([
      clientId === undefined
        ? Promise.resolve(null)
        : findBookableClient(clientId, user.accountId),
      serviceIds === undefined
        ? Promise.resolve(null)
        : resolveBookingServices(serviceIds, user.accountId),
      resolveStaffUser(
        staffUserId === undefined ? undefined : staffUserId,
        user.accountId,
      ),
    ]);

    // Keep the current services when the patch does not mention them, so moving the
    // time does not silently empty the appointment.
    const effectiveServices =
      services ??
      current.services.map((entry) => ({
        id: entry.service.id,
        name: entry.service.name,
        priceCents: entry.service.priceCents,
        durationMinutes: entry.service.durationMinutes,
        isActive: entry.service.isActive,
      }));

    const { durationMinutes, priceCentsTotal } =
      summariseBooking(effectiveServices);
    const nextEndsAt = new Date(
      nextStartsAt.getTime() + durationMinutes * MINUTE,
    );

    // A cancelled appointment is history: moving it would falsify the record, and the
    // client history renders the cancellation reason next to it.
    if (current.status === "CANCELLED") {
      throw conflict("This appointment was cancelled.", {
        startsAt: "Book a new appointment instead of editing a cancelled one.",
      });
    }

    if (nextStartsAt.getTime() !== current.startsAt.getTime() || services) {
      await assertNoOverlap(
        {
          accountId: user.accountId,
          staffUserId: resolvedStaffUserId,
          startsAt: nextStartsAt,
          endsAt: nextEndsAt,
          excludeId: current.id,
        },
        { timeZone: user.timezone },
      );
    }

    // Replace the join rows rather than diffing them: the service set is small, and a
    // wholesale replace cannot leave a stale row behind.
    const appointment = await db.appointment.update({
      where: { id: current.id },
      data: {
        ...(client ? { clientId: client.id } : {}),
        staffUserId: resolvedStaffUserId,
        startsAt: nextStartsAt,
        endsAt: nextEndsAt,
        priceCentsTotal,
        ...(cancellationReason === undefined
          ? {}
          : { cancellationReason: cancellationReason || null }),
        ...(services
          ? {
              services: {
                deleteMany: {},
                create: services.map((service) => ({
                  serviceId: service.id,
                })),
              },
            }
          : {}),
      },
      include: appointmentInclude,
    });

    return NextResponse.json({ data: appointment });
  } catch (error) {
    return jsonError(error);
  }
}

/**
 * DELETE /api/appointments/:id — undo a booking that was made by mistake.
 *
 * Only an appointment that has not happened can be deleted. A completed or no-show
 * appointment is real history and is refused with `409` pointing at the status route,
 * which is the same soft-delete reasoning as clients and services (constitution §V).
 */
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const appointment = await findOwnedAppointment(id, user.accountId);

    if (appointment.status !== "SCHEDULED") {
      throw conflict(
        `This appointment is ${appointment.status === "CANCELLED" ? "already cancelled" : "already closed"}.`,
        {
          status:
            "Change the status instead of deleting, so the client history stays complete.",
        },
      );
    }

    await db.appointment.delete({ where: { id: appointment.id } });

    return NextResponse.json({
      data: { id: appointment.id, deleted: true },
      meta: {
        message: "The appointment was removed from the schedule.",
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
