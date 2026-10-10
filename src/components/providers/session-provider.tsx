"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * Client-side session context for the authenticated shell. Server components
 * keep using `auth()` / `requireUser()` as the authoritative check — this
 * provider exists for exactly one interaction: `useSession().update()` after
 * the owner saves studio settings, which re-runs the `jwt` callback and
 * re-issues the cookie without a sign-out.
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
