"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useApi } from "@/lib/hooks";
import Avatar from "@/components/Avatar";
import ConnectButton from "@/components/ConnectButton";
import MentorshipRequestModal from "@/components/MentorshipRequestModal";
import { EmptyState, SkeletonList } from "@/components/ui";
import { ROLE_LABELS, formatDate } from "@/lib/format";

export default function PersonPage({ params }) {
  const { id } = use(params);
  const { data, error, loading } = useApi(`/api/profiles/${id}`);
  const [mentorOpen, setMentorOpen] = useState(false);

  if (loading) return <SkeletonList rows={4} />;
  if (error) {
    return (
      <EmptyState title="Profile unavailable" action={<Link href="/dashboard/directory" className="btn">Back to directory</Link>}>
        {error}
      </EmptyState>
    );
  }

  const p = data.profile;
  const skills = p.skills ? p.skills.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return (
    <>
      <div className="page-header" style={{ alignItems: "center" }}>
        <div className="row" style={{ flexWrap: "nowrap", gap: "var(--s4)", minWidth: 0 }}>
          <Avatar name={p.full_name} size="lg" />
          <div style={{ minWidth: 0 }}>
            <h1 className="truncate">{p.full_name}</h1>
            <p style={{ color: "var(--n-700)" }}>{p.headline || ROLE_LABELS[p.role]}</p>
            <div className="row small muted" style={{ marginTop: "var(--s1)" }}>
              <span>{ROLE_LABELS[p.role]}</span>
              {p.location && <span>· {p.location}</span>}
              <span className="num">· {p.connection_count} connections</span>
              {p.open_to_mentor ? <span className="badge badge-success">Open to mentoring</span> : null}
            </div>
          </div>
        </div>
        <div className="row">
          {p.is_self ? (
            <Link href="/dashboard/profile" className="btn">Edit profile</Link>
          ) : (
            <>
              {p.open_to_mentor ? <button className="btn" onClick={() => setMentorOpen(true)}>Request mentorship</button> : null}
              <ConnectButton userId={p.id} status={p.connection_status} size="md" />
            </>
          )}
        </div>
      </div>

      <div className="columns" style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(260px, 1fr)" }}>
        <section className="stack">
          <div>
            <h2 className="section-title">About</h2>
            <p style={{ whiteSpace: "pre-line", maxWidth: "72ch" }}>
              {p.bio || <span className="muted">{p.is_self ? "You haven&apos;t written a bio yet." : "No bio yet."}</span>}
            </p>
          </div>
          {skills.length > 0 && (
            <div>
              <h2 className="section-title">Skills</h2>
              <div className="row">{skills.map((s) => <span key={s} className="badge">{s}</span>)}</div>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="section-title">Details</h2>
          <dl className="stack small" style={{ gap: "var(--s2)" }}>
            <Detail label="Currently" value={[p.current_role, p.current_company].filter(Boolean).join(", ")} />
            <Detail label="Degree" value={p.degree} />
            <Detail label="Department" value={p.department} />
            <Detail label="Class of" value={p.graduation_year} />
            <Detail label="Email" value={p.email && <a href={`mailto:${p.email}`}>{p.email}</a>} />
            <Detail label="Joined" value={formatDate(p.created_at)} />
            {p.linkedin_url && <Detail label="LinkedIn" value={<a href={p.linkedin_url} target="_blank" rel="noopener noreferrer">View profile</a>} />}
            {p.github_url && <Detail label="GitHub" value={<a href={p.github_url} target="_blank" rel="noopener noreferrer">View profile</a>} />}
          </dl>
          {!p.is_self && p.connection_status !== "connected" && (
            <p className="small muted" style={{ marginTop: "var(--s3)" }}>Connect to see their email address.</p>
          )}
        </section>
      </div>

      {mentorOpen && <MentorshipRequestModal mentor={p} onClose={() => setMentorOpen(false)} />}
    </>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "96px minmax(0, 1fr)", gap: "var(--s2)" }}>
      <dt className="muted">{label}</dt>
      <dd className="num" style={{ overflowWrap: "anywhere" }}>{value}</dd>
    </div>
  );
}

