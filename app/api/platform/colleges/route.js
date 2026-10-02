import { all, get, run } from "@/lib/db";
import { handler, json, readJson, HttpError } from "@/lib/http";
import { requireRole } from "@/lib/session";
import { validate } from "@/lib/validation";
import { DOMAIN_RULE, normalizeDomain } from "@/lib/domain";

// GET /api/platform/colleges — every college with member counts and its admins.
export const GET = handler(async () => {
  await requireRole("superadmin");

  const colleges = all(
    `SELECT c.id, c.name, c.domain, c.is_active, c.created_at,
            COUNT(u.id) AS members,
            SUM(u.role = 'student') AS students,
            SUM(u.role = 'alumni') AS alumni,
            SUM(u.role = 'faculty') AS faculty,
            (SELECT MAX(last_login_at) FROM users WHERE college_id = c.id) AS last_activity
       FROM colleges c
       LEFT JOIN users u ON u.college_id = c.id AND u.is_active = 1
      GROUP BY c.id
      ORDER BY c.is_active DESC, c.name COLLATE NOCASE`,
  );
  const admins = all(
    `SELECT u.id, u.college_id, u.email, p.full_name
       FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE u.role = 'admin' AND u.is_active = 1
      ORDER BY p.full_name`,
  );

  return json({
    colleges: colleges.map((c) => ({
      ...c,
      students: c.students ?? 0,
      alumni: c.alumni ?? 0,
      faculty: c.faculty ?? 0,
      admins: admins.filter((a) => a.college_id === c.id),
    })),
  });
});

// POST { name, domain } — onboard a new college.
export const POST = handler(async (request) => {
  await requireRole("superadmin");
  const data = validate(await readJson(request), {
    name: { type: "string", required: true, min: 3, max: 120 },
    domain: { ...DOMAIN_RULE, required: true },
  });
  const domain = normalizeDomain(data.domain);

  if (get("SELECT 1 FROM colleges WHERE domain = ?", domain)) {
    throw new HttpError(409, "A college with this domain already exists", { domain: "A college with this domain already exists" });
  }

  const { lastInsertRowid } = run("INSERT INTO colleges (name, domain) VALUES (?, ?)", data.name, domain);
  return json({ college: get("SELECT * FROM colleges WHERE id = ?", lastInsertRowid) }, { status: 201 });
});
