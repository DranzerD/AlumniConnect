import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "./lib/auth";

// First line of defence: rejects unauthenticated requests early and sets
// security headers. Route handlers still re-check the user against the
// database (see lib/session.js), because a JWT can outlive a deactivation.

const PUBLIC_API = ["/api/auth/login", "/api/auth/register", "/api/auth/logout", "/api/colleges"];
const AUTH_PAGES = ["/login", "/register"];

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  const isApi = pathname.startsWith("/api/");
  const isProtectedPage = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/dashboard/admin") || pathname.startsWith("/api/admin");

  if (isApi && !PUBLIC_API.includes(pathname) && !session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (isProtectedPage && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE); // clear expired/invalid tokens
    return response;
  }

  if (isAdmin && session?.role !== "admin") {
    return isApi
      ? NextResponse.json({ error: "Admin access required" }, { status: 403 })
      : NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (AUTH_PAGES.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return withSecurityHeaders(NextResponse.next());
}

function withSecurityHeaders(response) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export const config = {
  // Everything except Next.js internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
