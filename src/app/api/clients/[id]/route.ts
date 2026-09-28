import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, jsonError, notFound } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/session";
import { clientPatchSchema, fieldErrors } from "@/lib/validations/schemas";

type RouteContext = { params: Promise<{ id: string }> };

async function findOwnedClient(id: string, accountId: string) {
  const client = await db.client.findFirst({ where: { id, accountId } });
  if (!client) throw notFound("That client");
  return client;
}

/** PATCH /api/clients/:id — update details, notes, or the archived flag. */
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await findOwnedClient(id, user.accountId);

    const parsed = clientPatchSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      throw badRequest(
        "Check the highlighted fields.",
        fieldErrors(parsed.error),
      );
    }

    const { email, phone, notes, ...rest } = parsed.data;
    const client = await db.client.update({
      where: { id },
      data: {
        ...rest,
        ...(email === undefined ? {} : { email: email || null }),
        ...(phone === undefined ? {} : { phone: phone || null }),
        ...(notes === undefined ? {} : { notes: notes || null }),
      },
    });

    return NextResponse.json({ data: client });
  } catch (error) {
    return jsonError(error);
  }
}

/** DELETE /api/clients/:id — archive, never destroy: history must survive. */
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const client = await findOwnedClient(id, user.accountId);

    const upcoming = await db.appointment.count({
      where: {
        clientId: id,
        status: "SCHEDULED",
        startsAt: { gte: new Date() },
      },
    });

    if (upcoming > 0) {
      throw badRequest(
        `This client has ${upcoming} upcoming appointment${upcoming === 1 ? "" : "s"}. Cancel ${upcoming === 1 ? "it" : "them"} first.`,
      );
    }

    const archived = await db.client.update({
      where: { id: client.id },
      data: { isArchived: true },
    });

    return NextResponse.json({
      data: archived,
      meta: {
        archived: true,
        message: `${client.firstName} ${client.lastName} was archived. Their appointment history is still available.`,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
