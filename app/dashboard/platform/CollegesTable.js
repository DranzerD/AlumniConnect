"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { useApi } from "@/lib/hooks";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { EmptyState, ErrorState, Field, SkeletonList } from "@/components/ui";
import { formatDate, timeAgo } from "@/lib/format";

export default function CollegesTable() {
  const toast = useToast();
  const router = useRouter();
  const { data, error, loading, reload } = useApi("/api/platform/colleges");
  const [modal, setModal] = useState(null); // { type: "add" | "edit" | "admin", college? }
  const [busyId, setBusyId] = useState(null);

  async function refresh() {
    await reload();
    router.refresh(); // updates the server-rendered stats above
  }

  async function toggleActive(college) {
    const deactivating = college.is_active;
    if (
      deactivating &&
      !confirm(`Deactivate ${college.name}? Its ${college.members} members will be signed out and unable to log in. No data is deleted.`)
    ) {
      return;
    }
    setBusyId(college.id);
    try {
      await api(`/api/platform/colleges/${college.id}`, { method: "PATCH", body: { is_active: !deactivating } });
      toast(deactivating ? `${college.name} deactivated` : `${college.name} is live`, "success");
      await refresh();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section>
      <div className="spread" style={{ marginBottom: "var(--s3)" }}>
        <h2>All colleges</h2>
        <button className="btn btn-primary" onClick={() => setModal({ type: "add" })}>Add college</button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonList rows={3} />
      ) : data.colleges.length === 0 ? (
        <EmptyState title="No colleges yet" action={<button className="btn btn-primary" onClick={() => setModal({ type: "add" })}>Add college</button>}>
          Add a college and appoint its first admin to open sign-ups.
        </EmptyState>
      ) : (
        <div className="card card-flush table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">College</th>
                <th scope="col">Status</th>
                <th scope="col" style={{ textAlign: "right" }}>Members</th>
                <th scope="col">Students · Alumni · Faculty</th>
                <th scope="col">Admins</th>
                <th scope="col">Last activity</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {data.colleges.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="truncate" style={{ display: "block", fontWeight: 500, maxWidth: 240 }}>{c.name}</span>
                    <span className="mono muted">@{c.domain}</span>
                  </td>
                  <td>
                    <span className={`badge ${c.is_active ? "badge-success" : "badge-warning"}`}>
                      {c.is_active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>{c.members}</td>
                  <td className="secondary">{c.students} · {c.alumni} · {c.faculty}</td>
                  <td>
                    {c.admins.length === 0 ? (
                      <span style={{ color: "var(--warning)" }}>None</span>
                    ) : (
                      <span className="truncate" style={{ display: "block", maxWidth: 200 }} title={c.admins.map((a) => a.email).join(", ")}>
                        {c.admins.map((a) => a.full_name).join(", ")}
                      </span>
                    )}
                  </td>
                  <td className="mono muted">
                    {c.last_activity ? timeAgo(c.last_activity) : `Added ${formatDate(c.created_at)}`}
                  </td>
                  <td className="actions">
                    <div className="row" style={{ flexWrap: "nowrap", justifyContent: "flex-end" }}>
                      <button className="btn btn-sm" onClick={() => setModal({ type: "admin", college: c })}>Appoint admin</button>
                      <button className="btn btn-sm" onClick={() => setModal({ type: "edit", college: c })}>Edit</button>
                      <button className={`btn btn-sm ${c.is_active ? "btn-danger" : ""}`} disabled={busyId === c.id} onClick={() => toggleActive(c)}>
                        {c.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal?.type === "add" && (
        <CollegeModal onClose={() => setModal(null)} onSaved={(c) => { toast(`${c.name} added`, "success"); refresh(); }} />
      )}
      {modal?.type === "edit" && (
        <CollegeModal college={modal.college} onClose={() => setModal(null)} onSaved={() => { toast("College updated", "success"); refresh(); }} />
      )}
      {modal?.type === "admin" && (
        <AppointAdminModal college={modal.college} onClose={() => setModal(null)}
          onSaved={(msg) => { toast(msg, "success"); refresh(); }} />
      )}
    </section>
  );
}

function CollegeModal({ college, onClose, onSaved }) {
  const editing = Boolean(college);
  const [form, setForm] = useState({ name: college?.name ?? "", domain: college?.domain ?? "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { college: saved } = await api(editing ? `/api/platform/colleges/${college.id}` : "/api/platform/colleges", {
        method: editing ? "PATCH" : "POST",
        body: form,
      });
      onSaved(saved);
      onClose();
    } catch (err) {
      setErrors({ ...err.details, _form: err.message });
      setBusy(false);
    }
  }

  return (
    <Modal title={editing ? `Edit ${college.name}` : "Add college"} onClose={onClose}>
      <form className="stack" onSubmit={submit} noValidate>
        {errors._form && <div className="alert alert-error">{errors._form}</div>}
        <Field label="College name" htmlFor="college_name" error={errors.name}>
          <input id="college_name" className="input" value={form.name} onChange={set("name")} aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field label="Email domain" htmlFor="college_domain" error={errors.domain}
          hint={editing ? "Existing members keep their accounts. The new domain applies to future sign-ups." : "Members must sign up with an address on this domain, e.g. riverside.edu"}>
          <input id="college_domain" className="input" placeholder="riverside.edu" value={form.domain} onChange={set("domain")} aria-invalid={Boolean(errors.domain)} />
        </Field>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Add college"}</button>
        </div>
      </form>
    </Modal>
  );
}

function AppointAdminModal({ college, onClose, onSaved }) {
  const [form, setForm] = useState({ email: "", full_name: "", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { admin } = await api(`/api/platform/colleges/${college.id}/admins`, { method: "POST", body: form });
      onSaved(admin.promoted ? `${admin.email} is now an admin` : `Admin account created for ${admin.email}`);
      onClose();
    } catch (err) {
      setErrors({ ...err.details, _form: err.message });
      setBusy(false);
    }
  }

  return (
    <Modal title={`Appoint an admin for ${college.name}`} onClose={onClose}>
      <form className="stack" onSubmit={submit} noValidate>
        <p className="small secondary">
          Enter the email of an existing member to promote them. For someone new, also add their name and a temporary password.
        </p>
        {errors._form && <div className="alert alert-error">{errors._form}</div>}
        <Field label="Email" htmlFor="admin_email" error={errors.email}>
          <input id="admin_email" className="input" type="email" placeholder={`name@${college.domain}`}
            value={form.email} onChange={set("email")} aria-invalid={Boolean(errors.email)} />
        </Field>
        <div className="form-grid">
          <Field label="Full name (new accounts)" htmlFor="admin_name" error={errors.full_name}>
            <input id="admin_name" className="input" value={form.full_name} onChange={set("full_name")} aria-invalid={Boolean(errors.full_name)} />
          </Field>
          <Field label="Temporary password (new accounts)" htmlFor="admin_password" error={errors.password}>
            <input id="admin_password" className="input" type="text" value={form.password} onChange={set("password")} aria-invalid={Boolean(errors.password)} />
          </Field>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Appoint admin"}</button>
        </div>
      </form>
    </Modal>
  );
}
