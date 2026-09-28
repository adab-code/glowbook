import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/schemas";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
  pages: { signIn: "/login", error: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const user = await db.staffUser.findUnique({
          where: { email },
          include: { account: true },
        });

        // Same response for unknown email, wrong password, and deactivated account:
        // never reveal whether an account exists (constitution §III).
        if (!user?.passwordHash || !user.isActive || !user.account) return null;

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        await db.staffUser.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          accountId: user.accountId,
          studioName: user.account.studioName,
          timezone: user.account.timezone,
          currency: user.account.currency,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
        token.accountId = user.accountId;
        token.role = user.role;
        token.studioName = user.studioName;
        token.timezone = user.timezone;
        token.currency = user.currency;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId;
      session.user.accountId = token.accountId;
      session.user.role = token.role;
      session.user.studioName = token.studioName;
      session.user.timezone = token.timezone;
      session.user.currency = token.currency;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      return session;
    },
  },
});
