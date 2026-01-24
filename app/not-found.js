"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./not-found.module.css";

/**
 * Custom 404 Not Found Page
 */
export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
      </div>

      <div className={styles.content}>
        <div
          className={styles.errorCode}
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          }}
        >
          <span className={styles.four}>4</span>
          <span
            className={`${styles.zero} ${isHovering ? styles.spinning : ""}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            0
          </span>
          <span className={styles.four}>4</span>
        </div>

        <h1 className={styles.title}>Page Not Found</h1>

        <p className={styles.message}>
          Oops! The page you're looking for seems to have wandered off. Maybe it
          graduated and moved on to bigger things! 🎓
        </p>

        <div className={styles.suggestions}>
          <p className={styles.suggestionsTitle}>
            Here are some helpful links:
          </p>
          <div className={styles.links}>
            <Link href="/" className={styles.link}>
              <span className={styles.linkIcon}>🏠</span>
              <span>Home</span>
            </Link>
            <Link href="/dashboard" className={styles.link}>
              <span className={styles.linkIcon}>📊</span>
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/directory" className={styles.link}>
              <span className={styles.linkIcon}>👥</span>
              <span>Alumni Directory</span>
            </Link>
            <Link href="/dashboard/jobs" className={styles.link}>
              <span className={styles.linkIcon}>💼</span>
              <span>Job Board</span>
            </Link>
            <Link href="/dashboard/events" className={styles.link}>
              <span className={styles.linkIcon}>📅</span>
              <span>Events</span>
            </Link>
          </div>
        </div>

        <div className={styles.searchSection}>
          <p>Or search for what you need:</p>
          <form className={styles.searchForm} action="/dashboard/directory">
            <input
              type="text"
              name="q"
              placeholder="Search alumni, jobs, events..."
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              🔍
            </button>
          </form>
        </div>

        <div className={styles.funFact}>
          <span className={styles.funFactIcon}>💡</span>
          <span>
            Fun fact: The HTTP 404 error code was named after Room 404 at CERN,
            where the World Wide Web was born!
          </span>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>
          Need help? <Link href="/contact">Contact Support</Link>
        </p>
      </footer>
    </div>
  );
}
