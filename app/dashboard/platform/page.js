import { redirect } from "next/navigation";
import { get } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import CollegesTable from "./CollegesTable";

export const metadata = { title: "Colleges" };

export default async function PlatformPage() {
  const me = await getCurrentUser();
  if (me.role !== "superadmin") redirect("/dashboard");

  const stats = get(
    `SELECT
       (SELECT COUNT(*) FROM colleges WHERE is_active = 1) AS active_colleges,
       (SELECT COUNT(*) FROM colleges) AS colleges,
       (SELECT COUNT(*) FROM users WHERE role <> 'superadmin' AND is_active = 1) AS members,
       (SELECT COUNT(*) FROM users WHERE role <> 'superadmin' AND created_at >= datetime('now', '-30 days')) AS new_members,
       (SELECT COUNT(*) FROM jobs WHERE status = 'open') AS open_jobs,
       (SELECT COUNT(*) FROM events WHERE starts_at >= ?) AS upcoming_events`,
    new Date().toISOString(),
  );

  const cards = [
    ["Active colleges", `${stats.active_colleges} of ${stats.colleges}`],
    ["Members", stats.members],
    ["New in last 30 days", stats.new_members],
    ["Open jobs", stats.open_jobs],
    ["Upcoming events", stats.upcoming_events],
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Colleges</h1>
          <p>Every college on the platform. Each college&apos;s data is visible only to its own members.</p>
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

      <CollegesTable />
    </>
  );
}
