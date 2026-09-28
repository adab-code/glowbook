import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, jsonError } from "@/lib/api/errors";
import { requireUser } from "@/lib/auth/session";
import { fieldErrors, serviceSchema } from "@/lib/validations/schemas";

/** GET /api/services — every service for the signed-in studio. */
export async function GET() {
  try {
    const user = await requireUser();
    const services = await db.service.findMany({
      where: { accountId: user.accountId },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    });
    return NextResponse.json({ data: services });
  } catch (error) {
    return jsonError(error);
  }
}

/** POST /api/services — create a service. */
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = serviceSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      throw badRequest(
        "Check the highlighted fields.",
        fieldErrors(parsed.error),
      );
    }

    const { name, description, priceCents, durationMinutes, isActive } =
      parsed.data;

    const service = await db.service.create({
      data: {
        accountId: user.accountId,
        name,
        description: description || null,
        priceCents,
        durationMinutes,
        isActive,
      },
    });

    return NextResponse.json({ data: service }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
