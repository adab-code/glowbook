import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Reached by `notFound()` (for example `clients/[id]` for an id that is missing or
 * belongs to another studio) and by any unmatched URL. Next's built-in 404 ships no
 * app styling, so it ignored the design tokens and offered no way back.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <p className="text-sm font-medium text-brand-600">404</p>
        <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">
          We could not find that page
        </h1>
        <p className="text-sm text-neutral-600">
          The link may be out of date, or the record belongs to a different
          studio. If you followed a client or appointment link, check the studio
          it points at.
        </p>
        <div className="flex justify-center gap-2">
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/clients">Browse clients</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
