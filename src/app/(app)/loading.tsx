import { Spinner } from "@/components/shared/spinner";

/** Suspense fallback for every authenticated route while its queries run. */
export default function AppLoading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex min-h-[50vh] items-center justify-center text-neutral-500"
    >
      <Spinner className="size-6" />
      <span className="ml-3 text-sm">Loading…</span>
    </div>
  );
}
