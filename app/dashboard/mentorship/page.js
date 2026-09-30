"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { useApi } from "@/lib/hooks";
import Avatar from "@/components/Avatar";
import MentorshipRequestModal from "@/components/MentorshipRequestModal";
import { useToast } from "@/components/Toast";
import { EmptyState, ErrorState, SkeletonList } from "@/components/ui";
import { timeAgo } from "@/lib/format";

const STATUS_BADGE = {
  pending: "badge-warning",
  accepted: "badge-success",
  declined: "badge-danger",
  completed: "",
};

const STATUS_LABEL = { pending: "Pending", accepted: "Active", declined: "Declined", completed: "Completed" };

export default function MentorshipPage() {
  const toast = useToast();
  const { data, error, loading, reload } = useApi("/api/mentorship");
  const [tab, setTab] = useState("find");
  const [requesting, setRequesting] = useState(null);

  async function act(id, action, message) {
    try {
      await api(`/api/mentorship/${id}`, { method: "PATCH", body: { action } });
      toast(message, "success");
      reload();
    } catch (err) {
      toast(err.message, "error");
    }
  }

  const pendingIncoming = data?.incoming.filter((r) => r.status === "pending").length ?? 0;
  const tabs = [
    ["find", "Find a mentor"],
    ["outgoing", "My requests"],
    ...(data?.canMentor ? [["incoming", `Mentees${pendingIncoming ? ` · ${pendingIncoming} new` : ""}`]] : []),
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Mentorship</h1>
          <p>One-on-one guidance from alumni and faculty in your college.</p>
        </div>
      </div>

      {data?.canMentor && !data.isMentor && (
        <div className="alert alert-info" style={{ marginBottom: "var(--s4)" }}>
          Want to give back? <Link href="/dashboard/profile">Turn on &quot;open to mentoring&quot;</Link> in your profile.
        </div>
      )}

      <div className="tabs" role="tablist">
        {tabs.map(([key, label]) => (
          <button key={key} role="tab" className="tab" aria-selected={tab === key} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonList rows={5} />
      ) : tab === "find" ? (
        data.mentors.length === 0 ? (
          <EmptyState title="No mentors yet">Alumni and faculty who opt in to mentoring will be listed here.</EmptyState>
        ) : (
          <ul className="card card-flush list">
            {data.mentors.map((m) => (
              <li key={m.id} style={{ alignItems: "flex-start" }}>
                <Avatar name={m.full_name} size="sm" />
                <div className="list-item-main stack" style={{ gap: "var(--s1)" }}>
                  <span>
                    <Link href={`/dashboard/people/${m.id}`} style={{ color: "var(--n-900)", fontWeight: 500 }}>{m.full_name}</Link>
                    <span className="small secondary"> · {[m.current_role, m.current_company].filter(Boolean).join(", ") || "Faculty"}</span>
                  </span>
                  {m.bio && <p className="small muted clamp-2" style={{ maxWidth: "72ch" }}>{m.bio}</p>}
                  {m.skills && (
                    <div className="row">
                      {m.skills.split(",").slice(0, 4).map((s) => <span key={s} className="badge">{s.trim()}</span>)}
                    </div>
                  )}
                </div>
                {m.request_status ? (
                  <span className={`badge ${STATUS_BADGE[m.request_status]}`}>
                    {m.request_status === "pending" ? "Request pending" : "Your mentor"}
                  </span>
                ) : (
                  <button className="btn btn-sm" onClick={() => setRequesting(m)}>Request</button>
                )}
              </li>
            ))}
          </ul>
        )
      ) : (
        <RequestList
          requests={tab === "incoming" ? data.incoming : data.outgoing}
          asMentor={tab === "incoming"}
          onAction={act}
        />
      )}

      {requesting && <MentorshipRequestModal mentor={requesting} onClose={() => setRequesting(null)} onSent={reload} />}
    </>
  );
}

function RequestList({ requests, asMentor, onAction }) {
  if (requests.length === 0) {
    return (
      <EmptyState title={asMentor ? "No mentorship requests yet" : "You haven't requested mentorship yet"}>
        {asMentor ? "Students will find you on the mentorship page." : "Browse mentors and send a request."}
      </EmptyState>
    );
  }

  return (
    <ul className="card card-flush list">
      {requests.map((r) => (
        <li key={r.id} style={{ alignItems: "flex-start" }}>
          <Avatar name={r.full_name} size="sm" />
          <div className="list-item-main stack" style={{ gap: "var(--s1)" }}>
            <div className="row">
              <Link href={`/dashboard/people/${r.user_id}`} style={{ color: "var(--n-900)", fontWeight: 500 }}>{r.full_name}</Link>
              <span className={`badge ${STATUS_BADGE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
              <span className="mono muted">{timeAgo(r.created_at)}</span>
            </div>
            <strong className="small">{r.topic}</strong>
            <p className="small secondary" style={{ whiteSpace: "pre-line", maxWidth: "72ch" }}>{r.message}</p>
          </div>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            {asMentor && r.status === "pending" && (
              <>
                <button className="btn btn-sm btn-primary" onClick={() => onAction(r.id, "accept", "Request accepted")}>Accept</button>
                <button className="btn btn-sm" onClick={() => onAction(r.id, "decline", "Request declined")}>Decline</button>
              </>
            )}
            {!asMentor && r.status === "pending" && (
              <button className="btn btn-sm" onClick={() => onAction(r.id, "cancel", "Request cancelled")}>Cancel</button>
            )}
            {r.status === "accepted" && (
              <>
                <Link href={`/dashboard/messages?with=${r.user_id}`} className="btn btn-sm">Message</Link>
                <button className="btn btn-sm btn-ghost" onClick={() => onAction(r.id, "complete", "Marked as completed")}>Mark complete</button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
