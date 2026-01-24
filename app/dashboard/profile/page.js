"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import ProfileCompleteness from "@/components/ProfileCompleteness";
import { useToast } from "@/hooks/useToast";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const [profile, setProfile] = useState({
    full_name: "",
    graduation_year: "",
    degree: "",
    department: "",
    current_company: "",
    current_role: "",
    location: "",
    linkedin_url: "",
    github_url: "",
    bio: "",
    profile_visibility: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await fetch("/api/profiles/me");
    if (res.ok) {
      const data = await res.json();
      setProfile(data.profile);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/profiles/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    if (res.ok) {
      showToast("Profile updated successfully!", "success");
    } else {
      showToast("Failed to update profile", "error");
    }
    setSaving(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile({
      ...profile,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <h1 className={styles.title}>My Profile</h1>

      <ProfileCompleteness profile={profile} />

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Full Name *</label>
          <input
            type="text"
            name="full_name"
            value={profile.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Graduation Year</label>
            <input
              type="number"
              name="graduation_year"
              value={profile.graduation_year}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Degree</label>
            <input
              type="text"
              name="degree"
              value={profile.degree}
              onChange={handleChange}
              placeholder="e.g., B.Tech Computer Science"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Department</label>
          <input
            type="text"
            name="department"
            value={profile.department}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Current Company</label>
            <input
              type="text"
              name="current_company"
              value={profile.current_company}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Current Role</label>
            <input
              type="text"
              name="current_role"
              value={profile.current_role}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={profile.location}
            onChange={handleChange}
            placeholder="e.g., San Francisco, CA"
          />
        </div>

        <div className={styles.formGroup}>
          <label>LinkedIn URL</label>
          <input
            type="url"
            name="linkedin_url"
            value={profile.linkedin_url}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <div className={styles.formGroup}>
          <label>GitHub URL (Optional)</label>
          <input
            type="url"
            name="github_url"
            value={profile.github_url}
            onChange={handleChange}
            placeholder="https://github.com/yourusername"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Bio</label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Tell others about yourself..."
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="profile_visibility"
              checked={profile.profile_visibility}
              onChange={handleChange}
            />
            <span>Make my profile visible to others</span>
          </label>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
