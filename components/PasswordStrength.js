"use client";

import styles from "./PasswordStrength.module.css";

export default function PasswordStrength({ password }) {
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" };

    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: "Weak", color: "#ef4444" };
    if (score === 3) return { score, label: "Fair", color: "#f59e0b" };
    if (score === 4) return { score, label: "Good", color: "#10b981" };
    return { score, label: "Strong", color: "#059669" };
  };

  const strength = calculateStrength(password);

  if (!password) return null;

  return (
    <div className={styles.container}>
      <div className={styles.bars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={styles.bar}
            style={{
              backgroundColor: i <= strength.score ? strength.color : "#e5e7eb",
            }}
          />
        ))}
      </div>
      <span className={styles.label} style={{ color: strength.color }}>
        {strength.label}
      </span>
    </div>
  );
}
