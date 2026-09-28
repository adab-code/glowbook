import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const unauthorized = () =>
  new ApiError(401, "unauthorized", "You need to sign in to do that.");

/** 404 rather than 403 for another studio's record, so IDs cannot be probed. */
export const notFound = (what = "That record") =>
  new ApiError(404, "not_found", `${what} was not found.`);

export const conflict = (message: string, fields?: Record<string, string>) =>
  new ApiError(409, "conflict", message, fields);

export const badRequest = (message: string, fields?: Record<string, string>) =>
  new ApiError(400, "validation_failed", message, fields);

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          fields: error.fields,
        },
      },
      { status: error.status },
    );
  }
  console.error(error);
  return NextResponse.json(
    {
      error: {
        code: "internal_error",
        message: "Something went wrong. Please try again.",
      },
    },
    { status: 500 },
  );
}
