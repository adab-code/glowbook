"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils/format";

/**
 * Mobile navigation as a disclosure menu, not a scroll strip.
 *
 * The previous pattern was a horizontally scrollable row of links: reachable,
 * but only by swiping sideways, with no visible indication that more links
 * exist off-screen and no active-link styling. A button + panel keeps every
 * destination one tap away, announces its state to assistive technology via
 * `aria-expanded`, and marks the current page with `aria-current`.
 */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-neutral-200 md:hidden">
      <div className="px-2 py-1">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <span aria-hidden>{open ? "✕" : "☰"}</span>
          <span>{open ? "Close menu" : "Menu"}</span>
        </button>
      </div>
      {open ? (
        <nav id="mobile-nav-panel" aria-label="Main" className="px-2 pb-2">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium",
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-neutral-700 hover:bg-neutral-100",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
