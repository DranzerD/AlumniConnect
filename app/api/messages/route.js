import { all } from "@/lib/db";
import { handler, json } from "@/lib/http";
import { requireUser } from "@/lib/session";

// GET /api/messages — one row per conversation partner with the latest message
// and the number of unread messages from them.
export const GET = handler(async () => {
  const me = await requireUser();

  const conversations = all(
    `WITH mine AS (
       SELECT id, CASE WHEN sender_id = @me THEN recipient_id ELSE sender_id END AS other_id
         FROM messages
        WHERE sender_id = @me OR recipient_id = @me
     ),
     latest AS (SELECT other_id, MAX(id) AS last_id FROM mine GROUP BY other_id)
     SELECT l.other_id AS user_id, p.full_name, p.headline,
            m.body AS last_message, m.created_at AS last_at, (m.sender_id = @me) AS last_from_me,
            (SELECT COUNT(*) FROM messages x
              WHERE x.sender_id = l.other_id AND x.recipient_id = @me AND x.read_at IS NULL) AS unread
       FROM latest l
       JOIN messages m ON m.id = l.last_id
       JOIN profiles p ON p.user_id = l.other_id
      ORDER BY m.id DESC`,
    { me: me.id },
  );

  return json({ conversations });
});
