import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GlowBook",
    template: "%s · GlowBook",
  },
  description:
    "GlowBook is a salon and studio booking platform built with Next.js, PostgreSQL and Prisma.",
  applicationName: "GlowBook",
  openGraph: {
    type: "website",
    siteName: "GlowBook",
    locale: "en_US",
    title: "GlowBook — appointment and client management for beauty studios",
    description:
      "GlowBook keeps your studio's client list, services and appointments in one place, so you can stop juggling messages and paper notebooks.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GlowBook — appointment and client management for beauty studios",
    description:
      "GlowBook keeps your studio's client list, services and appointments in one place, so you can stop juggling messages and paper notebooks.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
