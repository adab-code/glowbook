import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

// The workspace is private: every route here already requires a valid session
// (see requireUser), but the HTML is still reachable by crawlers. Keeping it out
// of search indexes prevents studio data from leaking through meta descriptions.
export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar session={session} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader session={session} />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
