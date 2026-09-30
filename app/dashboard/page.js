import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { all, get } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import Avatar from "@/components/Avatar";
import { formatDateTime, timeAgo, JOB_TYPE_LABELS, EVENT_TYPE_LABELS } from "@/lib/format";

export const metadata = { title: "Home" };

const PROFILE_FIELDS = ["headline", "graduation_year", "department", "current_role", "location", "bio", "skills", "linkedin_url"];

export default async function DashboardHome() {
  const me = await getCurrentUser();
  const now = new Date().toISOString();
  const params = { me: me.id, college: me.collegeId, now };

  const profile = get("SELECT * FROM profiles WHERE user_id = ?", me.id);
  const filled = PROFILE_FIELDS.filter((f) => profile[f] !== null && profile[f] !== "").length;

  // Things waiting on the user, newest first.
  const connectionRequests = all(
    `SELECT u.id, p.full_name, p.headline, c.created_at
       FROM connections c JOIN users u ON u.id = c.requester_id JOIN profiles p ON p.user_id = u.id
      WHERE c.addressee_id = @me AND c.status = 'pending' AND u.is_active = 1`,
    params,
  ).map((r) => ({ ...r, kind: "connection", text: "wants to connect", href: "/dashboard/connections" }));
  const mentorRequests = all(
    `SELECT u.id, p.full_name, r.topic AS headline, r.created_at
       FROM mentorship_requests r JOIN users u ON u.id = r.mentee_id JOIN profiles p ON p.user_id = u.id
      WHERE r.mentor_id = @me AND r.status = 'pending'`,
    params,
  ).map((r) => ({ ...r, kind: "mentorship", text: "requested mentorship", href: "/dashboard/mentorship" }));
  const unread = all(
    `SELECT u.id, p.full_name, g.n, m.created_at, m.body AS headline
       FROM (SELECT sender_id, COUNT(*) AS n, MAX(id) AS last_id
               FROM messages WHERE recipient_id = @me AND read_at IS NULL
              GROUP BY sender_id) g
       JOIN messages m ON m.id = g.last_id
       JOIN users u ON u.id = g.sender_id
       JOIN profiles p ON p.user_id = u.id`,
    params,
  ).map((r) => ({
    ...r,
    kind: "message",
    text: r.n === 1 ? "sent you a message" : `sent you ${r.n} messages`,
    href: `/dashboard/messages?with=${r.id}`,
  }));
  const attention = [...connectionRequests, ...mentorRequests, ...unread].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );

  const stats = get(
    `SELECT
       (SELECT COUNT(*) FROM connections WHERE status = 'accepted' AND (requester_id = @me OR addressee_id = @me)) AS connections,
       (SELECT COUNT(*) FROM event_rsvps r JOIN events e ON e.id = r.event_id WHERE r.user_id = @me AND e.starts_at >= @now) AS rsvps,
       (SELECT COUNT(*) FROM mentorship_requests WHERE (mentee_id = @me OR mentor_id = @me) AND status = 'accepted') AS mentorships,
       (SELECT COUNT(*) FROM jobs WHERE college_id = @college AND status = 'open') AS jobs`,
    params,
  );

  const events = all(
    `SELECT e.id, e.title, e.event_type, e.starts_at, e.location,
            EXISTS (SELECT 1 FROM event_rsvps r WHERE r.event_id = e.id AND r.user_id = @me) AS is_going
       FROM events e WHERE e.college_id = @college AND e.starts_at >= @now
      ORDER BY e.starts_at LIMIT 4`,
    params,
  );
  const jobs = all(
    `SELECT id, title, company_name, job_type, location, is_remote, created_at
       FROM jobs WHERE college_id = @college AND status = 'open'
      ORDER BY created_at DESC LIMIT 4`,
    params,
  );

  const firstName = me.fullName.replace(/^(Dr|Prof)\.?\s+/i, "").split(" ")[0];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Good to see you, {firstName}</h1>
          <p>{me.collegeName}</p>
        </div>
        {filled < PROFILE_FIELDS.length && (
          <Link href="/dashboard/profile" className="btn">
            Complete profile · <span className="num">{filled}/{PROFILE_FIELDS.length}</span>
          </Link>
        )}
      </div>

      <section className="card card-flush" style={{ marginBottom: "var(--s6)" }} aria-labelledby="attention">
        <div className="panel-header">
          <h2 id="attention">Needs your attention</h2>
          <span className="small muted num">{attention.length}</span>
        </div>
        {attention.length === 0 ? (
          <p className="small muted" style={{ padding: "var(--s4)" }}>
            Nothing waiting on you. New connection requests, mentorship requests and messages will appear here.
          </p>
        ) : (
          <ul className="list">
            {attention.slice(0, 6).map((item) => (
              <li key={`${item.kind}-${item.id}`} style={{ padding: 0 }}>
                <Link href={item.href} className="list-item list-item-link row"
                  style={{ flex: 1, flexWrap: "nowrap", padding: "var(--s3) var(--s4)", gap: "var(--s3)" }}>
                  <Avatar name={item.full_name} size="sm" />
                  <span className="list-item-main">
                    <span className="truncate" style={{ display: "block" }}>
                      <strong>{item.full_name}</strong> <span className="secondary">{item.text}</span>
                    </span>
                    {item.headline && <span className="small muted truncate" style={{ display: "block" }}>{item.headline}</span>}
                  </span>
                  <span className="mono muted">{timeAgo(item.created_at)}</span>
                  <ArrowRight size={16} color="var(--n-500)" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="stats">
        <Link href="/dashboard/connections" className="stat"><span className="stat-value">{stats.connections}</span><span className="stat-label">Connections</span></Link>
        <Link href="/dashboard/mentorship" className="stat"><span className="stat-value">{stats.mentorships}</span><span className="stat-label">Active mentorships</span></Link>
        <Link href="/dashboard/events" className="stat"><span className="stat-value">{stats.rsvps}</span><span className="stat-label">Upcoming RSVPs</span></Link>
        <Link href="/dashboard/jobs" className="stat"><span className="stat-value">{stats.jobs}</span><span className="stat-label">Open jobs</span></Link>
      </div>

      <div className="columns">
        <section className="card card-flush" aria-labelledby="jobs">
          <div className="panel-header">
            <h2 id="jobs">Latest jobs</h2>
            <Link href="/dashboard/jobs" className="small">View all</Link>
          </div>
          {jobs.length === 0 ? (
            <p className="small muted" style={{ padding: "var(--s4)" }}>No open positions yet.</p>
          ) : (
            <ul className="list">
              {jobs.map((job) => (
                <li key={job.id}>
                  <div className="list-item-main">
                    <Link href={`/dashboard/jobs?q=${encodeURIComponent(job.title)}`} className="truncate" style={{ display: "block" }}>
                      {job.title}
                    </Link>
                    <span className="small muted truncate" style={{ display: "block" }}>
                      {job.company_name} · {job.is_remote ? "Remote" : job.location || "Location not set"}
                    </span>
                  </div>
                  <span className="badge">{JOB_TYPE_LABELS[job.job_type]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card card-flush" aria-labelledby="events">
          <div className="panel-header">
            <h2 id="events">Upcoming events</h2>
            <Link href="/dashboard/events" className="small">View all</Link>
          </div>
          {events.length === 0 ? (
            <p className="small muted" style={{ padding: "var(--s4)" }}>No upcoming events.</p>
          ) : (
            <ul className="list">
              {events.map((event) => (
                <li key={event.id}>
                  <div className="list-item-main">
                    <span className="truncate" style={{ display: "block", fontWeight: 500 }}>{event.title}</span>
                    <span className="small muted truncate" style={{ display: "block" }}>
                      <span className="num">{formatDateTime(event.starts_at)}</span> · {EVENT_TYPE_LABELS[event.event_type]}
                    </span>
                  </div>
                  {event.is_going ? <span className="badge badge-success">Going</span> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
