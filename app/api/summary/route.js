import { get } from "@/lib/db";
import { handler, json } from "@/lib/http";
import { requireUser } from "@/lib/session";

// Badge counts for the navigation bar (polled by the client).
export const GET = handler(async () => {
  const me = await requireUser();
  const counts = get(
    `SELECT
       (SELECT COUNT(*) FROM notifications WHERE user_id = @me AND is_read = 0) AS notifications,
       (SELECT COUNT(*) FROM messages WHERE recipient_id = @me AND read_at IS NULL) AS messages,
       (SELECT COUNT(*) FROM connections WHERE addressee_id = @me AND status = 'pending') AS connections`,
    { me: me.id },
  );
  return json(counts);
});
