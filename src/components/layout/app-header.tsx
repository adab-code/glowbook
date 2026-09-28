import Link from "next/link";
import type { Session } from "next-auth";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/appointments", label: "Appointments" },
  { href: "/clients", label: "Clients" },
  { href: "/services", label: "Services" },
  { href: "/team", label: "Team" },
  { href: "/settings", label: "Settings" },
] as const;

export function AppHeader({ session }: { session: Session }) {
  const initials =
    `${session.user.firstName?.[0] ?? ""}${session.user.lastName?.[0] ?? ""}` ||
    "GB";

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="font-semibold text-brand-700 md:hidden"
        >
          ✦ GlowBook
        </Link>

        <div className="hidden md:block">
          <p className="text-sm font-medium text-neutral-800">
            {session.user.studioName}
          </p>
          <p className="text-xs text-neutral-600">{session.user.timezone}</p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-700"
            title={session.user.email ?? undefined}
          >
            {initials}
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      <nav
        aria-label="Main"
        className="flex gap-1 overflow-x-auto border-t border-neutral-200 px-2 py-1 md:hidden"
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-[var(--radius-control)] px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
