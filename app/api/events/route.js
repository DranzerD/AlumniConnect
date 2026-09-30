import { all, get, run } from "@/lib/db";
import { handler, json, readJson, HttpError } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { validate } from "@/lib/validation";
import { CAN_CREATE_EVENTS, EVENT_TYPES } from "@/lib/domain";

const EVENT_COLUMNS = `
  e.*, p.full_name AS organizer_name,
  (SELECT COUNT(*) FROM event_rsvps r WHERE r.event_id = e.id) AS rsvp_count,
  EXISTS (SELECT 1 FROM event_rsvps r WHERE r.event_id = e.id AND r.user_id = @me) AS is_going,
  (e.organizer_id = @me OR @isAdmin) AS can_manage`;

// GET /api/events?when=upcoming|past|going
export const GET = handler(async (request) => {
  const me = await requireUser();
  const when = request.nextUrl.searchParams.get("when") ?? "upcoming";

  const filter = {
    upcoming: "e.starts_at >= @now ORDER BY e.starts_at ASC",
    past: "e.starts_at < @now ORDER BY e.starts_at DESC",
    going: `e.starts_at >= @now AND EXISTS (SELECT 1 FROM event_rsvps r WHERE r.event_id = e.id AND r.user_id = @me)
            ORDER BY e.starts_at ASC`,
  }[when];
  if (!filter) throw new HttpError(400, "Invalid filter");

  const events = all(
    `SELECT ${EVENT_COLUMNS}
       FROM events e JOIN profiles p ON p.user_id = e.organizer_id
      WHERE e.college_id = @college AND ${filter}
      LIMIT 100`,
    { me: me.id, college: me.collegeId, now: new Date().toISOString(), isAdmin: me.role === "admin" ? 1 : 0 },
  );

  return json({ events, canCreate: CAN_CREATE_EVENTS.includes(me.role) });
});

export const POST = handler(async (request) => {
  const me = await requireUser();
  if (!CAN_CREATE_EVENTS.includes(me.role)) {
    throw new HttpError(403, "Only alumni, faculty and admins can create events");
  }

  const data = validate(await readJson(request), {
    title: { type: "string", required: true, min: 3, max: 120 },
    description: { type: "string", required: true, min: 10, max: 3000 },
    event_type: { type: "enum", required: true, values: EVENT_TYPES, label: "event type" },
    starts_at: { type: "datetime", required: true, label: "start time" },
    location: { type: "string", required: true, max: 160 },
    is_virtual: { type: "bool" },
    capacity: { type: "int", min: 1, max: 10000 },
  });
  if (data.starts_at <= new Date().toISOString()) {
    throw new HttpError(422, "Start time must be in the future", { starts_at: "Start time must be in the future" });
  }

  const { lastInsertRowid } = run(
    `INSERT INTO events (college_id, organizer_id, title, description, event_type, starts_at, location, is_virtual, capacity)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    me.collegeId,
    me.id,
    data.title,
    data.description,
    data.event_type,
    data.starts_at,
    data.location,
    data.is_virtual ? 1 : 0,
    data.capacity ?? null,
  );

  return json({ event: get("SELECT * FROM events WHERE id = ?", lastInsertRowid) }, { status: 201 });
});
