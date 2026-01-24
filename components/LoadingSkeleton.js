"use client";

import styles from "./LoadingSkeleton.module.css";

export function CardSkeleton() {
  return (
    <div className={styles.card}>
      <div
        className={styles.skeleton}
        style={{ width: "60%", height: "24px" }}
      />
      <div
        className={styles.skeleton}
        style={{ width: "40%", height: "18px", marginTop: "0.5rem" }}
      />
      <div
        className={styles.skeleton}
        style={{ width: "80%", height: "16px", marginTop: "1rem" }}
      />
      <div
        className={styles.skeleton}
        style={{ width: "70%", height: "16px", marginTop: "0.5rem" }}
      />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className={styles.table}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.tableRow}>
          <div
            className={styles.skeleton}
            style={{ width: "30%", height: "20px" }}
          />
          <div
            className={styles.skeleton}
            style={{ width: "40%", height: "20px" }}
          />
          <div
            className={styles.skeleton}
            style={{ width: "20%", height: "20px" }}
          />
        </div>
      ))}
    </div>
  );
}
