import type { DefaultSession } from "next-auth";
import type { StaffRole } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      accountId: string;
      role: StaffRole;
      studioName: string;
      timezone: string;
      currency: string;
      firstName: string;
      lastName: string;
    } & DefaultSession["user"];
  }

  interface User {
    accountId: string;
    role: StaffRole;
    studioName: string;
    timezone: string;
    currency: string;
    firstName: string;
    lastName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    accountId: string;
    role: StaffRole;
    studioName: string;
    timezone: string;
    currency: string;
    firstName: string;
    lastName: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId: string;
    accountId: string;
    role: StaffRole;
    studioName: string;
    timezone: string;
    currency: string;
    firstName: string;
    lastName: string;
  }
}
