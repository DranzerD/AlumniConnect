"use client";

import { forwardRef } from "react";
import styles from "./Button.module.css";

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "medium",
    fullWidth = false,
    disabled = false,
    loading = false,
    icon,
    iconPosition = "left",
    type = "button",
    onClick,
    className = "",
    ...props
  },
  ref,
) {
  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      type={type}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${
        fullWidth ? styles.fullWidth : ""
      } ${loading ? styles.loading : ""} ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <span className={styles.spinner}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="60"
              strokeDashoffset="20"
            />
          </svg>
        </span>
      )}

      {!loading && icon && iconPosition === "left" && (
        <span className={styles.icon}>{icon}</span>
      )}

      <span className={styles.text}>{children}</span>

      {!loading && icon && iconPosition === "right" && (
        <span className={styles.icon}>{icon}</span>
      )}
    </button>
  );
});

export default Button;

// Button Group
export function ButtonGroup({ children, className = "" }) {
  return <div className={`${styles.buttonGroup} ${className}`}>{children}</div>;
}

// Icon Button
export function IconButton({
  icon,
  size = "medium",
  variant = "ghost",
  label,
  ...props
}) {
  return (
    <button
      className={`${styles.iconButton} ${styles[variant]} ${styles[size]}`}
      aria-label={label}
      {...props}
    >
      {icon}
    </button>
  );
}
