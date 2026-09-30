"use client";

import { useRouter } from "next/navigation";
import { Bell, CalendarX, CheckCircle2, Compass, UserPlus } from "lucide-react";
import { api } from "@/lib/client";
import { useApi } from "@/lib/hooks";
import { EmptyState, ErrorState, SkeletonList } from "@/components/ui";
import { timeAgo } from "@/lib/format";

const ICONS = {
  connection_request: UserPlus,
  connection_accepted: CheckCircle2,
  mentorship_request: Compass,
  mentorship_accepted: CheckCircle2,
  mentorship_declined: Compass,
  mentorship_completed: CheckCircle2,
  event_cancelled: CalendarX,
};

export default function NotificationsPage() {
  const router = useRouter();
  const { data, error, loading, reload } = useApi("/api/notifications");

  async function markRead(ids) {
    await api("/api/notifications", { method: "PATCH", body: ids ? { ids } : {} }).catch(() => {});
    await reload();
    router.refresh();
  }

  async function open(n) {
    if (!n.is_read) await markRead([n.id]);
    if (n.link) router.push(n.link);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="num">{data ? `${data.unread} unread` : " "}</p>
        </div>
        <button className="btn" disabled={!data?.unread} onClick={() => markRead(null)}>Mark all as read</button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonList rows={4} />
      ) : data.notifications.length === 0 ? (
        <EmptyState title="No notifications">Connection requests, mentorship updates and event changes appear here.</EmptyState>
      ) : (
        <div className="card card-flush list">
          {data.notifications.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            return (
              <button key={n.id} className="list-item" onClick={() => open(n)}
                style={{ background: n.is_read ? undefined : "var(--accent-soft)" }}>
                <Icon size={16} strokeWidth={1.75} color={n.is_read ? "var(--n-500)" : "var(--accent)"} aria-hidden="true" />
                <span className="list-item-main">
                  <span className="truncate" style={{ display: "block", fontWeight: n.is_read ? 400 : 600 }}>
                    {n.title}
                    {!n.is_read && <span className="sr-only"> (unread)</span>}
                  </span>
                  {n.body && <span className="small muted truncate" style={{ display: "block" }}>{n.body}</span>}
                </span>
                <span className="mono muted">{timeAgo(n.created_at)}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
