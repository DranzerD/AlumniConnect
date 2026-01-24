"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./StatsCard.module.css";

export default function StatsCard({
  title,
  value,
  suffix = "",
  prefix = "",
  icon,
  trend,
  trendValue,
  description,
  color = "primary",
  animate = true,
  className = "",
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !animate) {
      setDisplayValue(value);
      return;
    }

    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(value * easeOutQuart));

      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, isVisible, animate]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString();
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${styles[color]} ${className}`}
    >
      <div className={styles.header}>
        <div className={styles.iconWrapper}>{icon || "📊"}</div>
        {trend && (
          <div className={`${styles.trend} ${styles[trend]}`}>
            <span className={styles.trendIcon}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
            </span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h4 className={styles.title}>{title}</h4>
        <div className={styles.value}>
          {prefix}
          {formatNumber(displayValue)}
          {suffix}
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      <div className={styles.decoration} />
    </div>
  );
}

export function StatsGrid({ children, columns = 4, className = "" }) {
  return (
    <div
      className={`${styles.grid} ${className}`}
      style={{ "--columns": columns }}
    >
      {children}
    </div>
  );
}
