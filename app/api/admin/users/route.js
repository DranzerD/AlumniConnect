import bcrypt from "bcryptjs";
import { all, get, run, transaction } from "@/lib/db";
import { handler, json, readJson, getPagination, HttpError } from "@/lib/http";
import { requireRole } from "@/lib/session";
import { validate, PASSWORD_RULE, assertStrongPassword } from "@/lib/validation";

const ROLES = ["student", "alumni", "faculty", "admin"];

// GET /api/admin/users?q=&role=&status=active|inactive&page=
export const GET = handler(async (request) => {
  const admin = await requireRole("admin");
  const { searchParams } = request.nextUrl;
  const { page, limit, offset } = getPagination(searchParams, { defaultLimit: 15 });
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");

  const params = {
    college: admin.collegeId,
    q: q ? `%${q.replace(/[\\%_]/g, "\\$&")}%` : null,
    role: ROLES.includes(searchParams.get("role")) ? searchParams.get("role") : null,
    active: status === "active" ? 1 : status === "inactive" ? 0 : null,
  };
  const where = `
    FROM users u JOIN profiles p ON p.user_id = u.id
    WHERE u.college_id = @college
      AND (@q IS NULL OR p.full_name LIKE @q ESCAPE '\\' OR u.email LIKE @q ESCAPE '\\')
      AND (@role IS NULL OR u.role = @role)
      AND (@active IS NULL OR u.is_active = @active)`;

  const { total } = get(`SELECT COUNT(*) AS total ${where}`, params);
  const users = all(
    `SELECT u.id, u.email, u.role, u.is_active, u.created_at, u.last_login_at,
            p.full_name, p.graduation_year
     ${where}
     ORDER BY u.created_at DESC, u.id DESC
     LIMIT @limit OFFSET @offset`,
    { ...params, limit, offset },
  );

  return json({
    users,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

// POST — provision an account (e.g. faculty or another admin, who can't self-register).
export const POST = handler(async (request) => {
  const admin = await requireRole("admin");
  const data = validate(await readJson(request), {
    full_name: { type: "string", required: true, min: 2, max: 80, label: "full name" },
    email: { type: "email", required: true },
    role: { type: "enum", required: true, values: ROLES },
    password: { ...PASSWORD_RULE, label: "temporary password" },
  });
  assertStrongPassword(data.password);

  const { domain } = get("SELECT domain FROM colleges WHERE id = ?", admin.collegeId);
  const emailDomain = data.email.split("@")[1];
  if (emailDomain !== domain && !emailDomain.endsWith(`.${domain}`)) {
    throw new HttpError(422, `Email must be an @${domain} address`, { email: `Email must be an @${domain} address` });
  }
  if (get("SELECT 1 FROM users WHERE email = ?", data.email)) {
    throw new HttpError(409, "An account with this email already exists", { email: "An account with this email already exists" });
  }

  const hash = await bcrypt.hash(data.password, 10);
  const id = transaction(() => {
    const { lastInsertRowid } = run(
      "INSERT INTO users (college_id, email, password_hash, role) VALUES (?, ?, ?, ?)",
      admin.collegeId,
      data.email,
      hash,
      data.role,
    );
    run("INSERT INTO profiles (user_id, full_name) VALUES (?, ?)", lastInsertRowid, data.full_name);
    return Number(lastInsertRowid);
  });

  return json({ user: { id, email: data.email, role: data.role } }, { status: 201 });
});
