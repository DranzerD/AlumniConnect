import bcrypt from "bcryptjs";
import { get, run, transaction } from "@/lib/db";
import { handler, json, parseId, readJson, HttpError } from "@/lib/http";
import { requireRole } from "@/lib/session";
import { validate, assertStrongPassword } from "@/lib/validation";

// POST { email, full_name?, password? } — appoint a college admin.
// If the email belongs to an existing member of that college they are promoted;
// otherwise a new admin account is created (full_name and password required).
export const POST = handler(async (request, { params }) => {
  await requireRole("superadmin");
  const college = get("SELECT * FROM colleges WHERE id = ?", parseId((await params).id));
  if (!college) throw new HttpError(404, "College not found");

  const data = validate(await readJson(request), {
    email: { type: "email", required: true },
    full_name: { type: "string", min: 2, max: 80, label: "full name" },
    password: { type: "password", min: 8, max: 72, label: "temporary password" },
  });

  const emailDomain = data.email.split("@")[1];
  if (emailDomain !== college.domain && !emailDomain.endsWith(`.${college.domain}`)) {
    const message = `Email must be an @${college.domain} address`;
    throw new HttpError(422, message, { email: message });
  }

  const existing = get("SELECT id, college_id, role FROM users WHERE email = ?", data.email);
  if (existing) {
    if (existing.college_id !== college.id) throw new HttpError(409, "That email belongs to another college");
    if (existing.role === "admin") throw new HttpError(409, "This person is already an admin");
    run("UPDATE users SET role = 'admin', is_active = 1 WHERE id = ?", existing.id);
    run("UPDATE profiles SET open_to_mentor = 0 WHERE user_id = ?", existing.id);
    return json({ admin: { id: existing.id, email: data.email, promoted: true } });
  }

  if (!data.full_name || !data.password) {
    const errors = {};
    if (!data.full_name) errors.full_name = "Full name is required for a new account";
    if (!data.password) errors.password = "A temporary password is required for a new account";
    throw new HttpError(422, "No account with that email yet. Add a name and temporary password to create one.", errors);
  }
  assertStrongPassword(data.password);

  const hash = await bcrypt.hash(data.password, 10);
  const id = transaction(() => {
    const { lastInsertRowid } = run(
      "INSERT INTO users (college_id, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
      college.id, data.email, hash,
    );
    run("INSERT INTO profiles (user_id, full_name) VALUES (?, ?)", lastInsertRowid, data.full_name);
    return Number(lastInsertRowid);
  });
  return json({ admin: { id, email: data.email, promoted: false } }, { status: 201 });
});
