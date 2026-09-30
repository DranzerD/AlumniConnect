"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { useApi } from "@/lib/hooks";
import Avatar from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import { EmptyState, ErrorState, SkeletonList } from "@/components/ui";
import { timeAgo } from "@/lib/format";

const TABS = [
  ["connections", "Connections"],
  ["incoming", "Received"],
  ["outgoing", "Sent"],
];

const EMPTY = {
  connections: ["No connections yet", "Browse the directory and send a request to people you know."],
  incoming: ["No pending requests", "Requests people send you will show up here."],
  outgoing: ["Nothing pending", "Requests you send stay here until they're accepted."],
};

export default function ConnectionsPage() {
  const { data, error, loading, reload } = useApi("/api/connections");
  const [tab, setTab] = useState("connections");
  const [busyId, setBusyId] = useState(null);
  const toast = useToast();

  async function act(id, method, body, message) {
    setBusyId(id);
    try {
      await api(`/api/connections/${id}`, { method, body });
      toast(message, "success");
      await reload();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusyId(null);
    }
  }

  const list = data?.[tab] ?? [];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Connections</h1>
          <p>People you&apos;re connected with can message you and see your email.</p>
        </div>
        <Link href="/dashboard/directory" className="btn">Find people</Link>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} role="tab" className="tab" aria-selected={tab === key} onClick={() => setTab(key)}>
            {label}
            {data && <span className="count">{data[key].length}</span>}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonList rows={4} />
      ) : list.length === 0 ? (
        <EmptyState title={EMPTY[tab][0]}>{EMPTY[tab][1]}</EmptyState>
      ) : (
        <ul className="card card-flush list">
          {list.map((c) => (
            <li key={c.id}>
              <Avatar name={c.full_name} size="sm" />
              <div className="list-item-main">
                <Link href={`/dashboard/people/${c.user_id}`} className="truncate" style={{ display: "block", color: "var(--n-900)", fontWeight: 500 }}>
                  {c.full_name}
                </Link>
                <span className="small muted truncate" style={{ display: "block" }}>{c.headline || c.current_role || "No headline"}</span>
              </div>
              {tab !== "connections" && <span className="mono muted">{timeAgo(c.created_at)}</span>}
              <div className="row" style={{ flexWrap: "nowrap" }}>
                {tab === "connections" && (
                  <>
                    <Link href={`/dashboard/messages?with=${c.user_id}`} className="btn btn-sm">Message</Link>
                    <button className="btn btn-sm btn-ghost" disabled={busyId === c.id}
                      onClick={() => confirm(`Remove ${c.full_name} from your connections?`) &&
                        act(c.id, "DELETE", undefined, "Connection removed")}>
                      Remove
                    </button>
                  </>
                )}
                {tab === "incoming" && (
                  <>
                    <button className="btn btn-sm btn-primary" disabled={busyId === c.id}
                      onClick={() => act(c.id, "PATCH", { action: "accept" }, `Connected with ${c.full_name}`)}>Accept</button>
                    <button className="btn btn-sm" disabled={busyId === c.id}
                      onClick={() => act(c.id, "DELETE", undefined, "Request declined")}>Decline</button>
                  </>
                )}
                {tab === "outgoing" && (
                  <button className="btn btn-sm" disabled={busyId === c.id}
                    onClick={() => act(c.id, "DELETE", undefined, "Request withdrawn")}>Withdraw</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
