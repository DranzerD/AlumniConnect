"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { useDebounce } from "@/lib/hooks";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { Field, Pagination } from "@/components/ui";
import { ROLE_LABELS, formatDate, timeAgo } from "@/lib/format";

const ROLES = Object.keys(ROLE_LABELS);

export default function UserManagement({ currentUserId }) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ role: "", status: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [version, setVersion] = useState(0);
  const [adding, setAdding] = useState(false);
  const query = useDebounce(q, 300);

  useEffect(() => setPage(1), [query, filters]);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (query) params.set("q", query);
    if (filters.role) params.set("role", filters.role);
    if (filters.status) params.set("status", filters.status);
    api(`/api/admin/users?${params}`).then(setData).catch((err) => toast(err.message, "error"));
  }, [query, filters, page, version, toast]);

  async function update(user, body, message) {
    try {
      await api(`/api/admin/users/${user.id}`, { method: "PATCH", body });
      toast(message, "success");
      setVersion((v) => v + 1);
    } catch (err) {
      toast(err.message, "error");
    }
  }

  return (
    <section>
      <div className="spread" style={{ marginBottom: "var(--s3)" }}>
        <h2>Users</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>Add user</button>
      </div>

      <div className="filters">
        <input className="input" type="search" placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" />
        <select className="select" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} aria-label="Role">
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <select className="select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} aria-label="Status">
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
        </select>
      </div>

      <div className="card card-flush table-wrap">
        <table className="table">
          <thead>
            <tr><th scope="col">Name</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Joined</th><th scope="col">Last login</th><th scope="col"><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {!data ? (
              <tr><td colSpan={6} className="muted">Loading…</td></tr>
            ) : data.users.length === 0 ? (
              <tr><td colSpan={6} className="muted">No users match these filters.</td></tr>
            ) : (
              data.users.map((u) => {
                const self = u.id === currentUserId;
                return (
                  <tr key={u.id} style={{ opacity: u.is_active ? 1 : 0.6 }}>
                    <td>
                      <Link href={`/dashboard/people/${u.id}`} style={{ fontWeight: 500 }}>{u.full_name}</Link>
                      <div className="muted truncate" style={{ maxWidth: 260 }}>{u.email}</div>
                    </td>
                    <td>
                      <select className="select" style={{ height: 28, width: "auto", fontSize: "var(--text-sm)" }} value={u.role} disabled={self}
                        aria-label={`Role for ${u.full_name}`}
                        onChange={(e) => update(u, { role: e.target.value }, `${u.full_name} is now ${ROLE_LABELS[e.target.value]}`)}>
                        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? "badge-success" : "badge-danger"}`}>{u.is_active ? "Active" : "Deactivated"}</span>
                    </td>
                    <td className="mono">{formatDate(u.created_at)}</td>
                    <td className="mono muted">{u.last_login_at ? timeAgo(u.last_login_at) : "Never"}</td>
                    <td className="actions">
                      {!self && (
                        <button className={`btn btn-sm ${u.is_active ? "btn-danger" : ""}`}
                          onClick={() => (!u.is_active || confirm(`Deactivate ${u.full_name}? They will be signed out immediately.`)) &&
                            update(u, { is_active: !u.is_active }, u.is_active ? "User deactivated" : "User reactivated")}>
                          {u.is_active ? "Deactivate" : "Reactivate"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {data && <Pagination page={page} totalPages={data.pagination.totalPages} total={data.pagination.total} onChange={setPage} />}

      {adding && <AddUserModal onClose={() => setAdding(false)} onAdded={() => { setVersion((v) => v + 1); toast("User created", "success"); }} />}
    </section>
  );
}

function AddUserModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ full_name: "", email: "", role: "faculty", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/admin/users", { method: "POST", body: form });
      onAdded();
      onClose();
    } catch (err) {
      setErrors({ ...err.details, _form: err.message });
      setBusy(false);
    }
  }

  return (
    <Modal title="Add user" onClose={onClose}>
      <form className="stack" onSubmit={submit} noValidate>
        {errors._form && <div className="alert alert-error">{errors._form}</div>}
        <Field label="Full name" htmlFor="new_name" error={errors.full_name}>
          <input id="new_name" className="input" value={form.full_name} onChange={set("full_name")} />
        </Field>
        <Field label="Email" htmlFor="new_email" error={errors.email}>
          <input id="new_email" className="input" type="email" value={form.email} onChange={set("email")} />
        </Field>
        <Field label="Role" htmlFor="new_role">
          <select id="new_role" className="select" value={form.role} onChange={set("role")}>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </Field>
        <Field label="Temporary password" htmlFor="new_password" error={errors.password} hint="Share it with the user; they can change it in Settings.">
          <input id="new_password" className="input" type="text" value={form.password} onChange={set("password")} />
        </Field>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? "Creating…" : "Create user"}</button>
        </div>
      </form>
    </Modal>
  );
}
