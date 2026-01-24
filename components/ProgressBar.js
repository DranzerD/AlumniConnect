"use client";

import { useState, useEffect } from "react";
import styles from "./ProgressBar.module.css";

export default function ProgressBar({
  value = 0,
  max = 100,
  showLabel = true,
  labelPosition = "right",
  size = "medium",
  color = "primary",
  animated = false,
  striped = false,
  className = "",
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min(Math.max((displayValue / max) * 100, 0), 100);

  useEffect(() => {
    // Animate value change
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 50);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={`${styles.container} ${styles[size]} ${className}`}>
      {showLabel && labelPosition === "left" && (
        <span className={styles.label}>{Math.round(percentage)}%</span>
      )}

      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`${styles.bar} ${styles[color]} ${animated ? styles.animated : ""} ${striped ? styles.striped : ""}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showLabel && labelPosition === "right" && (
        <span className={styles.label}>{Math.round(percentage)}%</span>
      )}
    </div>
  );
}

// Circular Progress
export function CircularProgress({
  value = 0,
  max = 100,
  size = 100,
  strokeWidth = 8,
  showLabel = true,
  color = "primary",
  className = "",
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min(Math.max((displayValue / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 50);
    return () => clearTimeout(timer);
  }, [value]);

  const colorMap = {
    primary: "#2563eb",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    purple: "#7c3aed",
  };

  return (
    <div
      className={`${styles.circularContainer} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className={styles.circularSvg}>
        <circle
          className={styles.circularTrack}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className={styles.circularBar}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={colorMap[color] || color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <span className={styles.circularLabel} style={{ fontSize: size * 0.2 }}>
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

// Step Progress
export function StepProgress({ steps, currentStep = 0, className = "" }) {
  return (
    <div className={`${styles.stepContainer} ${className}`}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={`${styles.step} ${index <= currentStep ? styles.completed : ""} ${index === currentStep ? styles.current : ""}`}
        >
          <div className={styles.stepCircle}>
            {index < currentStep ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          <span className={styles.stepLabel}>{step}</span>
          {index < steps.length - 1 && <div className={styles.stepLine} />}
        </div>
      ))}
    </div>
  );
}
