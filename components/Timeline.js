"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Timeline.module.css";

export default function Timeline({ items, variant = "vertical" }) {
  return (
    <div className={`${styles.timeline} ${styles[variant]}`}>
      {items.map((item, index) => (
        <TimelineItem
          key={item.id || index}
          {...item}
          index={index}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
}

function TimelineItem({
  date,
  title,
  description,
  icon,
  color = "primary",
  image,
  index,
  isLast,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100);
        }
      },
      { threshold: 0.2 },
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  const colors = {
    primary: styles.colorPrimary,
    success: styles.colorSuccess,
    warning: styles.colorWarning,
    error: styles.colorError,
    info: styles.colorInfo,
  };

  return (
    <div
      ref={itemRef}
      className={`${styles.item} ${isVisible ? styles.visible : ""} ${colors[color]}`}
    >
      <div className={styles.marker}>
        <div className={styles.dot}>
          {icon && <span className={styles.icon}>{icon}</span>}
        </div>
        {!isLast && <div className={styles.line} />}
      </div>

      <div className={styles.content}>
        <div className={styles.date}>{date}</div>
        <div className={styles.card}>
          {image && (
            <div className={styles.imageWrapper}>
              <img src={image} alt={title} className={styles.image} />
            </div>
          )}
          <div className={styles.cardContent}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CareerTimeline({ experiences }) {
  const items = experiences.map((exp) => ({
    date: `${exp.startDate} - ${exp.endDate || "Present"}`,
    title: `${exp.role} at ${exp.company}`,
    description: exp.description,
    icon: "💼",
    color: exp.current ? "primary" : "info",
  }));

  return <Timeline items={items} />;
}

export function EducationTimeline({ education }) {
  const items = education.map((edu) => ({
    date: `${edu.startYear} - ${edu.endYear || "Present"}`,
    title: edu.degree,
    description: `${edu.institution} - ${edu.field}`,
    icon: "🎓",
    color: "success",
  }));

  return <Timeline items={items} />;
}
