"use client";

import styles from "./Badge.module.css";

export default function Badge({
  children,
  variant = "default",
  size = "medium",
  removable = false,
  onRemove,
  icon,
  className = "",
}) {
  const variants = {
    default: styles.default,
    primary: styles.primary,
    success: styles.success,
    warning: styles.warning,
    error: styles.error,
    info: styles.info,
    outline: styles.outline,
  };

  const sizes = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  return (
    <span
      className={`${styles.badge} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text}>{children}</span>
      {removable && (
        <button
          className={styles.removeBtn}
          onClick={onRemove}
          aria-label="Remove"
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
      )}
    </span>
  );
}

export function SkillBadge({ skill, level, onRemove }) {
  const levelColors = {
    beginner: "info",
    intermediate: "warning",
    advanced: "success",
    expert: "primary",
  };

  return (
    <Badge
      variant={levelColors[level] || "default"}
      removable={!!onRemove}
      onRemove={onRemove}
    >
      {skill}
    </Badge>
  );
}

export function StatusBadge({ status }) {
  const statusConfig = {
    active: { variant: "success", icon: "●" },
    inactive: { variant: "default", icon: "●" },
    pending: { variant: "warning", icon: "●" },
    archived: { variant: "error", icon: "●" },
    open: { variant: "success", icon: "●" },
    closed: { variant: "error", icon: "●" },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <Badge variant={config.variant} icon={config.icon} size="small">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
