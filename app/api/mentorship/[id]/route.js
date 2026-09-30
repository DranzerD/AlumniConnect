import { get, run, transaction } from "@/lib/db";
import { handler, json, parseId, readJson, HttpError } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { validate } from "@/lib/validation";
import { findConnection, notify } from "@/lib/domain";

// Allowed transitions: who may perform each action, from which status, to which status.
const TRANSITIONS = {
  accept: { by: "mentor", from: "pending", to: "accepted" },
  decline: { by: "mentor", from: "pending", to: "declined" },
  complete: { by: "either", from: "accepted", to: "completed" },
  cancel: { by: "mentee", from: "pending", to: null }, // deletes the request
};

// PATCH { action: "accept" | "decline" | "complete" | "cancel" }
export const PATCH = handler(async (request, { params }) => {
  const me = await requireUser();
  const { action } = validate(await readJson(request), {
    action: { type: "enum", required: true, values: Object.keys(TRANSITIONS) },
  });

  const req = get(
    "SELECT * FROM mentorship_requests WHERE id = ? AND (mentor_id = ? OR mentee_id = ?)",
    parseId((await params).id),
    me.id,
    me.id,
  );
  if (!req) throw new HttpError(404, "Request not found");

  const rule = TRANSITIONS[action];
  const myRole = req.mentor_id === me.id ? "mentor" : "mentee";
  if (rule.by !== "either" && rule.by !== myRole) {
    throw new HttpError(403, `Only the ${rule.by} can ${action} this request`);
  }
  if (req.status !== rule.from) {
    throw new HttpError(409, `Can't ${action} a request that is ${req.status}`);
  }

  if (rule.to === null) {
    run("DELETE FROM mentorship_requests WHERE id = ?", req.id);
    return json({ request: { id: req.id, status: "cancelled" } });
  }

  transaction(() => {
    run(
      "UPDATE mentorship_requests SET status = ?, responded_at = datetime('now') WHERE id = ?",
      rule.to,
      req.id,
    );
    // An accepted mentorship connects the pair so they can message each other.
    if (rule.to === "accepted") {
      const existing = findConnection(req.mentor_id, req.mentee_id);
      if (!existing) {
        run(
          "INSERT INTO connections (requester_id, addressee_id, status, responded_at) VALUES (?, ?, 'accepted', datetime('now'))",
          req.mentee_id,
          req.mentor_id,
        );
      } else if (existing.status === "pending") {
        run("UPDATE connections SET status = 'accepted', responded_at = datetime('now') WHERE id = ?", existing.id);
      }
    }
  });

  const otherId = myRole === "mentor" ? req.mentee_id : req.mentor_id;
  notify(otherId, {
    type: `mentorship_${rule.to}`,
    title: `${me.fullName} ${action === "complete" ? "marked your mentorship as completed" : `${rule.to} your mentorship request`}`,
    body: req.topic,
    link: "/dashboard/mentorship",
  });

  return json({ request: { id: req.id, status: rule.to } });
});
