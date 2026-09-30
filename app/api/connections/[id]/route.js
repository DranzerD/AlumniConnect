import { get, run } from "@/lib/db";
import { handler, json, parseId, readJson, HttpError } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { validate } from "@/lib/validation";
import { notify } from "@/lib/domain";

function loadOwnConnection(id, userId) {
  const connection = get(
    "SELECT * FROM connections WHERE id = ? AND (requester_id = ? OR addressee_id = ?)",
    id,
    userId,
    userId,
  );
  if (!connection) throw new HttpError(404, "Connection not found");
  return connection;
}

// PATCH { action: "accept" } — only the recipient of a pending request can accept it.
export const PATCH = handler(async (request, { params }) => {
  const me = await requireUser();
  const connection = loadOwnConnection(parseId((await params).id), me.id);
  validate(await readJson(request), { action: { type: "enum", required: true, values: ["accept"] } });

  if (connection.status !== "pending" || connection.addressee_id !== me.id) {
    throw new HttpError(409, "This request can't be accepted");
  }

  run(
    "UPDATE connections SET status = 'accepted', responded_at = datetime('now') WHERE id = ?",
    connection.id,
  );
  notify(connection.requester_id, {
    type: "connection_accepted",
    title: `${me.fullName} accepted your connection request`,
    link: `/dashboard/people/${me.id}`,
  });
  return json({ connection: { id: connection.id, status: "accepted" } });
});

// DELETE — decline an incoming request, cancel an outgoing one, or remove a connection.
export const DELETE = handler(async (_request, { params }) => {
  const me = await requireUser();
  const connection = loadOwnConnection(parseId((await params).id), me.id);
  run("DELETE FROM connections WHERE id = ?", connection.id);
  return json({ ok: true });
});
