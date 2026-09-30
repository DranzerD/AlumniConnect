import { redirect } from "next/navigation";
import { all, get } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { ROLE_LABELS } from "@/lib/format";
import UserManagement from "./UserManagement";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const me = await getCurrentUser();
  if (me.role !== "admin") redirect("/dashboard");

  const params = { college: me.collegeId, now: new Date().toISOString() };
  const stats = get(
    `SELECT
       (SELECT COUNT(*) FROM users WHERE college_id = @college AND is_active = 1) AS active_users,
       (SELECT COUNT(*) FROM users WHERE college_id = @college AND created_at >= datetime('now', '-30 days')) AS new_users,
       (SELECT COUNT(*) FROM jobs WHERE college_id = @college AND status = 'open') AS open_jobs,
       (SELECT COUNT(*) FROM events WHERE college_id = @college AND starts_at >= @now) AS upcoming_events,
       (SELECT COUNT(*) FROM connections c JOIN users u ON u.id = c.requester_id
         WHERE u.college_id = @college AND c.status = 'accepted') AS connections,
       (SELECT COUNT(*) FROM mentorship_requests r JOIN users u ON u.id = r.mentor_id
         WHERE u.college_id = @college AND r.status IN ('accepted', 'completed')) AS mentorships`,
    params,
  );
  const byRole = all(
    "SELECT role, COUNT(*) AS n FROM users WHERE college_id = ? AND is_active = 1 GROUP BY role ORDER BY n DESC",
    me.collegeId,
  );
  const topCompanies = all(
    `SELECT p.current_company AS company, COUNT(*) AS n
       FROM profiles p JOIN users u ON u.id = p.user_id
      WHERE u.college_id = ? AND u.role = 'alumni' AND p.current_company IS NOT NULL
      GROUP BY p.current_company ORDER BY n DESC, company LIMIT 5`,
    me.collegeId,
  );
  const maxRole = Math.max(1, ...byRole.map((r) => r.n));

  const cards = [
    ["Active members", stats.active_users],
    ["New in last 30 days", stats.new_users],
    ["Open jobs", stats.open_jobs],
    ["Upcoming events", stats.upcoming_events],
    ["Connections made", stats.connections],
    ["Mentorships", stats.mentorships],
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Admin</h1>
          <p>{me.collegeName}</p>
        </div>
      </div>

      <div className="stats">
        {cards.map(([label, value]) => (
          <div key={label} className="stat">
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="columns" style={{ marginBottom: "var(--s8)" }}>
        <section className="card card-flush">
          <div className="panel-header"><h2>Members by role</h2></div>
          <table className="table">
            <tbody>
              {byRole.map((r) => (
                <tr key={r.role}>
                  <td style={{ width: 96 }}>{ROLE_LABELS[r.role]}</td>
                  <td>
                    <div style={{ height: 8, background: "var(--n-50)", borderRadius: "var(--r-control)" }}>
                      <div style={{ width: `${(r.n / maxRole) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: "var(--r-control)" }} />
                    </div>
                  </td>
                  <td className="actions" style={{ width: 48 }}>{r.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="card card-flush">
          <div className="panel-header"><h2>Where alumni work</h2></div>
          {topCompanies.length === 0 ? (
            <p className="muted small" style={{ padding: "var(--s4)" }}>No alumni have added a company yet.</p>
          ) : (
            <table className="table">
              <tbody>
                {topCompanies.map((c) => (
                  <tr key={c.company}><td>{c.company}</td><td className="actions">{c.n}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <UserManagement currentUserId={me.id} />
    </>
  );
}
