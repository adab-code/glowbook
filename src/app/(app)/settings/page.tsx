import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsForm } from "@/components/features/settings/settings-form";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Settings",
  description: "Studio details, timezone and currency used across the app.",
};

/**
 * Every timezone the runtime knows, for the settings datalist. Falls back to
 * a short curated list if the Intl API is unavailable in the runtime.
 */
function supportedTimeZones(): string[] {
  try {
    const zones = Intl.supportedValuesOf("timeZone");
    if (zones.length > 0) return zones;
  } catch {
    // Intentionally fall through to the curated list below.
  }
  return [
    "America/Boise",
    "America/Denver",
    "America/Chicago",
    "America/New_York",
    "America/Los_Angeles",
    "America/Anchorage",
    "Pacific/Honolulu",
    "UTC",
  ];
}

export default async function SettingsPage() {
  const user = await requireUser();
  const isOwner = user.role === "OWNER";

  return (
    <>
      <PageHeader
        title="Settings"
        description="Studio details, timezone and currency used across the app."
      />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Studio</CardTitle>
          <CardDescription>
            {isOwner
              ? "These values drive day boundaries, money formatting and branding across the app."
              : "Only the studio owner can change these values."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isOwner ? (
            <SettingsForm
              initial={{
                studioName: user.studioName,
                timezone: user.timezone,
                currency: user.currency,
              }}
              timeZones={supportedTimeZones()}
            />
          ) : (
            <dl className="divide-y divide-neutral-200 text-sm">
              {[
                ["Studio name", user.studioName],
                ["Signed in as", user.email],
                ["Role", user.role.toLowerCase()],
                ["Timezone", user.timezone],
                ["Currency", user.currency],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-2">
                  <dt className="text-neutral-600">{label}</dt>
                  <dd className="text-right font-medium text-neutral-800">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>
    </>
  );
}
