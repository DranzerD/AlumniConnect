"use client";

import { createContext, useContext, useState, useCallback } from "react";
import styles from "./ToastProvider.module.css";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: toast.type || "info",
      title: toast.title,
      message: toast.message,
      duration: toast.duration ?? 5000,
      action: toast.action,
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    show: addToast,
    success: (message, options = {}) =>
      addToast({ ...options, message, type: "success" }),
    error: (message, options = {}) =>
      addToast({ ...options, message, type: "error" }),
    warning: (message, options = {}) =>
      addToast({ ...options, message, type: "warning" }),
    info: (message, options = {}) =>
      addToast({ ...options, message, type: "info" }),
    remove: removeToast,
    clear: () => setToasts([]),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`}>
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{icons[toast.type]}</span>
      </div>

      <div className={styles.content}>
        {toast.title && <h4 className={styles.title}>{toast.title}</h4>}
        <p className={styles.message}>{toast.message}</p>

        {toast.action && (
          <button
            className={styles.action}
            onClick={() => {
              toast.action.onClick();
              onRemove(toast.id);
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        className={styles.close}
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss"
      >
        ×
      </button>

      {toast.duration > 0 && (
        <div
          className={styles.progress}
          style={{ animationDuration: `${toast.duration}ms` }}
        />
      )}
    </div>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}
