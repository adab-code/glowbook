import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, jsonError } from "@/lib/api/errors";
import { requireOwner } from "@/lib/auth/session";
import { fieldErrors, settingsSchema } from "@/lib/validations/schemas";

/**
 * PATCH /api/account — update the signed-in studio's own settings
 * (name, timezone, currency).
 *
 * Owner-only: these values drive every other view (dashboard day bounds,
 * money formatting, sidebar branding), so staff members cannot change them.
 * Returns 403 for STAFF.
 *
 * The session token still carries the previous values until it is refreshed —
 * the settings form calls `useSession().update()` afterwards, which re-runs
 * the Auth.js `jwt` callback (see `src/auth.ts`) and re-issues the cookie.
 */
export async function PATCH(request: Request) {
  try {
    const user = await requireOwner();

    const parsed = settingsSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      throw badRequest(
        "Check the highlighted fields.",
        fieldErrors(parsed.error),
      );
    }

    const account = await db.account.update({
      where: { id: user.accountId },
      data: parsed.data,
    });

    return NextResponse.json({
      data: {
        id: account.id,
        studioName: account.studioName,
        timezone: account.timezone,
        currency: account.currency,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
