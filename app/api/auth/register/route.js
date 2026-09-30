import bcrypt from "bcryptjs";
import { get, run, transaction } from "@/lib/db";
import { handler, json, readJson, HttpError } from "@/lib/http";
import { validate, PASSWORD_RULE, assertStrongPassword } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

const currentYear = new Date().getFullYear();

export const POST = handler(async (request) => {
  rateLimit(`register:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60 * 1000 });

  const data = validate(await readJson(request), {
    full_name: { type: "string", required: true, min: 2, max: 80, label: "full name" },
    email: { type: "email", required: true },
    password: PASSWORD_RULE,
    // Faculty and admin accounts are provisioned by an admin, not self-registered.
    role: { type: "enum", required: true, values: ["student", "alumni"] },
    college_id: { type: "int", required: true, min: 1, label: "college" },
    graduation_year: { type: "int", required: true, min: 1950, max: currentYear + 6, label: "graduation year" },
    department: { type: "string", max: 80 },
  });
  assertStrongPassword(data.password);

  const college = get("SELECT id, domain FROM colleges WHERE id = ?", data.college_id);
  if (!college) {
    throw new HttpError(422, "Select a valid college", { college_id: "Select a valid college" });
  }

  // Users must sign up with their institutional email address.
  const emailDomain = data.email.split("@")[1];
  if (emailDomain !== college.domain && !emailDomain.endsWith(`.${college.domain}`)) {
    const message = `Use your @${college.domain} email address`;
    throw new HttpError(422, message, { email: message });
  }

  if (get("SELECT 1 FROM users WHERE email = ?", data.email)) {
    const message = "An account with this email already exists";
    throw new HttpError(409, message, { email: message });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const userId = transaction(() => {
    const { lastInsertRowid } = run(
      "INSERT INTO users (college_id, email, password_hash, role, last_login_at) VALUES (?, ?, ?, ?, datetime('now'))",
      college.id,
      data.email,
      passwordHash,
      data.role,
    );
    run(
      `INSERT INTO profiles (user_id, full_name, graduation_year, department, current_role)
       VALUES (?, ?, ?, ?, ?)`,
      lastInsertRowid,
      data.full_name,
      data.graduation_year,
      data.department ?? null,
      data.role === "student" ? "Student" : null,
    );
    return Number(lastInsertRowid);
  });

  const token = await signSession({ id: userId, role: data.role, collegeId: college.id });
  const response = json({ user: { id: userId, role: data.role } }, { status: 201 });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
});
