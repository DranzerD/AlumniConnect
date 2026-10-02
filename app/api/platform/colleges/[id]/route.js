import { get, run } from "@/lib/db";
import { handler, json, parseId, readJson, HttpError } from "@/lib/http";
import { requireRole } from "@/lib/session";
import { validate } from "@/lib/validation";
import { DOMAIN_RULE, normalizeDomain } from "@/lib/domain";

// PATCH { name?, domain?, is_active? }
// Deactivating a college signs its members out and blocks logins; nothing is deleted.
export const PATCH = handler(async (request, { params }) => {
  await requireRole("superadmin");
  const id = parseId((await params).id);
  const college = get("SELECT * FROM colleges WHERE id = ?", id);
  if (!college) throw new HttpError(404, "College not found");

  const data = validate(
    await readJson(request),
    { name: { type: "string", min: 3, max: 120 }, domain: DOMAIN_RULE, is_active: { type: "bool" } },
    { partial: true },
  );

  if (data.name) run("UPDATE colleges SET name = ? WHERE id = ?", data.name, id);
  if (data.domain) {
    const domain = normalizeDomain(data.domain);
    if (get("SELECT 1 FROM colleges WHERE domain = ? AND id <> ?", domain, id)) {
      throw new HttpError(409, "A college with this domain already exists", { domain: "A college with this domain already exists" });
    }
    // Existing members keep their accounts; the new domain applies to future sign-ups.
    run("UPDATE colleges SET domain = ? WHERE id = ?", domain, id);
  }
  if (data.is_active !== undefined) run("UPDATE colleges SET is_active = ? WHERE id = ?", data.is_active ? 1 : 0, id);

  return json({ college: get("SELECT * FROM colleges WHERE id = ?", id) });
});
