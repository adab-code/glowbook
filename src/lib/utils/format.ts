import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Integer cents to a localized currency string. */
export function formatMoney(cents: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    cents / 100,
  );
}

/**
 * Dates arrive as `Date` objects from server components (RSC preserves them)
 * but as ISO strings from route-handler JSON. Every formatter below coerces,
 * so a client-side reload through `apiFetch` can never crash a render with
 * "Invalid time value" — which is exactly what the appointments reload did
 * before this guard existed (caught by the Playwright booking spec).
 */
function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/** "Tue 24 Sep · 2:00 PM" in the studio's timezone. */
export function formatDateTime(date: Date | string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(toDate(date));
}

export function formatTime(date: Date | string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(toDate(date));
}

/** "Mon 28 Sep" in the studio's timezone, for range captions. */
export function formatDayLabel(date: Date | string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(toDate(date));
}

export function fullName(person: { firstName: string; lastName: string }) {
  return `${person.firstName} ${person.lastName}`;
}

/** "ae6f0c1d" from a UUID, for compact appointment blocks in the calendar. */
export function shortId(id: string) {
  return id.slice(0, 8);
}
