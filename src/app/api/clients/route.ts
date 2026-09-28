import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, jsonError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/session";
import { clientSchema, fieldErrors } from "@/lib/validations/schemas";

/** GET /api/clients — active clients, most recent first. */
export async function GET() {
  try {
    const user = await requireUser();
    const clients = await db.client.findMany({
      where: { accountId: user.accountId, isArchived: false },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: { _count: { select: { appointments: true } } },
    });
    return NextResponse.json({ data: clients });
  } catch (error) {
    return jsonError(error);
  }
}

/** POST /api/clients — create a client profile. */
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = clientSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      throw badRequest(
        "Check the highlighted fields.",
        fieldErrors(parsed.error),
      );
    }

    const { firstName, lastName, email, phone, notes } = parsed.data;

    const client = await db.client.create({
      data: {
        accountId: user.accountId,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ data: client }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
