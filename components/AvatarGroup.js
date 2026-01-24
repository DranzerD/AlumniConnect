"use client";

import styles from "./AvatarGroup.module.css";

export default function AvatarGroup({
  users,
  max = 5,
  size = "medium",
  showTooltip = true,
  onMoreClick,
  className = "",
}) {
  const displayedUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className={`${styles.group} ${styles[size]} ${className}`}>
      {displayedUsers.map((user, index) => (
        <div
          key={user.id || index}
          className={styles.avatar}
          style={{ zIndex: displayedUsers.length - index }}
          title={showTooltip ? user.name : undefined}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span className={styles.initials}>{getInitials(user.name)}</span>
          )}
          {user.online && <span className={styles.status} />}
        </div>
      ))}

      {remainingCount > 0 && (
        <button
          className={`${styles.avatar} ${styles.more}`}
          onClick={onMoreClick}
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </button>
      )}
    </div>
  );
}

function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Single Avatar Component
export function Avatar({
  src,
  name,
  size = "medium",
  status,
  badge,
  onClick,
  className = "",
}) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={`${styles.singleAvatar} ${styles[size]} ${onClick ? styles.clickable : ""} ${className}`}
      onClick={onClick}
      title={name}
    >
      {src ? (
        <img src={src} alt={name} />
      ) : (
        <span className={styles.initials}>{getInitials(name)}</span>
      )}

      {status && (
        <span className={`${styles.status} ${styles[`status-${status}`]}`} />
      )}

      {badge !== undefined && <span className={styles.badge}>{badge}</span>}
    </Component>
  );
}
