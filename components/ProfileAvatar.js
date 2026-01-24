"use client";

import styles from "./ProfileAvatar.module.css";

export default function ProfileAvatar({ name, size = "medium" }) {
  const getInitials = (fullName) => {
    if (!fullName) return "?";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getColor = (name) => {
    if (!name) return "#0a66c2";
    const colors = [
      "#0a66c2",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#14b8a6",
      "#f97316",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const initials = getInitials(name);
  const bgColor = getColor(name);

  return (
    <div
      className={`${styles.avatar} ${styles[size]}`}
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
}
