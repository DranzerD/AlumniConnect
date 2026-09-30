import { get, run } from "@/lib/db";
import { handler, json, readJson, HttpError } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { validate } from "@/lib/validation";
import { CAN_MENTOR } from "@/lib/domain";

const currentYear = new Date().getFullYear();

const PROFILE_RULES = {
  full_name: { type: "string", required: true, min: 2, max: 80, label: "full name" },
  headline: { type: "string", max: 120 },
  graduation_year: { type: "int", min: 1950, max: currentYear + 6, label: "graduation year" },
  degree: { type: "string", max: 80 },
  department: { type: "string", max: 80 },
  current_company: { type: "string", max: 80, label: "company" },
  current_role: { type: "string", max: 80, label: "role" },
  location: { type: "string", max: 80 },
  bio: { type: "string", max: 1000 },
  skills: { type: "string", max: 300 },
  linkedin_url: { type: "url", label: "LinkedIn URL" },
  github_url: { type: "url", label: "GitHub URL" },
  is_public: { type: "bool" },
  open_to_mentor: { type: "bool" },
};

function loadProfile(userId) {
  return get(
    `SELECT u.id, u.email, u.role, c.name AS college_name, p.*
       FROM users u JOIN profiles p ON p.user_id = u.id JOIN colleges c ON c.id = u.college_id
      WHERE u.id = ?`,
    userId,
  );
}

export const GET = handler(async () => {
  const me = await requireUser();
  return json({ profile: loadProfile(me.id) });
});

// Partial update: only fields present in the body are changed.
export const PUT = handler(async (request) => {
  const me = await requireUser();
  const data = validate(await readJson(request), PROFILE_RULES, { partial: true });

  if (data.full_name === null) {
    throw new HttpError(422, "Full name is required", { full_name: "Full name is required" });
  }
  if (data.open_to_mentor && !CAN_MENTOR.includes(me.role)) {
    throw new HttpError(422, "Only alumni and faculty can offer mentorship");
  }
  if (typeof data.skills === "string") {
    data.skills = data.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 15)
      .join(", ");
  }

  const fields = Object.keys(data);
  if (fields.length > 0) {
    const assignments = fields.map((f) => `${f} = @${f}`).join(", ");
    const values = Object.fromEntries(
      fields.map((f) => [f, typeof data[f] === "boolean" ? Number(data[f]) : data[f]]),
    );
    run(
      `UPDATE profiles SET ${assignments}, updated_at = datetime('now') WHERE user_id = @user_id`,
      { ...values, user_id: me.id },
    );
  }

  return json({ profile: loadProfile(me.id) });
});
