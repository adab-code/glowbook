import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Appointment and client management for beauty studios",
  description:
    "GlowBook keeps your studio's client list, services and appointments in one place, so you can stop juggling messages and paper notebooks.",
};

const FEATURES = [
  {
    icon: "▤",
    title: "One calendar, no double-bookings",
    body: "Book, reschedule and track every appointment in day, week or month view — overlaps are refused with a clear message.",
  },
  {
    icon: "◍",
    title: "Clients with memory",
    body: "Notes, preferences and full visit history on every profile, so regulars feel remembered.",
  },
  {
    icon: "✦",
    title: "A catalog that stays consistent",
    body: "Services with prices and durations, shared by the whole team and enforced by role.",
  },
] as const;

/**
 * Public entry point. Signed-in visitors go straight to their workspace;
 * everyone else gets the product story with a way in. This route is
 * intentionally outside the (app) group, so it carries no `noindex` and no
 * session requirement (see the proxy matcher and (app)/layout).
 */
export default async function LandingPage() {
  if (await auth()) redirect("/dashboard");

  return (
    <main className="flex min-h-dvh flex-col bg-brand-50">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-10 px-4 py-16 text-center">
        <div className="flex items-center gap-2 text-lg font-semibold text-brand-700">
          <span aria-hidden className="text-2xl">
            ✦
          </span>
          GlowBook
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold text-neutral-900 sm:text-5xl">
            Your studio, booked and remembered
          </h1>
          <p className="mx-auto max-w-xl text-base text-neutral-600 sm:text-lg">
            Appointment scheduling, client history and a service catalog in one
            place — for lash technicians, stylists, nail artists and
            estheticians who are done juggling chats and paper notebooks.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup">Create your studio</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>

        <div className="grid w-full gap-4 text-left sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="space-y-2 pt-6">
                <div aria-hidden className="text-2xl text-brand-600">
                  {feature.icon}
                </div>
                <h2 className="text-base font-semibold text-neutral-900">
                  {feature.title}
                </h2>
                <p className="text-sm text-neutral-600">{feature.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <footer className="border-t border-neutral-200 py-6 text-center text-sm text-neutral-600">
        GlowBook — appointment and client management for independent beauty
        studios.
      </footer>
    </main>
  );
}
