"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/client";
import { useDebounce } from "@/lib/hooks";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { EmptyState, ErrorState, Field, Pagination, SkeletonList } from "@/components/ui";
import { ExternalLink } from "lucide-react";
import { JOB_TYPE_LABELS, timeAgo } from "@/lib/format";

function JobsBoard() {
  const toast = useToast();
  const [q, setQ] = useState(useSearchParams().get("q") ?? "");
  const [filters, setFilters] = useState({ type: "", remote: false, mine: false, status: "open" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);
  const [version, setVersion] = useState(0);
  const query = useDebounce(q, 300);

  useEffect(() => setPage(1), [query, filters]);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), status: filters.status });
    if (query) params.set("q", query);
    if (filters.type) params.set("type", filters.type);
    if (filters.remote) params.set("remote", "1");
    if (filters.mine) params.set("mine", "1");
    let cancelled = false;
    api(`/api/jobs?${params}`).then((res) => !cancelled && setData(res)).catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [query, filters, page, version]);

  const refresh = () => setVersion((v) => v + 1);
  const setFilter = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function update(job, method, body, message) {
    try {
      await api(`/api/jobs/${job.id}`, { method, body });
      toast(message, "success");
      refresh();
    } catch (err) {
      toast(err.message, "error");
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Jobs</h1>
          <p>Opportunities shared by alumni and faculty from your college.</p>
        </div>
        {data?.canPost && <button className="btn btn-primary" onClick={() => setPosting(true)}>Post a job</button>}
      </div>

      <div className="filters">
        <input className="input" type="search" placeholder="Search title, company, location…" value={q}
          onChange={(e) => setQ(e.target.value)} aria-label="Search jobs" />
        <select className="select" value={filters.type} onChange={setFilter("type")} aria-label="Job type">
          <option value="">All types</option>
          {Object.entries(JOB_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="select" value={filters.status} onChange={setFilter("status")} aria-label="Status">
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        <label className="checkbox">
          <input type="checkbox" checked={filters.remote} onChange={setFilter("remote")} /> Remote
        </label>
        {data?.canPost && (
          <label className="checkbox">
            <input type="checkbox" checked={filters.mine} onChange={setFilter("mine")} /> Posted by me
          </label>
        )}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => { setError(""); refresh(); }} />
      ) : !data ? (
        <SkeletonList rows={5} />
      ) : data.jobs.length === 0 ? (
        <EmptyState title={filters.mine ? "You haven't posted any jobs" : "No jobs match"}>
          {filters.mine ? "Jobs you post will be listed here." : "Try a different search or clear the filters."}
        </EmptyState>
      ) : (
        <>
          <ul className="card card-flush list">
            {data.jobs.map((job) => (
              <li key={job.id} style={{ alignItems: "flex-start" }}>
                <div className="list-item-main stack" style={{ gap: "var(--s1)" }}>
                  <div className="row">
                    <h3 className="truncate">{job.title}</h3>
                    <span className="badge">{JOB_TYPE_LABELS[job.job_type]}</span>
                    {job.status === "closed" && <span className="badge badge-warning">Closed</span>}
                  </div>
                  <span className="small secondary">
                    {job.company_name} · {job.location || "Location not set"}{job.is_remote && !/remote/i.test(job.location ?? "") ? " · Remote" : ""}
                  </span>
                  <p className="small muted clamp-2" style={{ maxWidth: "72ch" }}>{job.description}</p>
                  <span className="small muted">
                    Posted by <Link href={`/dashboard/people/${job.posted_by}`}>{job.posted_by_name}</Link> · {timeAgo(job.created_at)}
                  </span>
                </div>
                <div className="row" style={{ flexWrap: "nowrap" }}>
                  {job.is_owner ? (
                    <>
                      <button className="btn btn-sm"
                        onClick={() => update(job, "PATCH", { status: job.status === "open" ? "closed" : "open" },
                          job.status === "open" ? "Job closed" : "Job reopened")}>
                        {job.status === "open" ? "Close" : "Reopen"}
                      </button>
                      <button className="btn btn-sm btn-danger"
                        onClick={() => confirm("Delete this job posting?") && update(job, "DELETE", undefined, "Job deleted")}>
                        Delete
                      </button>
                    </>
                  ) : null}
                  {job.status === "open" && (
                    <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                      Apply <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={page} totalPages={data.pagination.totalPages} total={data.pagination.total} onChange={setPage} />
        </>
      )}

      {posting && <PostJobModal onClose={() => setPosting(false)} onPosted={() => { refresh(); toast("Job posted", "success"); }} />}
    </>
  );
}

function PostJobModal({ onClose, onPosted }) {
  const [form, setForm] = useState({
    title: "", company_name: "", job_type: "full-time", location: "", is_remote: false, description: "", apply_url: "",
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/jobs", { method: "POST", body: form });
      onPosted();
      onClose();
    } catch (err) {
      setErrors({ ...err.details, _form: err.message });
      setBusy(false);
    }
  }

  return (
    <Modal title="Post a job" onClose={onClose}>
      <form className="stack" onSubmit={submit} noValidate>
        {errors._form && <div className="alert alert-error">{errors._form}</div>}
        <div className="form-grid">
          <Field label="Job title" htmlFor="title" error={errors.title} className="full">
            <input id="title" className="input" value={form.title} onChange={set("title")} aria-invalid={Boolean(errors.title)} />
          </Field>
          <Field label="Company" htmlFor="company" error={errors.company_name}>
            <input id="company" className="input" value={form.company_name} onChange={set("company_name")} aria-invalid={Boolean(errors.company_name)} />
          </Field>
          <Field label="Type" htmlFor="job_type" error={errors.job_type}>
            <select id="job_type" className="select" value={form.job_type} onChange={set("job_type")}>
              {Object.entries(JOB_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Location" htmlFor="location" error={errors.location}>
            <input id="location" className="input" value={form.location} onChange={set("location")} />
          </Field>
          <label className="checkbox" style={{ alignSelf: "end", paddingBottom: "var(--s2)" }}>
            <input type="checkbox" checked={form.is_remote} onChange={set("is_remote")} /> Remote friendly
          </label>
          <Field label="Application link" htmlFor="apply_url" error={errors.apply_url} className="full">
            <input id="apply_url" className="input" type="url" placeholder="https://" value={form.apply_url} onChange={set("apply_url")} aria-invalid={Boolean(errors.apply_url)} />
          </Field>
          <Field label="Description" htmlFor="description" error={errors.description} className="full" hint="At least 20 characters">
            <textarea id="description" className="textarea" value={form.description} onChange={set("description")} aria-invalid={Boolean(errors.description)} />
          </Field>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? "Posting…" : "Post job"}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function JobsPage() {
  return (
    <Suspense>
      <JobsBoard />
    </Suspense>
  );
}
