import { all, run, transaction } from "@/lib/db";
import { handler, json, readJson, HttpError } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { validate } from "@/lib/validation";
import { getColleague, findConnection, notify } from "@/lib/domain";

const OTHER_USER_COLUMNS = `
  c.id, c.status, c.created_at, c.responded_at,
  u.id AS user_id, u.role, p.full_name, p.headline, p.current_company, p.current_role, p.graduation_year`;

export const GET = handler(async () => {
  const me = await requireUser();

  const connections = all(
    `SELECT ${OTHER_USER_COLUMNS}
       FROM connections c
       JOIN users u ON u.id = CASE WHEN c.requester_id = @me THEN c.addressee_id ELSE c.requester_id END
       JOIN profiles p ON p.user_id = u.id
      WHERE (c.requester_id = @me OR c.addressee_id = @me) AND c.status = 'accepted' AND u.is_active = 1
      ORDER BY p.full_name COLLATE NOCASE`,
    { me: me.id },
  );
  const incoming = all(
    `SELECT ${OTHER_USER_COLUMNS}
       FROM connections c JOIN users u ON u.id = c.requester_id JOIN profiles p ON p.user_id = u.id
      WHERE c.addressee_id = ? AND c.status = 'pending' AND u.is_active = 1
      ORDER BY c.created_at DESC`,
    me.id,
  );
  const outgoing = all(
    `SELECT ${OTHER_USER_COLUMNS}
       FROM connections c JOIN users u ON u.id = c.addressee_id JOIN profiles p ON p.user_id = u.id
      WHERE c.requester_id = ? AND c.status = 'pending' AND u.is_active = 1
      ORDER BY c.created_at DESC`,
    me.id,
  );

  return json({ connections, incoming, outgoing });
});

// POST { user_id } — send a connection request. If the other user already sent
// one to us, this accepts it instead of creating a duplicate.
export const POST = handler(async (request) => {
  const me = await requireUser();
  const { user_id } = validate(await readJson(request), {
    user_id: { type: "int", required: true, min: 1, label: "user" },
  });
  if (user_id === me.id) throw new HttpError(422, "You can't connect with yourself");
  const other = getColleague(me, user_id);

  const result = transaction(() => {
    const existing = findConnection(me.id, other.id);
    if (existing?.status === "accepted") throw new HttpError(409, "You are already connected");
    if (existing?.requester_id === me.id) throw new HttpError(409, "Request already sent");

    if (existing) {
      run(
        "UPDATE connections SET status = 'accepted', responded_at = datetime('now') WHERE id = ?",
        existing.id,
      );
      notify(other.id, {
        type: "connection_accepted",
        title: `${me.fullName} accepted your connection request`,
        link: `/dashboard/people/${me.id}`,
      });
      return { id: existing.id, status: "accepted" };
    }

    const { lastInsertRowid } = run(
      "INSERT INTO connections (requester_id, addressee_id) VALUES (?, ?)",
      me.id,
      other.id,
    );
    notify(other.id, {
      type: "connection_request",
      title: `${me.fullName} wants to connect`,
      link: "/dashboard/connections",
    });
    return { id: Number(lastInsertRowid), status: "pending" };
  });

  return json({ connection: result }, { status: 201 });
});
