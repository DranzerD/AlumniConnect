import { get } from "@/lib/db";
import { handler, json, parseId, HttpError } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { CONNECTION_STATUS_SQL } from "@/lib/domain";

export const GET = handler(async (_request, { params }) => {
  const me = await requireUser();
  const id = parseId((await params).id);

  const profile = get(
    `SELECT u.id, u.role, u.email, u.created_at, p.*,
            c.id AS connection_id, ${CONNECTION_STATUS_SQL} AS connection_status,
            (SELECT COUNT(*) FROM connections x
              WHERE x.status = 'accepted' AND (x.requester_id = u.id OR x.addressee_id = u.id)
            ) AS connection_count
       FROM users u
       JOIN profiles p ON p.user_id = u.id
       LEFT JOIN connections c
         ON (c.requester_id = u.id AND c.addressee_id = @me)
         OR (c.addressee_id = u.id AND c.requester_id = @me)
      WHERE u.id = @id AND u.college_id = @college AND u.is_active = 1`,
    { id, me: me.id, college: me.collegeId },
  );
  if (!profile) throw new HttpError(404, "Profile not found");

  const isSelf = profile.id === me.id;
  const connected = profile.connection_status === "connected";
  if (!profile.is_public && !isSelf && !connected && me.role !== "admin") {
    throw new HttpError(404, "Profile not found");
  }

  // Email addresses are only shared with connections.
  if (!isSelf && !connected && me.role !== "admin") delete profile.email;
  delete profile.user_id;

  return json({ profile: { ...profile, is_self: isSelf } });
});
