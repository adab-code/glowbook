import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();

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
            Editing these values is part of the next milestone; today they are
            set during signup.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </>
  );
}
