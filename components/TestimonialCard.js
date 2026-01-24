"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./TestimonialCard.module.css";

export default function TestimonialCard({
  name,
  role,
  company,
  image,
  quote,
  rating = 5,
  delay = 0,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${isVisible ? styles.visible : ""}`}
    >
      <div className={styles.quoteIcon}>"</div>

      <div className={styles.rating}>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < rating ? styles.starFilled : styles.star}
          >
            ★
          </span>
        ))}
      </div>

      <p className={styles.quote}>{quote}</p>

      <div className={styles.author}>
        <div className={styles.avatar}>
          {image ? (
            <img src={image} alt={name} className={styles.avatarImg} />
          ) : (
            <span className={styles.initials}>{getInitials(name)}</span>
          )}
        </div>
        <div className={styles.authorInfo}>
          <div className={styles.name}>{name}</div>
          <div className={styles.role}>
            {role} {company && `@ ${company}`}
          </div>
        </div>
      </div>
    </div>
  );
}
