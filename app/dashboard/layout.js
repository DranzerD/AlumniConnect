import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";
import styles from "./dashboard.module.css";

export default async function DashboardLayout({ children }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className={styles.layout}>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <Link href="/dashboard" className={styles.logo}>
            🎓 AlumniConnect
          </Link>

          <div className={styles.navLinks}>
            <Link href="/dashboard">Home</Link>
            <Link href="/dashboard/directory">Directory</Link>
            <Link href="/dashboard/jobs">Jobs</Link>
            <Link href="/dashboard/events">Events</Link>
            <Link href="/dashboard/mentorship">Mentorship</Link>
            <Link href="/dashboard/messages">Messages</Link>
            <Link href="/dashboard/stories">Stories</Link>
            <Link href="/dashboard/analytics">Analytics</Link>
            <Link href="/dashboard/profile">Profile</Link>
            <Link href="/dashboard/settings">Settings</Link>
            {session.role === "admin" && <Link href="/admin">Admin</Link>}
          </div>

          <form
            action="/api/auth/logout"
            method="POST"
            className={styles.logoutForm}
          >
            <button type="submit" className={styles.logoutBtn}>
              Logout
            </button>
          </form>
        </div>
      </nav>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
