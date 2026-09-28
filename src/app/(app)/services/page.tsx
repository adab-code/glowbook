import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ServiceManager } from "@/components/features/services/service-manager";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const user = await requireUser();
  const services = await db.service.findMany({
    where: { accountId: user.accountId },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Services"
        description="Everything your studio offers, with the price and duration used to build appointments."
      />
      <ServiceManager initialServices={services} currency={user.currency} />
    </>
  );
}
