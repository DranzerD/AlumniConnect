import { all, get, run } from "@/lib/db";
import { handler, json, parseId, readJson, HttpError } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { validate } from "@/lib/validation";
import { getColleague, findConnection } from "@/lib/domain";

const THREAD_LIMIT = 200;

// GET /api/messages/:userId?after=<messageId>
// Returns the thread with a user (or only messages newer than `after`, which the
// client uses for polling) and marks their messages to us as read.
export const GET = handler(async (request, { params }) => {
  const me = await requireUser();
  const other = getColleague(me, parseId((await params).userId));
  const after = parseInt(request.nextUrl.searchParams.get("after"), 10) || 0;

  const messages = all(
    `SELECT * FROM (
       SELECT id, sender_id, recipient_id, body, created_at, read_at
         FROM messages
        WHERE id > @after
          AND ((sender_id = @me AND recipient_id = @other) OR (sender_id = @other AND recipient_id = @me))
        ORDER BY id DESC
        LIMIT ${THREAD_LIMIT}
     ) ORDER BY id ASC`,
    { me: me.id, other: other.id, after },
  );

  run(
    "UPDATE messages SET read_at = datetime('now') WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL",
    other.id,
    me.id,
  );

  const headline = get("SELECT headline FROM profiles WHERE user_id = ?", other.id)?.headline;
  return json({
    user: { id: other.id, full_name: other.fullName, headline },
    canMessage: findConnection(me.id, other.id)?.status === "accepted",
    messages,
  });
});

// POST /api/messages/:userId { body } — only between accepted connections.
export const POST = handler(async (request, { params }) => {
  const me = await requireUser();
  const other = getColleague(me, parseId((await params).userId));
  const { body } = validate(await readJson(request), {
    body: { type: "string", required: true, max: 2000, label: "message" },
  });

  if (findConnection(me.id, other.id)?.status !== "accepted") {
    throw new HttpError(403, "You can only message your connections");
  }

  const { lastInsertRowid } = run(
    "INSERT INTO messages (sender_id, recipient_id, body) VALUES (?, ?, ?)",
    me.id,
    other.id,
    body,
  );
  const message = get(
    "SELECT id, sender_id, recipient_id, body, created_at, read_at FROM messages WHERE id = ?",
    lastInsertRowid,
  );
  return json({ message }, { status: 201 });
});
