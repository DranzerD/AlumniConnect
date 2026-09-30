"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, Briefcase, CalendarDays, Compass, Home, LogOut, Menu, MessageSquare, Settings, Shield, Users, UserPlus, X,
} from "lucide-react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { ROLE_LABELS } from "@/lib/format";
import styles from "./AppNav.module.css";

const LINKS = [
  { href: "/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/directory", label: "Directory", icon: Users },
  { href: "/dashboard/connections", label: "Connections", icon: UserPlus, badge: "connections" },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, badge: "messages" },
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/mentorship", label: "Mentorship", icon: Compass },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, badge: "notifications" },
];
const ADMIN_LINK = { href: "/dashboard/admin", label: "Admin", icon: Shield };
const POLL_MS = 20_000;

export default function AppNav({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({});

  // Badge counts refresh on navigation and on an interval.
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/summary", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => !cancelled && data && setCounts(data))
        .catch(() => {});
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const links = user.role === "admin" ? [...LINKS, ADMIN_LINK] : LINKS;
  const isActive = (link) => (link.exact ? pathname === link.href : pathname.startsWith(link.href));

  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <Link href="/dashboard" className={styles.brand}>
          <Logo />
        </Link>
        <button className={`btn btn-ghost ${styles.menuButton}`} onClick={() => setOpen((o) => !o)}
          aria-expanded={open} aria-label="Toggle navigation">
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      <div className={`${styles.body} ${open ? styles.open : ""}`}>
        <p className={`${styles.college} truncate`} title={user.collegeName}>{user.collegeName}</p>
        <nav className={styles.nav} aria-label="Main">
          {links.map((link) => {
            const Icon = link.icon;
            const count = link.badge ? counts[link.badge] : 0;
            return (
              <Link key={link.href} href={link.href}
                className={`${styles.link} ${isActive(link) ? styles.active : ""}`}
                aria-current={isActive(link) ? "page" : undefined}>
                <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                <span className={styles.label}>{link.label}</span>
                {count > 0 && (
                  <span className={styles.count}>
                    {count > 99 ? "99+" : count}
                    <span className="sr-only"> new</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={styles.user}>
          <Link href="/dashboard/profile" className={styles.userLink}>
            <Avatar name={user.fullName} size="sm" />
            <span className={styles.userText}>
              <span className="truncate">{user.fullName}</span>
              <span className={styles.role}>{ROLE_LABELS[user.role]}</span>
            </span>
          </Link>
          <div className={styles.userActions}>
            <Link href="/dashboard/settings" className="btn btn-sm btn-ghost" aria-label="Settings" title="Settings">
              <Settings size={16} strokeWidth={1.75} />
            </Link>
            <button className="btn btn-sm btn-ghost" onClick={logout} aria-label="Log out" title="Log out">
              <LogOut size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
