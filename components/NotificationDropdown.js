"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./NotificationDropdown.module.css";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Sample notifications data
  const sampleNotifications = [
    {
      id: 1,
      type: "job",
      title: "New Job Opportunity",
      message: "Google is hiring Software Engineers - Apply now!",
      time: "2 minutes ago",
      read: false,
      icon: "💼",
    },
    {
      id: 2,
      type: "connection",
      title: "New Connection",
      message: "Sarah Johnson accepted your connection request",
      time: "1 hour ago",
      read: false,
      icon: "🤝",
    },
    {
      id: 3,
      type: "event",
      title: "Event Reminder",
      message: "Alumni Meetup starts in 2 hours",
      time: "2 hours ago",
      read: false,
      icon: "📅",
    },
    {
      id: 4,
      type: "profile",
      title: "Profile View",
      message: "5 alumni viewed your profile this week",
      time: "1 day ago",
      read: true,
      icon: "👁",
    },
    {
      id: 5,
      type: "message",
      title: "New Message",
      message: "You have a new message from John Doe",
      time: "2 days ago",
      read: true,
      icon: "💬",
    },
  ];

  useEffect(() => {
    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter((n) => !n.read).length);
  }, []);

  const handleClickOutside = useCallback((e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (id) => {
    const notification = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (notification && !notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3 className={styles.title}>Notifications</h3>
            {unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🔔</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.item} ${!notification.read ? styles.unread : ""}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={styles.itemIcon}>{notification.icon}</div>
                  <div className={styles.itemContent}>
                    <div className={styles.itemTitle}>{notification.title}</div>
                    <div className={styles.itemMessage}>
                      {notification.message}
                    </div>
                    <div className={styles.itemTime}>{notification.time}</div>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    aria-label="Remove notification"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className={styles.footer}>
              <button className={styles.viewAllBtn}>
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
