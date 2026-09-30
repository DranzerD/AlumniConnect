"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { useDebounce } from "@/lib/hooks";
import Avatar from "@/components/Avatar";
import ConnectButton from "@/components/ConnectButton";
import { EmptyState, ErrorState, Pagination, SkeletonList } from "@/components/ui";
import { ROLE_LABELS } from "@/lib/format";

export default function DirectoryPage() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ role: "", year: "", department: "", mentors: false });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const query = useDebounce(q, 300);

  useEffect(() => setPage(1), [query, filters]);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (query) params.set("q", query);
    if (filters.role) params.set("role", filters.role);
    if (filters.year) params.set("year", filters.year);
    if (filters.department) params.set("department", filters.department);
    if (filters.mentors) params.set("mentors", "1");

    let cancelled = false;
    api(`/api/profiles?${params}`)
      .then((res) => !cancelled && (setData(res), setError("")))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [query, filters, page, version]);

  const setFilter = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Directory</h1>
          <p>Find students, alumni and faculty from your college.</p>
        </div>
      </div>

      <div className="filters">
        <input
          className="input"
          type="search"
          placeholder="Search by name, company, headline or skill…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search people"
        />
        <select className="select" value={filters.role} onChange={setFilter("role")} aria-label="Role">
          <option value="">All roles</option>
          {["alumni", "student", "faculty"].map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
        <select className="select" value={filters.department} onChange={setFilter("department")} aria-label="Department">
          <option value="">All departments</option>
          {data?.filters.departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="select" value={filters.year} onChange={setFilter("year")} aria-label="Graduation year">
          <option value="">Any year</option>
          {data?.filters.years.map((y) => <option key={y}>{y}</option>)}
        </select>
        <label className="checkbox">
          <input type="checkbox" checked={filters.mentors} onChange={setFilter("mentors")} /> Open to mentor
        </label>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => { setError(""); setVersion((v) => v + 1); }} />
      ) : !data ? (
        <SkeletonList rows={8} />
      ) : data.profiles.length === 0 ? (
        <EmptyState title="No one matches these filters">Try a shorter search or clear a filter.</EmptyState>
      ) : (
        <>
          <div className="card card-flush table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Role</th>
                  <th scope="col">Currently</th>
                  <th scope="col">Class</th>
                  <th scope="col">Location</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {data.profiles.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/dashboard/people/${p.id}`} className="cell-person" style={{ color: "inherit" }}>
                        <Avatar name={p.full_name} size="sm" />
                        <span style={{ minWidth: 0 }}>
                          <span className="truncate" style={{ display: "block", fontWeight: 500 }}>{p.full_name}</span>
                          <span className="truncate muted" style={{ display: "block" }}>{p.headline || "No headline"}</span>
                        </span>
                      </Link>
                    </td>
                    <td>
                      <span className="row" style={{ flexWrap: "nowrap" }}>
                        {ROLE_LABELS[p.role]}
                        {p.open_to_mentor ? <span className="badge badge-success">Mentor</span> : null}
                      </span>
                    </td>
                    <td className="secondary">
                      <span className="truncate" style={{ display: "block", maxWidth: 200 }}>
                        {[p.current_role, p.current_company].filter(Boolean).join(", ") || "—"}
                      </span>
                    </td>
                    <td className="num">{p.graduation_year ?? "—"}</td>
                    <td className="secondary"><span className="truncate" style={{ display: "block", maxWidth: 160 }}>{p.location || "—"}</span></td>
                    <td className="actions"><ConnectButton userId={p.id} status={p.connection_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={data.pagination.totalPages} total={data.pagination.total} onChange={setPage} />
        </>
      )}
    </>
  );
}
