import { get } from "@/lib/db";
import { handler, json } from "@/lib/http";
import { requireUser } from "@/lib/session";

// Badge counts for the navigation bar (polled by the client). Messages and
// connection requests from deactivated users are excluded, matching the
// Connections page, which hides inactive users.
export const GET = handler(async () => {
  const me = await requireUser();
  const counts = get(
    `SELECT
       (SELECT COUNT(*) FROM notifications WHERE user_id = @me AND is_read = 0) AS notifications,
       (SELECT COUNT(*) FROM messages m JOIN users u ON u.id = m.sender_id
         WHERE m.recipient_id = @me AND m.read_at IS NULL AND u.is_active = 1) AS messages,
       (SELECT COUNT(*) FROM connections c JOIN users u ON u.id = c.requester_id
         WHERE c.addressee_id = @me AND c.status = 'pending' AND u.is_active = 1) AS connections`,
    { me: me.id },
  );
  return json(counts);
});
