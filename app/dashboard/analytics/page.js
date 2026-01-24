"use client";

import { useEffect, useState } from "react";
import styles from "./analytics.module.css";

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await fetch("/api/analytics");
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Platform Analytics</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats?.totalUsers || 0}</div>
          <div className={styles.statLabel}>Total Users</div>
          <div className={styles.statBreakdown}>
            {stats?.usersByRole?.alumni || 0} Alumni •{" "}
            {stats?.usersByRole?.student || 0} Students
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats?.totalJobs || 0}</div>
          <div className={styles.statLabel}>Job Postings</div>
          <div className={styles.statBreakdown}>
            {stats?.activeJobs || 0} Active •{" "}
            {stats?.totalJobs - stats?.activeJobs || 0} Archived
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats?.activeUsers || 0}</div>
          <div className={styles.statLabel}>Active Users</div>
          <div className={styles.statBreakdown}>
            {Math.round((stats?.activeUsers / stats?.totalUsers) * 100) || 0}%
            Activity Rate
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {stats?.profileCompletionRate || 0}%
          </div>
          <div className={styles.statLabel}>Profile Completion</div>
          <div className={styles.statBreakdown}>
            {stats?.completeProfiles || 0} Complete Profiles
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.activityList}>
          {stats?.recentActivity?.length > 0 ? (
            stats.recentActivity.map((activity, idx) => (
              <div key={idx} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  {activity.type === "user" && "👤"}
                  {activity.type === "job" && "💼"}
                  {activity.type === "profile" && "📝"}
                </div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>{activity.text}</div>
                  <div className={styles.activityTime}>{activity.time}</div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noActivity}>No recent activity</div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Top Companies Hiring</h2>
        <div className={styles.companiesList}>
          {stats?.topCompanies?.map((company, idx) => (
            <div key={idx} className={styles.companyItem}>
              <div className={styles.companyRank}>#{idx + 1}</div>
              <div className={styles.companyName}>{company.name}</div>
              <div className={styles.companyJobs}>{company.jobCount} jobs</div>
            </div>
          )) || <div className={styles.noData}>No data available</div>}
        </div>
      </div>
    </div>
  );
}
