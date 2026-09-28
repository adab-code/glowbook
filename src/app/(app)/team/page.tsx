import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="Team"
        description="Invite staff, assign roles and control who can edit the schedule."
      />
      <Card>
        <CardContent className="p-0 sm:p-0">
          <EmptyState
            title="Invitations are next"
            description="Invites are already modelled and token-hashed at rest. The screens to send and accept them belong to the next milestone."
            icon="◉"
          />
        </CardContent>
      </Card>
    </>
  );
}
