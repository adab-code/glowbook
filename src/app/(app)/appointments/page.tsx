import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Appointments" };

export default function AppointmentsPage() {
  return (
    <>
      <PageHeader
        title="Appointments"
        description="The weekly calendar, availability rules and status changes."
      />
      <Card>
        <CardContent className="p-0 sm:p-0">
          <EmptyState
            title="Not built yet"
            description="Availability, conflict detection and the calendar grid are tracked in the next milestone. The data model and the status rules already exist."
            icon="▤"
          />
        </CardContent>
      </Card>
    </>
  );
}
