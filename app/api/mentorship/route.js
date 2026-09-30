import { all, get, run } from "@/lib/db";
import { handler, json, readJson, HttpError } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { validate } from "@/lib/validation";
import { getColleague, notify, CAN_MENTOR } from "@/lib/domain";

const REQUEST_COLUMNS = `
  r.id, r.topic, r.message, r.status, r.created_at, r.responded_at,
  u.id AS user_id, p.full_name, p.headline`;

export const GET = handler(async () => {
  const me = await requireUser();

  const mentors = all(
    `SELECT u.id, u.role, p.full_name, p.headline, p.current_company, p.current_role,
            p.graduation_year, p.skills, p.bio,
            (SELECT r.status FROM mentorship_requests r
              WHERE r.mentor_id = u.id AND r.mentee_id = @me AND r.status IN ('pending', 'accepted')
              ORDER BY r.id DESC LIMIT 1) AS request_status
       FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE u.college_id = @college AND u.is_active = 1 AND p.open_to_mentor = 1 AND u.id <> @me
      ORDER BY p.full_name COLLATE NOCASE`,
    { me: me.id, college: me.collegeId },
  );

  // Requests where I'm the mentor / where I'm the mentee.
  const incoming = all(
    `SELECT ${REQUEST_COLUMNS}
       FROM mentorship_requests r JOIN users u ON u.id = r.mentee_id JOIN profiles p ON p.user_id = u.id
      WHERE r.mentor_id = ?
      ORDER BY CASE r.status WHEN 'pending' THEN 0 WHEN 'accepted' THEN 1 ELSE 2 END, r.created_at DESC`,
    me.id,
  );
  const outgoing = all(
    `SELECT ${REQUEST_COLUMNS}
       FROM mentorship_requests r JOIN users u ON u.id = r.mentor_id JOIN profiles p ON p.user_id = u.id
      WHERE r.mentee_id = ?
      ORDER BY CASE r.status WHEN 'pending' THEN 0 WHEN 'accepted' THEN 1 ELSE 2 END, r.created_at DESC`,
    me.id,
  );

  const { open_to_mentor } = get("SELECT open_to_mentor FROM profiles WHERE user_id = ?", me.id);
  return json({
    mentors,
    incoming,
    outgoing,
    canMentor: CAN_MENTOR.includes(me.role),
    isMentor: Boolean(open_to_mentor),
  });
});

// POST { mentor_id, topic, message }
export const POST = handler(async (request) => {
  const me = await requireUser();
  const data = validate(await readJson(request), {
    mentor_id: { type: "int", required: true, min: 1, label: "mentor" },
    topic: { type: "string", required: true, min: 3, max: 100 },
    message: { type: "string", required: true, min: 10, max: 1000 },
  });

  if (data.mentor_id === me.id) throw new HttpError(422, "You can't mentor yourself");
  const mentor = getColleague(me, data.mentor_id);
  if (!mentor.openToMentor) throw new HttpError(422, `${mentor.fullName} isn't accepting mentees right now`);

  const active = get(
    `SELECT 1 FROM mentorship_requests
      WHERE mentee_id = ? AND mentor_id = ? AND status IN ('pending', 'accepted')`,
    me.id,
    mentor.id,
  );
  if (active) throw new HttpError(409, "You already have an active request with this mentor");

  const { lastInsertRowid } = run(
    "INSERT INTO mentorship_requests (mentee_id, mentor_id, topic, message) VALUES (?, ?, ?, ?)",
    me.id,
    mentor.id,
    data.topic,
    data.message,
  );
  notify(mentor.id, {
    type: "mentorship_request",
    title: `${me.fullName} requested mentorship`,
    body: data.topic,
    link: "/dashboard/mentorship",
  });

  return json({ request: { id: Number(lastInsertRowid), status: "pending" } }, { status: 201 });
});
