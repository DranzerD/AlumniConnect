import { all, get, run, transaction } from "@/lib/db";
import { handler, json, parseId, HttpError } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { notify } from "@/lib/domain";

// DELETE — cancel an event (organizer or admin). Attendees are notified.
export const DELETE = handler(async (_request, { params }) => {
  const me = await requireUser();
  const event = get(
    "SELECT * FROM events WHERE id = ? AND college_id = ?",
    parseId((await params).id),
    me.collegeId,
  );
  if (!event) throw new HttpError(404, "Event not found");
  if (event.organizer_id !== me.id && me.role !== "admin") {
    throw new HttpError(403, "Only the organizer can cancel this event");
  }

  transaction(() => {
    const attendees = all("SELECT user_id FROM event_rsvps WHERE event_id = ?", event.id);
    for (const { user_id } of attendees) {
      if (user_id === me.id) continue;
      notify(user_id, {
        type: "event_cancelled",
        title: `Event cancelled: ${event.title}`,
        link: "/dashboard/events",
      });
    }
    run("DELETE FROM events WHERE id = ?", event.id);
  });

  return json({ ok: true });
});
