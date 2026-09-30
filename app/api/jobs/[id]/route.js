import { get, run } from "@/lib/db";
import { handler, json, parseId, readJson, HttpError } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { validate } from "@/lib/validation";

// Only the poster or an admin of the same college may modify a job.
async function loadEditableJob(params) {
  const me = await requireUser();
  const job = get(
    "SELECT * FROM jobs WHERE id = ? AND college_id = ?",
    parseId((await params).id),
    me.collegeId,
  );
  if (!job) throw new HttpError(404, "Job not found");
  if (job.posted_by !== me.id && me.role !== "admin") {
    throw new HttpError(403, "You can only manage jobs you posted");
  }
  return job;
}

// PATCH { status: "open" | "closed" }
export const PATCH = handler(async (request, { params }) => {
  const job = await loadEditableJob(params);
  const { status } = validate(await readJson(request), {
    status: { type: "enum", required: true, values: ["open", "closed"] },
  });
  run("UPDATE jobs SET status = ? WHERE id = ?", status, job.id);
  return json({ job: { ...job, status } });
});

export const DELETE = handler(async (_request, { params }) => {
  const job = await loadEditableJob(params);
  run("DELETE FROM jobs WHERE id = ?", job.id);
  return json({ ok: true });
});
