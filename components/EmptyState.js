"use client";

import styles from "./EmptyState.module.css";

export default function EmptyState({
  icon = "📭",
  title = "No data found",
  description = "There's nothing here yet.",
  action,
  actionText = "Get Started",
  variant = "default",
}) {
  return (
    <div className={`${styles.container} ${styles[variant]}`}>
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action && (
        <button className={styles.actionBtn} onClick={action}>
          {actionText}
        </button>
      )}
    </div>
  );
}

export function NoResults({ searchTerm, onClear }) {
  return (
    <EmptyState
      icon="🔍"
      title="No results found"
      description={`We couldn't find anything matching "${searchTerm}". Try adjusting your search or filters.`}
      action={onClear}
      actionText="Clear Search"
    />
  );
}

export function NoJobs() {
  return (
    <EmptyState
      icon="💼"
      title="No job postings yet"
      description="Check back later for new opportunities from your alumni network."
      variant="jobs"
    />
  );
}

export function NoAlumni() {
  return (
    <EmptyState
      icon="👥"
      title="No alumni found"
      description="Try adjusting your search filters or check back later for new members."
      variant="alumni"
    />
  );
}

export function NoEvents() {
  return (
    <EmptyState
      icon="📅"
      title="No upcoming events"
      description="Stay tuned for upcoming alumni meetups, webinars, and networking events."
      variant="events"
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon="🔔"
      title="You're all caught up!"
      description="No new notifications at the moment."
      variant="notifications"
    />
  );
}
