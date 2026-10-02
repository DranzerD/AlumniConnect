import bcrypt from "bcryptjs";
import { get, run } from "@/lib/db";
import { handler, json, readJson, HttpError } from "@/lib/http";
import { validate } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

// Compared against when the email doesn't exist so response time doesn't reveal
// which emails are registered.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export const POST = handler(async (request) => {
  const { email, password } = validate(await readJson(request), {
    email: { type: "email", required: true },
    password: { type: "password", required: true, max: 72 },
  });

  rateLimit(`login:${clientIp(request)}:${email}`, { limit: 10, windowMs: 15 * 60 * 1000 });

  const user = get(
    `SELECT u.id, u.college_id, u.password_hash, u.role, u.is_active, c.is_active AS college_active
       FROM users u LEFT JOIN colleges c ON c.id = u.college_id
      WHERE u.email = ?`,
    email,
  );
  const valid = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !valid) throw new HttpError(401, "Invalid email or password");
  if (!user.is_active) {
    throw new HttpError(403, "This account has been deactivated. Contact your college admin.");
  }
  if (user.role !== "superadmin" && !user.college_active) {
    throw new HttpError(403, "Your college's network is currently disabled.");
  }

  run("UPDATE users SET last_login_at = datetime('now') WHERE id = ?", user.id);

  const token = await signSession({ id: user.id, role: user.role, collegeId: user.college_id });
  const response = json({
    user: { id: user.id, role: user.role },
    redirect: user.role === "superadmin" ? "/dashboard/platform" : "/dashboard",
  });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
});
