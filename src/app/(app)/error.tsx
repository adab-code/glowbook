"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * `requireUser()` throws `ApiError(401)` and the Prisma calls below it can throw at
 * any time, so without a boundary in the `(app)` group a single failed query — or an
 * expired session — took down the whole shell. `retry` re-runs the segment's server
 * render, so a transient failure is recoverable without a full navigation.
 */
export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-4 p-6 text-center sm:p-8">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-neutral-900">
              This page could not be loaded
            </h2>
            <p className="text-sm text-neutral-600">
              The request failed on our side, or your session expired. You can
              retry without leaving the app, or head back to the dashboard.
            </p>
          </div>
          {error.digest ? (
            <p className="text-xs text-neutral-500">
              Reference: <code>{error.digest}</code>
            </p>
          ) : null}
          <div className="flex justify-center gap-2">
            <Button onClick={retry}>Try again</Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
