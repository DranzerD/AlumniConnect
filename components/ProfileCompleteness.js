"use client";

import styles from "./ProfileCompleteness.module.css";

export default function ProfileCompleteness({ profile }) {
  const calculateCompleteness = () => {
    if (!profile) return 0;

    const fields = [
      "full_name",
      "graduation_year",
      "degree",
      "department",
      "current_company",
      "current_role",
      "location",
      "linkedin_url",
      "bio",
    ];

    const filled = fields.filter(
      (field) => profile[field] && String(profile[field]).trim()
    ).length;
    return Math.round((filled / fields.length) * 100);
  };

  const percentage = calculateCompleteness();
  const color =
    percentage < 50 ? "#ef4444" : percentage < 80 ? "#f59e0b" : "#10b981";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Profile Completeness</span>
        <span className={styles.percentage} style={{ color }}>
          {percentage}%
        </span>
      </div>
      <div className={styles.barBackground}>
        <div
          className={styles.barFill}
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      {percentage < 100 && (
        <p className={styles.hint}>
          Complete your profile to increase visibility
        </p>
      )}
    </div>
  );
}
