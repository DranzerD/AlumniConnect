"use client";

import styles from "./Card.module.css";

export default function Card({
  children,
  variant = "default",
  padding = "normal",
  hoverable = false,
  onClick,
  className = "",
}) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={`${styles.card} ${styles[variant]} ${styles[`padding-${padding}`]} ${
        hoverable ? styles.hoverable : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={`${styles.header} ${className}`}>{children}</div>;
}

export function CardTitle({ children, as = "h3", className = "" }) {
  const Component = as;
  return (
    <Component className={`${styles.title} ${className}`}>{children}</Component>
  );
}

export function CardDescription({ children, className = "" }) {
  return <p className={`${styles.description} ${className}`}>{children}</p>;
}

export function CardContent({ children, className = "" }) {
  return <div className={`${styles.content} ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return <div className={`${styles.footer} ${className}`}>{children}</div>;
}

export function CardImage({ src, alt, aspectRatio = "16/9", className = "" }) {
  return (
    <div
      className={`${styles.imageWrapper} ${className}`}
      style={{ aspectRatio }}
    >
      <img src={src} alt={alt} className={styles.image} />
    </div>
  );
}

export function CardBadge({ children, variant = "default", className = "" }) {
  return (
    <span
      className={`${styles.badge} ${styles[`badge-${variant}`]} ${className}`}
    >
      {children}
    </span>
  );
}
