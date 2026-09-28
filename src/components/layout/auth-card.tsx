import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/** Centered card on the branded background, shared by every (auth) route. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-brand-50 px-4 py-10">
      <div className="flex items-center gap-2 text-lg font-semibold text-brand-700">
        <span aria-hidden className="text-2xl">
          ✦
        </span>
        GlowBook
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
          {subtitle ? (
            <p className="text-sm text-neutral-600">{subtitle}</p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
      </Card>
      {footer}
    </div>
  );
}
