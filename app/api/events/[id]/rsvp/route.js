import { get, run, transaction } from "@/lib/db";
import { handler, json, parseId, HttpError } from "@/lib/http";
import { requireUser } from "@/lib/session";

async function loadEvent(params, me) {
  const event = get(
    "SELECT * FROM events WHERE id = ? AND college_id = ?",
    parseId((await params).id),
    me.collegeId,
  );
  if (!event) throw new HttpError(404, "Event not found");
  if (event.starts_at < new Date().toISOString()) {
    throw new HttpError(409, "This event has already started");
  }
  return event;
}

function rsvpCount(eventId) {
  return get("SELECT COUNT(*) AS n FROM event_rsvps WHERE event_id = ?", eventId).n;
}

// POST — RSVP. The capacity check and insert run in one transaction so the
// event can't be overbooked.
export const POST = handler(async (_request, { params }) => {
  const me = await requireUser();
  const event = await loadEvent(params, me);

  const count = transaction(() => {
    if (get("SELECT 1 FROM event_rsvps WHERE event_id = ? AND user_id = ?", event.id, me.id)) {
      throw new HttpError(409, "You're already registered");
    }
    const current = rsvpCount(event.id);
    if (event.capacity !== null && current >= event.capacity) {
      throw new HttpError(409, "This event is full");
    }
    run("INSERT INTO event_rsvps (event_id, user_id) VALUES (?, ?)", event.id, me.id);
    return current + 1;
  });

  return json({ is_going: true, rsvp_count: count }, { status: 201 });
});

export const DELETE = handler(async (_request, { params }) => {
  const me = await requireUser();
  const event = await loadEvent(params, me);
  run("DELETE FROM event_rsvps WHERE event_id = ? AND user_id = ?", event.id, me.id);
  return json({ is_going: false, rsvp_count: rsvpCount(event.id) });
});
