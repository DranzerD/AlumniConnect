"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./post-job.module.css";
import { useToast } from "../../../hooks/useToast";
import Toast from "../../../components/Toast";

export default function PostJobPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState({
    company_name: "",
    role_title: "",
    job_type: "internship",
    location: "",
    description: "",
    requirements: "",
    apply_link: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    });

    if (res.ok) {
      showToast("Job posted successfully!", "success");
      setTimeout(() => router.push("/dashboard/jobs"), 1500);
    } else {
      const data = await res.json();
      showToast(data.error || "Failed to post job", "error");
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.container}>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Post a Job Opportunity</h1>
        <p className={styles.subtitle}>
          Help fellow alumni and students find great opportunities
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="company_name">Company Name *</label>
          <input
            id="company_name"
            name="company_name"
            type="text"
            value={job.company_name}
            onChange={handleChange}
            required
            placeholder="e.g., Google"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="role_title">Role Title *</label>
          <input
            id="role_title"
            name="role_title"
            type="text"
            value={job.role_title}
            onChange={handleChange}
            required
            placeholder="e.g., Software Engineering Intern"
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="job_type">Job Type *</label>
            <select
              id="job_type"
              name="job_type"
              value={job.job_type}
              onChange={handleChange}
              required
            >
              <option value="internship">Internship</option>
              <option value="full-time">Full-time</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">Location *</label>
            <input
              id="location"
              name="location"
              type="text"
              value={job.location}
              onChange={handleChange}
              required
              placeholder="e.g., San Francisco, CA or Remote"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Job Description *</label>
          <textarea
            id="description"
            name="description"
            value={job.description}
            onChange={handleChange}
            required
            rows={5}
            placeholder="Describe the role, responsibilities, and what makes it exciting..."
          />
          <span className={styles.charCount}>
            {job.description.length} characters
          </span>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="requirements">Requirements *</label>
          <textarea
            id="requirements"
            name="requirements"
            value={job.requirements}
            onChange={handleChange}
            required
            rows={4}
            placeholder="List key requirements, skills, and qualifications..."
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="apply_link">Application Link or Email *</label>
          <input
            id="apply_link"
            name="apply_link"
            type="text"
            value={job.apply_link}
            onChange={handleChange}
            required
            placeholder="e.g., https://careers.company.com/job/123 or email@company.com"
          />
          <span className={styles.hint}>
            Students will use this to apply for the position
          </span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.cancelBtn}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Posting..." : "Post Job"}
          </button>
        </div>
      </form>
    </div>
  );
}
