"use client";

import { useEffect } from "react";
import styles from "./Toast.module.css";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.icon}>
        {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
      </div>
      <p className={styles.message}>{message}</p>
      <button onClick={onClose} className={styles.close}>
        ✕
      </button>
    </div>
  );
}
