"use client";

import styles from "./ConfirmDialog.module.css";

export default function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  type = "danger",
}) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button onClick={onCancel} className={styles.cancelBtn}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`${styles.confirmBtn} ${styles[type]}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
