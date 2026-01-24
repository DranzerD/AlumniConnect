import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireAuth();

    // Get total users by role
    const usersResult = await query(
      `SELECT role, COUNT(*) as count 
       FROM users 
       WHERE college_id = $1
       GROUP BY role`,
      [session.collegeId]
    );

    const usersByRole = {};
    let totalUsers = 0;
    usersResult.rows.forEach((row) => {
      usersByRole[row.role] = parseInt(row.count);
      totalUsers += parseInt(row.count);
    });

    // Get active users count
    const activeUsersResult = await query(
      `SELECT COUNT(*) as count 
       FROM users 
       WHERE college_id = $1 AND is_active = 1`,
      [session.collegeId]
    );
    const activeUsers = parseInt(activeUsersResult.rows[0].count);

    // Get jobs stats
    const jobsResult = await query(
      `SELECT status, COUNT(*) as count 
       FROM jobs 
       WHERE college_id = $1
       GROUP BY status`,
      [session.collegeId]
    );

    let totalJobs = 0;
    let activeJobs = 0;
    jobsResult.rows.forEach((row) => {
      const count = parseInt(row.count);
      totalJobs += count;
      if (row.status === "open") activeJobs += count;
    });

    // Get profile completion stats
    const profilesResult = await query(
      `SELECT COUNT(*) as count 
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE u.college_id = $1
       AND p.full_name IS NOT NULL 
       AND p.bio IS NOT NULL 
       AND p.current_company IS NOT NULL`,
      [session.collegeId]
    );
    const completeProfiles = parseInt(profilesResult.rows[0].count);
    const profileCompletionRate =
      totalUsers > 0 ? Math.round((completeProfiles / totalUsers) * 100) : 0;

    // Get recent activity
    const recentJobsResult = await query(
      `SELECT company_name, role_title, created_at 
       FROM jobs 
       WHERE college_id = $1
       ORDER BY created_at DESC 
       LIMIT 5`,
      [session.collegeId]
    );

    const recentActivity = recentJobsResult.rows.map((job) => ({
      type: "job",
      text: `New job posted: ${job.role_title} at ${job.company_name}`,
      time: formatTimeAgo(new Date(job.created_at)),
    }));

    // Get top companies
    const topCompaniesResult = await query(
      `SELECT company_name, COUNT(*) as job_count 
       FROM jobs 
       WHERE college_id = $1
       GROUP BY company_name 
       ORDER BY job_count DESC 
       LIMIT 5`,
      [session.collegeId]
    );

    const topCompanies = topCompaniesResult.rows.map((row) => ({
      name: row.company_name,
      jobCount: parseInt(row.job_count),
    }));

    return NextResponse.json({
      totalUsers,
      usersByRole,
      activeUsers,
      totalJobs,
      activeJobs,
      profileCompletionRate,
      completeProfiles,
      recentActivity,
      topCompanies,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
