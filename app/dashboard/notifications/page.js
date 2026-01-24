"use client";

import { useState, useEffect } from "react";
import styles from "./notifications.module.css";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const unreadOnly = filter === "unread" ? "&unread=true" : "";
      const response = await fetch(`/api/notifications?limit=50${unreadOnly}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const clearAll = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return;
    try {
      await fetch("/api/notifications?all=true", { method: "DELETE" });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      connection_request: "👋",
      connection_accepted: "🤝",
      message: "💬",
      job_application: "📝",
      job_posted: "💼",
      event_invitation: "📅",
      event_reminder: "⏰",
      mentorship_request: "🎓",
      mentorship_accepted: "✅",
      story_like: "❤️",
      story_comment: "💭",
      system: "🔔",
    };
    return icons[type] || "🔔";
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const groupNotificationsByDate = (notifications) => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      earlier: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    notifications.forEach((notification) => {
      const date = new Date(notification.createdAt);
      if (date >= today) {
        groups.today.push(notification);
      } else if (date >= yesterday) {
        groups.yesterday.push(notification);
      } else if (date >= weekAgo) {
        groups.thisWeek.push(notification);
      } else {
        groups.earlier.push(notification);
      }
    });

    return groups;
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Notifications</h1>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount} unread</span>
          )}
        </div>
        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <button className={styles.textButton} onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button className={styles.textButton} onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === "all" ? styles.active : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`${styles.filterButton} ${filter === "unread" ? styles.active : ""}`}
          onClick={() => setFilter("unread")}
        >
          Unread
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔔</div>
          <h3>No notifications</h3>
          <p>You&apos;re all caught up! Check back later for updates.</p>
        </div>
      ) : (
        <div className={styles.notificationsList}>
          {Object.entries(groupedNotifications).map(
            ([group, items]) =>
              items.length > 0 && (
                <div key={group} className={styles.group}>
                  <h3 className={styles.groupTitle}>
                    {group === "today"
                      ? "Today"
                      : group === "yesterday"
                        ? "Yesterday"
                        : group === "thisWeek"
                          ? "This Week"
                          : "Earlier"}
                  </h3>
                  {items.map((notification) => (
                    <div
                      key={notification.id}
                      className={`${styles.notification} ${
                        !notification.read ? styles.unread : ""
                      }`}
                      onClick={() =>
                        !notification.read && markAsRead(notification.id)
                      }
                    >
                      <div className={styles.notificationIcon}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className={styles.notificationContent}>
                        <div className={styles.notificationHeader}>
                          <h4 className={styles.notificationTitle}>
                            {notification.title}
                          </h4>
                          <span className={styles.notificationTime}>
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className={styles.notificationMessage}>
                          {notification.message}
                        </p>
                        {notification.sender && (
                          <div className={styles.notificationSender}>
                            <img
                              src={
                                notification.sender.avatar ||
                                "/default-avatar.png"
                              }
                              alt=""
                              className={styles.senderAvatar}
                            />
                            <span>{notification.sender.name}</span>
                          </div>
                        )}
                      </div>
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        aria-label="Delete notification"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
}
