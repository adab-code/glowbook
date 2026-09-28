"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { cn } from "@/lib/utils/format";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/appointments", label: "Appointments", icon: "▤" },
  { href: "/clients", label: "Clients", icon: "◍" },
  { href: "/services", label: "Services", icon: "✦" },
  { href: "/team", label: "Team", icon: "◉" },
  { href: "/settings", label: "Settings", icon: "⚙" },
] as const;

export function AppSidebar({ session }: { session: Session }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-200 bg-white md:flex">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-5 py-5 text-base font-semibold text-brand-700"
      >
        <span aria-hidden className="text-xl">
          ✦
        </span>
        GlowBook
      </Link>
      <nav aria-label="Main" className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-neutral-700 hover:bg-neutral-100",
              )}
            >
              <span aria-hidden className="size-4 text-center">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-neutral-200 p-4 text-xs text-neutral-600">
        <p className="font-medium text-neutral-800">
          {session.user.studioName}
        </p>
        <p className="capitalize">
          {session.user.role.toLowerCase().replace(/_/g, " ")}
        </p>
      </div>
    </aside>
  );
}
