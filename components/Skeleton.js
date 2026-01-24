"use client";

import styles from "./Skeleton.module.css";

export default function Skeleton({
  variant = "text",
  width,
  height,
  lines = 1,
  className = "",
}) {
  if (variant === "text" && lines > 1) {
    return (
      <div className={`${styles.textGroup} ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${styles.skeleton} ${styles.text}`}
            style={{
              width: i === lines - 1 ? "70%" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}

// Profile Skeleton
export function ProfileSkeleton({ className = "" }) {
  return (
    <div className={`${styles.profileSkeleton} ${className}`}>
      <Skeleton variant="circular" width={80} height={80} />
      <div className={styles.profileInfo}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={16} />
        <Skeleton variant="text" width="80%" height={14} />
      </div>
    </div>
  );
}

// Card Skeleton
export function CardSkeleton({ hasImage = true, className = "" }) {
  return (
    <div className={`${styles.cardSkeleton} ${className}`}>
      {hasImage && <Skeleton variant="rectangular" height={180} />}
      <div className={styles.cardContent}>
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" lines={3} />
        <div className={styles.cardFooter}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width="40%" height={14} />
        </div>
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5, className = "" }) {
  return (
    <tr className={`${styles.tableRow} ${className}`}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i}>
          <Skeleton variant="text" width={i === 0 ? "70%" : "50%"} />
        </td>
      ))}
    </tr>
  );
}

// List Item Skeleton
export function ListItemSkeleton({ hasAvatar = true, className = "" }) {
  return (
    <div className={`${styles.listItem} ${className}`}>
      {hasAvatar && <Skeleton variant="circular" width={48} height={48} />}
      <div className={styles.listContent}>
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
    </div>
  );
}
