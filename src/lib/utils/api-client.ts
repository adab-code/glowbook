export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/**
 * Single place where a client component talks to a route handler, so every form
 * handles the shared error shape ({ error: { code, message, fields } }) the same way.
 */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const payload =
    response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload?.error;
    throw new ApiClientError(
      response.status,
      error?.code ?? "request_failed",
      error?.message ?? "Something went wrong. Please try again.",
      error?.fields,
    );
  }

  return payload as T;
}

export function toFieldErrors(error: unknown): Record<string, string> {
  return error instanceof ApiClientError ? (error.fields ?? {}) : {};
}

export function toMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
