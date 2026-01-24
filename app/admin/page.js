"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>

      <div className={styles.quickLinks}>
        <Link href="/admin/users" className={styles.linkCard}>
          <div className={styles.linkIcon}>👥</div>
          <h2>User Management</h2>
          <p>Manage users, roles, and permissions</p>
        </Link>

        <Link href="/dashboard/analytics" className={styles.linkCard}>
          <div className={styles.linkIcon}>📊</div>
          <h2>Analytics</h2>
          <p>View platform statistics and insights</p>
        </Link>

        <Link href="/dashboard/jobs" className={styles.linkCard}>
          <div className={styles.linkIcon}>💼</div>
          <h2>Job Postings</h2>
          <p>Manage job opportunities</p>
        </Link>

        <Link href="/dashboard/directory" className={styles.linkCard}>
          <div className={styles.linkIcon}>📖</div>
          <h2>Alumni Directory</h2>
          <p>Browse all alumni profiles</p>
        </Link>
      </div>

      <div className={styles.info}>
        <h2>Quick Actions</h2>
        <ul>
          <li>• Monitor user activity and engagement</li>
          <li>• Activate or deactivate user accounts</li>
          <li>• Review platform analytics and metrics</li>
          <li>• Manage job postings and opportunities</li>
        </ul>
      </div>
    </div>
  );
}
