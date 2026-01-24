import { getSession } from "@/lib/session";
import { query } from "@/lib/db";
import Link from "next/link";
import styles from "./page.module.css";

export default async function DashboardPage() {
  const session = await getSession();

  const alumniCount = await query(
    `SELECT COUNT(*) as count FROM users 
     WHERE college_id = $1 AND role = 'alumni' AND is_active = true`,
    [session.collegeId]
  );

  const studentCount = await query(
    `SELECT COUNT(*) as count FROM users 
     WHERE college_id = $1 AND role = 'student' AND is_active = true`,
    [session.collegeId]
  );

  const jobsCount = await query(
    `SELECT COUNT(*) as count FROM jobs 
     WHERE college_id = $1 AND status = 'open'`,
    [session.collegeId]
  );

  const profilesCount = await query(
    `SELECT COUNT(*) as count FROM profiles p
     JOIN users u ON p.user_id = u.id
     WHERE u.college_id = $1 
     AND p.full_name IS NOT NULL 
     AND p.bio IS NOT NULL`,
    [session.collegeId]
  );

  const recentJobs = await query(
    `SELECT j.*, p.full_name as posted_by_name
     FROM jobs j
     LEFT JOIN profiles p ON j.posted_by_user_id = p.user_id
     WHERE j.college_id = $1 AND j.status = 'open'
     ORDER BY j.created_at DESC
     LIMIT 5`,
    [session.collegeId]
  );

  const canPostJobs = session.role === "alumni" || session.role === "admin";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome to AlumniConnect</h1>
          <p className={styles.subtitle}>
            Connect with alumni, explore opportunities, and grow your network
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statNumber}>
            {alumniCount.rows[0]?.count || 0}
          </div>
          <div className={styles.statLabel}>Alumni Members</div>
          <Link href="/dashboard/directory" className={styles.statLink}>
            Browse Directory →
          </Link>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎓</div>
          <div className={styles.statNumber}>
            {studentCount.rows[0]?.count || 0}
          </div>
          <div className={styles.statLabel}>Active Students</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💼</div>
          <div className={styles.statNumber}>
            {jobsCount.rows[0]?.count || 0}
          </div>
          <div className={styles.statLabel}>Open Positions</div>
          <Link href="/dashboard/jobs" className={styles.statLink}>
            View Jobs →
          </Link>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statNumber}>
            {profilesCount.rows[0]?.count || 0}
          </div>
          <div className={styles.statLabel}>Complete Profiles</div>
          <Link href="/dashboard/profile" className={styles.statLink}>
            Edit Profile →
          </Link>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionGrid}>
          <Link href="/dashboard/directory" className={styles.actionCard}>
            <div className={styles.actionIcon}>📖</div>
            <h3>Alumni Directory</h3>
            <p>Connect with alumni from your college</p>
          </Link>

          <Link href="/dashboard/jobs" className={styles.actionCard}>
            <div className={styles.actionIcon}>🔍</div>
            <h3>Find Jobs</h3>
            <p>Explore opportunities shared by alumni</p>
          </Link>

          {canPostJobs && (
            <Link href="/dashboard/jobs/post" className={styles.actionCard}>
              <div className={styles.actionIcon}>✨</div>
              <h3>Post a Job</h3>
              <p>Share opportunities with the community</p>
            </Link>
          )}

          <Link href="/dashboard/analytics" className={styles.actionCard}>
            <div className={styles.actionIcon}>📊</div>
            <h3>View Analytics</h3>
            <p>Platform statistics and insights</p>
          </Link>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recent Job Postings</h2>
          <Link href="/dashboard/jobs" className={styles.viewAll}>
            View All →
          </Link>
        </div>
        {recentJobs.rows.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No job postings yet. Check back soon!</p>
          </div>
        ) : (
          <div className={styles.jobsList}>
            {recentJobs.rows.map((job) => (
              <div key={job.id} className={styles.jobCard}>
                <div className={styles.jobHeader}>
                  <div>
                    <h3>{job.role_title}</h3>
                    <p className={styles.company}>{job.company_name}</p>
                  </div>
                  <span className={styles.jobType}>{job.job_type}</span>
                </div>
                <p className={styles.meta}>
                  📍 {job.location || "Remote"}
                  {job.posted_by_name && ` • Posted by ${job.posted_by_name}`}
                </p>
                <p className={styles.description}>{job.description}</p>
                <a
                  href={job.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.applyBtn}
                >
                  Apply Now →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
