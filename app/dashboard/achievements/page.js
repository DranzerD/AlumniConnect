"use client";

import { useState, useEffect } from "react";
import styles from "./achievements.module.css";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [spotlight, setSpotlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    type: "achievement",
    title: "",
    description: "",
    company: "",
    achievementDate: "",
  });

  const achievementTypes = [
    { id: "all", label: "All", icon: "🏆" },
    { id: "promotion", label: "Promotions", icon: "📈" },
    { id: "award", label: "Awards", icon: "🎖️" },
    { id: "achievement", label: "Achievements", icon: "⭐" },
    { id: "spotlight", label: "Spotlights", icon: "✨" },
  ];

  useEffect(() => {
    fetchAchievements();
  }, [filter]);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const type = filter !== "all" ? `&type=${filter}` : "";
      const response = await fetch(`/api/achievements?limit=20${type}`);
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
        setSpotlight(data.spotlight);
      }
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const likeAchievement = async (id) => {
    try {
      const response = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", achievementId: id }),
      });

      if (response.ok) {
        const { liked } = await response.json();
        setAchievements((prev) =>
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  is_liked: liked,
                  like_count: a.like_count + (liked ? 1 : -1),
                }
              : a,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to like achievement:", error);
    }
  };

  const submitAchievement = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAchievement),
      });

      if (response.ok) {
        setShowSubmitModal(false);
        setNewAchievement({
          type: "achievement",
          title: "",
          description: "",
          company: "",
          achievementDate: "",
        });
        alert("Your achievement has been submitted for review!");
      }
    } catch (error) {
      console.error("Failed to submit achievement:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const getTypeIcon = (type) => {
    const icons = {
      promotion: "📈",
      award: "🎖️",
      achievement: "⭐",
      spotlight: "✨",
    };
    return icons[type] || "🏆";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Alumni Achievements</h1>
          <p className={styles.subtitle}>
            Celebrating the success and accomplishments of our community
          </p>
        </div>
        <button
          className={styles.submitButton}
          onClick={() => setShowSubmitModal(true)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Share Achievement
        </button>
      </div>

      {/* Spotlight Section */}
      {spotlight && (
        <section className={styles.spotlightSection}>
          <h2 className={styles.sectionTitle}>✨ Alumni Spotlight</h2>
          <div className={styles.spotlightCard}>
            <div className={styles.spotlightImage}>
              <img
                src={spotlight.user_avatar || "/default-avatar.png"}
                alt={spotlight.user_name}
              />
            </div>
            <div className={styles.spotlightContent}>
              <span className={styles.spotlightBadge}>Featured Alumni</span>
              <h3>{spotlight.user_name}</h3>
              <p className={styles.spotlightRole}>
                {spotlight.job_title} at {spotlight.user_company}
              </p>
              <p className={styles.spotlightBio}>{spotlight.description}</p>
              <div className={styles.spotlightMeta}>
                <span>Class of {spotlight.graduation_year}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter Tabs */}
      <div className={styles.filters}>
        {achievementTypes.map((type) => (
          <button
            key={type.id}
            className={`${styles.filterButton} ${
              filter === type.id ? styles.active : ""
            }`}
            onClick={() => setFilter(type.id)}
          >
            <span>{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🏆</div>
          <h3>No achievements yet</h3>
          <p>Be the first to share your success story!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`${styles.achievementCard} ${
                achievement.is_featured ? styles.featured : ""
              }`}
            >
              {achievement.is_featured && (
                <span className={styles.featuredBadge}>⭐ Featured</span>
              )}
              <div className={styles.cardHeader}>
                <img
                  src={achievement.user_avatar || "/default-avatar.png"}
                  alt={achievement.user_name}
                  className={styles.userAvatar}
                />
                <div className={styles.userInfo}>
                  <span className={styles.userName}>
                    {achievement.user_name}
                  </span>
                  <span className={styles.userDetails}>
                    {achievement.job_title} • Class of{" "}
                    {achievement.graduation_year}
                  </span>
                </div>
                <span className={styles.typeIcon}>
                  {getTypeIcon(achievement.type)}
                </span>
              </div>

              {achievement.image && (
                <div className={styles.cardImage}>
                  <img src={achievement.image} alt={achievement.title} />
                </div>
              )}

              <div className={styles.cardContent}>
                <span className={styles.achievementType}>
                  {achievement.type}
                </span>
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                {achievement.company && (
                  <span className={styles.company}>
                    🏢 {achievement.company}
                  </span>
                )}
                {achievement.achievement_date && (
                  <span className={styles.date}>
                    📅 {formatDate(achievement.achievement_date)}
                  </span>
                )}
              </div>

              <div className={styles.cardFooter}>
                <button
                  className={`${styles.likeButton} ${
                    achievement.is_liked ? styles.liked : ""
                  }`}
                  onClick={() => likeAchievement(achievement.id)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill={achievement.is_liked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span>{achievement.like_count}</span>
                </button>
                <button className={styles.shareButton}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className={styles.modal} onClick={() => setShowSubmitModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Share Your Achievement</h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowSubmitModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={submitAchievement}>
              <div className={styles.formGroup}>
                <label>Type</label>
                <select
                  value={newAchievement.type}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="achievement">Achievement</option>
                  <option value="promotion">Promotion</option>
                  <option value="award">Award</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  value={newAchievement.title}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g., Promoted to Senior Engineer"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={newAchievement.description}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      description: e.target.value,
                    })
                  }
                  placeholder="Tell us about your achievement..."
                  rows={4}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Company (optional)</label>
                  <input
                    type="text"
                    value={newAchievement.company}
                    onChange={(e) =>
                      setNewAchievement({
                        ...newAchievement,
                        company: e.target.value,
                      })
                    }
                    placeholder="Company name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Date (optional)</label>
                  <input
                    type="month"
                    value={newAchievement.achievementDate}
                    onChange={(e) =>
                      setNewAchievement({
                        ...newAchievement,
                        achievementDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton}>
                  Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
