// Session token helpers. Uses `jose` (Web Crypto) so the same code runs in
// Edge middleware and in Node.js route handlers.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ac_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const DEV_FALLBACK_SECRET = "dev-only-insecure-secret-do-not-use-in-production";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable must be set in production");
    }
    return new TextEncoder().encode(DEV_FALLBACK_SECRET);
  }
  if (secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession({ id, role, collegeId }) {
  return new SignJWT({ role, cid: collegeId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

// Returns { userId, role, collegeId } or null if the token is missing/invalid/expired.
export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return { userId: Number(payload.sub), role: payload.role, collegeId: payload.cid };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
