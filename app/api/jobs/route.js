import { all, get, run } from "@/lib/db";
import { handler, json, readJson, getPagination, HttpError } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { validate } from "@/lib/validation";
import { CAN_POST_JOBS, JOB_TYPES } from "@/lib/domain";

// GET /api/jobs?q=&type=&remote=1&mine=1&status=open|closed&page=
export const GET = handler(async (request) => {
  const me = await requireUser();
  const { searchParams } = request.nextUrl;
  const { page, limit, offset } = getPagination(searchParams, { defaultLimit: 10 });
  const q = searchParams.get("q")?.trim();

  const params = {
    me: me.id,
    college: me.collegeId,
    q: q ? `%${q.replace(/[\\%_]/g, "\\$&")}%` : null,
    type: JOB_TYPES.includes(searchParams.get("type")) ? searchParams.get("type") : null,
    remote: searchParams.get("remote") === "1" ? 1 : null,
    mine: searchParams.get("mine") === "1" ? 1 : null,
    status: searchParams.get("status") === "closed" ? "closed" : "open",
  };

  const where = `
    FROM jobs j JOIN profiles p ON p.user_id = j.posted_by
    WHERE j.college_id = @college AND j.status = @status
      AND (@q IS NULL OR j.title LIKE @q ESCAPE '\\' OR j.company_name LIKE @q ESCAPE '\\'
           OR j.location LIKE @q ESCAPE '\\' OR j.description LIKE @q ESCAPE '\\')
      AND (@type IS NULL OR j.job_type = @type)
      AND (@remote IS NULL OR j.is_remote = 1)
      AND (@mine IS NULL OR j.posted_by = @me)`;

  const { total } = get(`SELECT COUNT(*) AS total ${where}`, params);
  const jobs = all(
    `SELECT j.*, p.full_name AS posted_by_name, p.current_company AS poster_company,
            (j.posted_by = @me) AS is_owner
     ${where}
     ORDER BY j.created_at DESC, j.id DESC
     LIMIT @limit OFFSET @offset`,
    { ...params, limit, offset },
  );

  return json({
    jobs,
    canPost: CAN_POST_JOBS.includes(me.role),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

export const POST = handler(async (request) => {
  const me = await requireUser();
  if (!CAN_POST_JOBS.includes(me.role)) {
    throw new HttpError(403, "Only alumni, faculty and admins can post jobs");
  }

  const data = validate(await readJson(request), {
    title: { type: "string", required: true, min: 3, max: 120 },
    company_name: { type: "string", required: true, max: 80, label: "company" },
    job_type: { type: "enum", required: true, values: JOB_TYPES, label: "job type" },
    location: { type: "string", max: 80 },
    is_remote: { type: "bool" },
    description: { type: "string", required: true, min: 20, max: 5000 },
    apply_url: { type: "url", required: true, label: "application link" },
  });

  const { lastInsertRowid } = run(
    `INSERT INTO jobs (college_id, posted_by, company_name, title, job_type, location, is_remote, description, apply_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    me.collegeId,
    me.id,
    data.company_name,
    data.title,
    data.job_type,
    data.location ?? null,
    data.is_remote ? 1 : 0,
    data.description,
    data.apply_url,
  );

  return json({ job: get("SELECT * FROM jobs WHERE id = ?", lastInsertRowid) }, { status: 201 });
});
