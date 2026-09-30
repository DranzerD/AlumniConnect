import { get, run } from "@/lib/db";
import { handler, json, parseId, readJson, HttpError } from "@/lib/http";
import { requireRole } from "@/lib/session";
import { validate } from "@/lib/validation";

// PATCH { is_active?, role? } — admins manage users in their own college only.
export const PATCH = handler(async (request, { params }) => {
  const admin = await requireRole("admin");
  const id = parseId((await params).id);
  const data = validate(
    await readJson(request),
    {
      is_active: { type: "bool" },
      role: { type: "enum", values: ["student", "alumni", "faculty", "admin"] },
    },
    { partial: true },
  );

  if (id === admin.id) throw new HttpError(422, "You can't change your own account here");
  const user = get("SELECT id FROM users WHERE id = ? AND college_id = ?", id, admin.collegeId);
  if (!user) throw new HttpError(404, "User not found");

  if (data.is_active !== undefined) {
    run("UPDATE users SET is_active = ? WHERE id = ?", data.is_active ? 1 : 0, id);
  }
  if (data.role) {
    run("UPDATE users SET role = ? WHERE id = ?", data.role, id);
    // Students can't mentor; keep profile flags consistent with the new role.
    if (data.role === "student" || data.role === "admin") {
      run("UPDATE profiles SET open_to_mentor = 0 WHERE user_id = ?", id);
    }
  }

  return json({
    user: get("SELECT id, email, role, is_active FROM users WHERE id = ?", id),
  });
});
