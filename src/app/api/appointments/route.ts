import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, jsonError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/session";
import { fromDateTimeLocalValue } from "@/lib/utils/datetime";
import {
  appointmentQuerySchema,
  appointmentSchema,
  fieldErrors,
} from "@/lib/validations/schemas";
import {
  appointmentInclude,
  assertNoOverlap,
  findBookableClient,
  resolveBookingServices,
  resolveStaffUser,
  summariseBooking,
} from "@/lib/appointments/scheduling";

const MINUTE = 60_000;

/**
 * GET /api/appointments — the studio's schedule, optionally narrowed to a window.
 *
 * `from`/`to` are studio-local wall clocks (`2026-10-01T00:00`) because that is what
 * the calendar view collects; they are resolved through `Account.timezone` before
 * touching the database, so a Boise day is a Boise day and not a UTC one.
 */
export async function GET(request: Request) {
  try {
    const user = await requireUser();

    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = appointmentQuerySchema.safeParse(params);
    if (!parsed.success) {
      throw badRequest(
        "Check the highlighted fields.",
        fieldErrors(parsed.error),
      );
    }
    const { from, to, status, limit } = parsed.data;

    const startsAt = from
      ? fromDateTimeLocalValue(from, user.timezone)
      : undefined;
    const endsAt = to ? fromDateTimeLocalValue(to, user.timezone) : undefined;

    if (from && !startsAt) {
      throw badRequest("Check the highlighted fields.", {
        from: "Use the format YYYY-MM-DDTHH:mm.",
      });
    }
    if (to && !endsAt) {
      throw badRequest("Check the highlighted fields.", {
        to: "Use the format YYYY-MM-DDTHH:mm.",
      });
    }
    if (startsAt && endsAt && endsAt <= startsAt) {
      throw badRequest("Check the highlighted fields.", {
        to: "The end of the range must be after its start.",
      });
    }

    // `startsAt` half-open window: an appointment is returned when it begins inside
    // the range, which is what a day view wants. Long appointments that started
    // earlier and run into the range are intentionally left out — showing them would
    // duplicate them in every day cell they span.
    const appointments = await db.appointment.findMany({
      where: {
        accountId: user.accountId,
        ...(startsAt ? { startsAt: { gte: startsAt } } : {}),
        ...(endsAt ? { startsAt: { lt: endsAt } } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { startsAt: "asc" },
      take: limit,
      include: appointmentInclude,
    });

    return NextResponse.json({
      data: appointments,
      meta: { count: appointments.length },
    });
  } catch (error) {
    return jsonError(error);
  }
}

/**
 * POST /api/appointments — book a client into a slot.
 *
 * The client sends only *what* the booking is (client, services, start time, staff).
 * `endsAt` and `priceCentsTotal` are derived here so they cannot be forged, ownership of
 * every referenced id is re-checked against the session's studio, and a clashing slot
 * answers `409` instead of silently double-booking (FR-021).
 */
export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const parsed = appointmentSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      throw badRequest(
        "Check the highlighted fields.",
        fieldErrors(parsed.error),
      );
    }
    const {
      clientId,
      serviceIds,
      startsAt: startsAtLocal,
      staffUserId,
    } = parsed.data;

    const startsAt = fromDateTimeLocalValue(startsAtLocal, user.timezone);
    if (!startsAt) {
      throw badRequest("Check the highlighted fields.", {
        startsAt: "Pick a valid date and time.",
      });
    }

    const [client, services, resolvedStaffUserId] = await Promise.all([
      findBookableClient(clientId, user.accountId),
      resolveBookingServices(serviceIds, user.accountId),
      resolveStaffUser(staffUserId, user.accountId),
    ]);

    const { durationMinutes, priceCentsTotal } = summariseBooking(services);
    const endsAt = new Date(startsAt.getTime() + durationMinutes * MINUTE);

    await assertNoOverlap(
      {
        accountId: user.accountId,
        staffUserId: resolvedStaffUserId,
        startsAt,
        endsAt,
      },
      { timeZone: user.timezone },
    );

    const appointment = await db.appointment.create({
      data: {
        accountId: user.accountId,
        clientId: client.id,
        staffUserId: resolvedStaffUserId,
        startsAt,
        endsAt,
        priceCentsTotal,
        services: {
          create: services.map((service) => ({ serviceId: service.id })),
        },
      },
      include: appointmentInclude,
    });

    return NextResponse.json({ data: appointment }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
