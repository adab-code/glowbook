import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, jsonError, notFound } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/session";
import { fieldErrors, serviceSchema } from "@/lib/validations/schemas";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Every handler re-checks `accountId` against the session, never against the URL,
 * so a valid ID from another studio behaves exactly like a missing one.
 */
async function findOwnedService(id: string, accountId: string) {
  const service = await db.service.findFirst({ where: { id, accountId } });
  if (!service) throw notFound("That service");
  return service;
}

/** PATCH /api/services/:id — partial update. */
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await findOwnedService(id, user.accountId);

    const parsed = serviceSchema
      .partial()
      .safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw badRequest(
        "Check the highlighted fields.",
        fieldErrors(parsed.error),
      );
    }

    const { description, ...rest } = parsed.data;
    const service = await db.service.update({
      where: { id },
      data: {
        ...rest,
        ...(description === undefined
          ? {}
          : { description: description || null }),
      },
    });

    return NextResponse.json({ data: service });
  } catch (error) {
    return jsonError(error);
  }
}

/**
 * DELETE /api/services/:id — archive instead of destroy when the service is part
 * of any appointment, so past bookings keep their history (constitution §V).
 */
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const service = await findOwnedService(id, user.accountId);

    const usedIn = await db.appointmentService.count({
      where: { serviceId: id },
    });

    if (usedIn > 0) {
      const archived = await db.service.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        data: archived,
        meta: {
          archived: true,
          message: `This service is used by ${usedIn} appointment${usedIn === 1 ? "" : "s"}, so it was archived instead of deleted.`,
        },
      });
    }

    await db.service.delete({ where: { id } });
    return NextResponse.json({ data: { id: service.id, deleted: true } });
  } catch (error) {
    return jsonError(error);
  }
}
