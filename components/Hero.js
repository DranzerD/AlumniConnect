"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Hero.module.css";
import AnimatedCounter from "./AnimatedCounter";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { value: 50000, label: "Alumni Network", suffix: "+" },
    { value: 100, label: "Partner Colleges", suffix: "+" },
    { value: 5000, label: "Job Opportunities", suffix: "+" },
    { value: 95, label: "Success Rate", suffix: "%" },
  ];

  return (
    <section className={styles.hero}>
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      <div className={`${styles.content} ${isVisible ? styles.visible : ""}`}>
        <div className={styles.badge}>
          <span className={styles.badgeIcon}>🚀</span>
          <span>Connecting Alumni Worldwide</span>
        </div>

        <h1 className={styles.title}>
          Build Your Future with
          <span className={styles.highlight}> Alumni Network</span>
        </h1>

        <p className={styles.subtitle}>
          Connect with successful alumni, discover career opportunities, and
          grow your professional network. Join thousands of students and
          graduates making meaningful connections.
        </p>

        <div className={styles.actions}>
          <Link href="/register" className={styles.primaryBtn}>
            <span>Join Now — It's Free</span>
            <svg
              className={styles.btnIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
          <Link href="/features" className={styles.secondaryBtn}>
            <svg
              className={styles.playIcon}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>See How It Works</span>
          </Link>
        </div>

        <div className={styles.stats}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <div className={styles.statValue}>
                <AnimatedCounter end={stat.value} duration={2000} />
                {stat.suffix}
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`${styles.imageContainer} ${isVisible ? styles.visible : ""}`}
      >
        <div className={styles.imageWrapper}>
          <div className={styles.mockupCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.profilePreview}>
                <div className={styles.avatar}>JD</div>
                <div className={styles.profileInfo}>
                  <div className={styles.profileName}>John Doe</div>
                  <div className={styles.profileRole}>
                    Software Engineer @ Google
                  </div>
                </div>
              </div>
              <div className={styles.connectionLines}>
                <div className={styles.line}></div>
                <div className={styles.line}></div>
                <div className={styles.line}></div>
              </div>
              <div className={styles.miniProfiles}>
                <div className={styles.miniProfile}>AS</div>
                <div className={styles.miniProfile}>MK</div>
                <div className={styles.miniProfile}>RL</div>
                <div className={styles.miniProfileMore}>+99</div>
              </div>
            </div>
          </div>

          <div className={styles.floatingCard1}>
            <span className={styles.floatingIcon}>💼</span>
            <span>New Job Alert!</span>
          </div>

          <div className={styles.floatingCard2}>
            <span className={styles.floatingIcon}>🤝</span>
            <span>Connection Request</span>
          </div>

          <div className={styles.floatingCard3}>
            <span className={styles.floatingIcon}>🎉</span>
            <span>Event Reminder</span>
          </div>
        </div>
      </div>

      <div className={styles.scrollIndicator}>
        <div className={styles.mouse}>
          <div className={styles.wheel}></div>
        </div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}
