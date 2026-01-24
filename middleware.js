import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

/**
 * Next.js Middleware for AlumniConnect
 * Handles authentication, rate limiting, and request logging
 */

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/api/profiles/me",
  "/api/jobs",
  "/api/connections",
  "/api/notifications",
  "/api/messages",
  "/api/mentorship",
];

// Admin-only routes
const adminRoutes = ["/admin", "/api/admin"];

// Public API routes (no auth required)
const publicApiRoutes = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/profiles", // Public profile viewing
];

// Rate limiting configuration
const rateLimitConfig = {
  "/api/auth/login": { limit: 5, window: 60 * 1000 }, // 5 requests per minute
  "/api/auth/register": { limit: 3, window: 60 * 1000 }, // 3 requests per minute
  "/api": { limit: 100, window: 60 * 1000 }, // 100 requests per minute for general API
};

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map();

function getRateLimitKey(ip, path) {
  return `${ip}:${path}`;
}

function checkRateLimit(ip, path) {
  // Find matching rate limit config
  let config = null;
  for (const [route, cfg] of Object.entries(rateLimitConfig)) {
    if (path.startsWith(route)) {
      config = cfg;
      break;
    }
  }

  if (!config) return { allowed: true };

  const key = getRateLimitKey(ip, path);
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now - record.timestamp > config.window) {
    rateLimitStore.set(key, { count: 1, timestamp: now });
    return { allowed: true, remaining: config.limit - 1 };
  }

  if (record.count >= config.limit) {
    const resetTime = record.timestamp + config.window;
    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfter: Math.ceil((resetTime - now) / 1000),
    };
  }

  record.count++;
  return { allowed: true, remaining: config.limit - record.count };
}

function isProtectedRoute(pathname) {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

function isAdminRoute(pathname) {
  return adminRoutes.some((route) => pathname.startsWith(route));
}

function isPublicApiRoute(pathname) {
  return publicApiRoutes.some((route) => {
    if (route === "/api/profiles") {
      // Allow public viewing but not /me
      return (
        pathname === "/api/profiles" ||
        (pathname.startsWith("/api/profiles/") && !pathname.includes("/me"))
      );
    }
    return pathname.startsWith(route);
  });
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Rate limiting for API routes
  if (pathname.startsWith("/api")) {
    const rateLimit = checkRateLimit(ip, pathname);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
            "X-RateLimit-Limit": String(rateLimitConfig["/api"]?.limit || 100),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimit.resetTime),
          },
        },
      );
    }
  }

  // Get token from cookies
  const token = request.cookies.get("token")?.value;

  // Check if route requires authentication
  if (isProtectedRoute(pathname) && !isPublicApiRoute(pathname)) {
    if (!token) {
      // Redirect to login for page routes
      if (!pathname.startsWith("/api")) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Return 401 for API routes
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify token
    try {
      const user = await verifyToken(token);

      if (!user) {
        // Clear invalid token
        const response = pathname.startsWith("/api")
          ? NextResponse.json(
              { success: false, message: "Invalid or expired token" },
              { status: 401 },
            )
          : NextResponse.redirect(new URL("/login", request.url));

        response.cookies.delete("token");
        return response;
      }

      // Check admin access
      if (isAdminRoute(pathname) && user.role !== "admin") {
        return pathname.startsWith("/api")
          ? NextResponse.json(
              { success: false, message: "Admin access required" },
              { status: 403 },
            )
          : NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Add user info to headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", String(user.id));
      requestHeaders.set("x-user-role", user.role || "alumni");

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error("Token verification error:", error);

      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          { success: false, message: "Authentication error" },
          { status: 401 },
        );
      }

      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect authenticated users away from login/register pages
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Add security headers
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Request logging (in production, send to logging service)
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[${new Date().toISOString()}] ${request.method} ${pathname} - ${ip}`,
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
