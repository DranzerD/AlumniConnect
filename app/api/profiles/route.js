import { all, get } from "@/lib/db";
import { handler, json, getPagination } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { CONNECTION_STATUS_SQL } from "@/lib/domain";

const likeParam = (value) => (value ? `%${value.replace(/[\\%_]/g, "\\$&")}%` : null);

// GET /api/profiles?q=&role=&year=&department=&mentors=1&page=&limit=
export const GET = handler(async (request) => {
  const me = await requireUser();
  const { searchParams } = request.nextUrl;
  const { page, limit, offset } = getPagination(searchParams, { defaultLimit: 12 });

  const params = {
    me: me.id,
    college: me.collegeId,
    q: likeParam(searchParams.get("q")?.trim()),
    role: searchParams.get("role") || null,
    year: parseInt(searchParams.get("year"), 10) || null,
    department: searchParams.get("department") || null,
    mentors: searchParams.get("mentors") === "1" ? 1 : null,
  };

  const where = `
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    LEFT JOIN connections c
      ON (c.requester_id = u.id AND c.addressee_id = @me)
      OR (c.addressee_id = u.id AND c.requester_id = @me)
    WHERE u.college_id = @college AND u.is_active = 1 AND p.is_public = 1 AND u.id <> @me
      AND (@q IS NULL OR p.full_name LIKE @q ESCAPE '\\' OR p.current_company LIKE @q ESCAPE '\\'
           OR p.headline LIKE @q ESCAPE '\\' OR p.skills LIKE @q ESCAPE '\\')
      AND (@role IS NULL OR u.role = @role)
      AND (@year IS NULL OR p.graduation_year = @year)
      AND (@department IS NULL OR p.department = @department)
      AND (@mentors IS NULL OR p.open_to_mentor = 1)`;

  const { total } = get(`SELECT COUNT(*) AS total ${where}`, params);
  const profiles = all(
    `SELECT u.id, u.role, p.full_name, p.headline, p.graduation_year, p.department,
            p.current_company, p.current_role, p.location, p.skills, p.open_to_mentor,
            ${CONNECTION_STATUS_SQL} AS connection_status
     ${where}
     ORDER BY p.full_name COLLATE NOCASE
     LIMIT @limit OFFSET @offset`,
    { ...params, limit, offset },
  );

  // Values for the directory's filter dropdowns.
  const departments = all(
    `SELECT DISTINCT p.department FROM profiles p JOIN users u ON u.id = p.user_id
      WHERE u.college_id = ? AND p.department IS NOT NULL ORDER BY p.department`,
    me.collegeId,
  ).map((r) => r.department);
  const years = all(
    `SELECT DISTINCT p.graduation_year FROM profiles p JOIN users u ON u.id = p.user_id
      WHERE u.college_id = ? AND p.graduation_year IS NOT NULL ORDER BY p.graduation_year DESC`,
    me.collegeId,
  ).map((r) => r.graduation_year);

  return json({
    profiles,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    filters: { departments, years },
  });
});
