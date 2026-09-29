import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

/**
 * Auth pages are reachable *because* the visitor has no session, so they must be
 * excluded from the unauthenticated redirect below. Including them in the rule
 * that sends unauthenticated visitors to /login is a self-redirect: /login
 * becomes /login?from=/login, which matches again, forever.
 */
const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

/**
 * Optimistic gate only. Proxy runs on the edge and cannot reach the database, so
 * this just checks that a session cookie exists before rendering an (app) route.
 * A forged or stale cookie gets past this point, so nothing here may be treated
 * as an authorisation decision.
 *
 * The authoritative checks live further in, and they differ by request kind:
 *   - rendered (app) pages: the (app) layout resolves the real session with
 *     `auth()` and `redirect("/login")`, so a bad cookie lands on /login.
 *   - API route handlers: `requireUser()` throws a 401.
 * Both re-read the session, and `accountId` always comes from the session
 * rather than from a body or route parameter.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = SESSION_COOKIES.some((name) =>
    request.cookies.has(name),
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isAuthRoute) {
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!hasSessionCookie) {
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/appointments/:path*",
    "/clients/:path*",
    "/services/:path*",
    "/team/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
