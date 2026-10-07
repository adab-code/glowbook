import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ClientManager } from "@/components/features/clients/client-manager";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Clients",
  description:
    "Contact details, preferences and appointment history for everyone your studio serves.",
};

export default async function ClientsPage() {
  const user = await requireUser();
  const clients = await db.client.findMany({
    where: { accountId: user.accountId, isArchived: false },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { _count: { select: { appointments: true } } },
  });

  return (
    <>
      <PageHeader
        title="Clients"
        description="Contact details, preferences and appointment history for everyone your studio serves."
      />
      <ClientManager initialClients={clients} />
    </>
  );
}
