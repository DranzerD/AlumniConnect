import { all, get, run } from "@/lib/db";
import { handler, json, readJson } from "@/lib/http";
import { requireUser } from "@/lib/session";

export const GET = handler(async (request) => {
  const me = await requireUser();
  const unreadOnly = request.nextUrl.searchParams.get("unread") === "1";

  const notifications = all(
    `SELECT id, type, title, body, link, is_read, created_at
       FROM notifications
      WHERE user_id = ? AND (? = 0 OR is_read = 0)
      ORDER BY id DESC
      LIMIT 100`,
    me.id,
    unreadOnly ? 1 : 0,
  );
  const { unread } = get(
    "SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0",
    me.id,
  );
  return json({ notifications, unread });
});

// PATCH { ids: [1, 2] } marks specific notifications read; PATCH {} marks all read.
export const PATCH = handler(async (request) => {
  const me = await requireUser();
  const body = await readJson(request);
  const ids = Array.isArray(body.ids)
    ? body.ids.map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 100)
    : null;

  if (ids && ids.length > 0) {
    run(
      `UPDATE notifications SET is_read = 1
        WHERE user_id = ? AND id IN (${ids.map(() => "?").join(",")})`,
      me.id,
      ...ids,
    );
  } else if (!ids) {
    run("UPDATE notifications SET is_read = 1 WHERE user_id = ?", me.id);
  }
  return json({ ok: true });
});
