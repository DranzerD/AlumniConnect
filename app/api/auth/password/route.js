import bcrypt from "bcryptjs";
import { get, run } from "@/lib/db";
import { handler, json, readJson, HttpError } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { validate, PASSWORD_RULE, assertStrongPassword } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export const PUT = handler(async (request) => {
  const user = await requireUser();
  rateLimit(`password:${user.id}`, { limit: 5, windowMs: 15 * 60 * 1000 });

  const data = validate(await readJson(request), {
    current_password: { type: "password", required: true, max: 72, label: "current password" },
    new_password: { ...PASSWORD_RULE, label: "new password" },
  });
  assertStrongPassword(data.new_password);

  const { password_hash } = get("SELECT password_hash FROM users WHERE id = ?", user.id);
  if (!(await bcrypt.compare(data.current_password, password_hash))) {
    throw new HttpError(422, "Current password is incorrect", {
      current_password: "Current password is incorrect",
    });
  }

  run(
    "UPDATE users SET password_hash = ? WHERE id = ?",
    await bcrypt.hash(data.new_password, 10),
    user.id,
  );
  return json({ ok: true });
});
