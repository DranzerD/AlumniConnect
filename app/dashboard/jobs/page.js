"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./jobs.module.css";
import { CardSkeleton } from "../../../components/LoadingSkeleton";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [canPostJobs, setCanPostJobs] = useState(false);

  useEffect(() => {
    fetchJobs();
    checkPostPermission();
  }, [filter]);

  const checkPostPermission = async () => {
    const res = await fetch("/api/profiles/me");
    if (res.ok) {
      const data = await res.json();
      setCanPostJobs(data.role === "alumni" || data.role === "admin");
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("type", filter);

    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data.jobs || []);
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Job Opportunities</h1>
        {canPostJobs && (
          <button
            className={styles.postJobBtn}
            onClick={() => router.push("/dashboard/jobs/post")}
          >
            + Post Job
          </button>
        )}
      </div>

      <div className={styles.filterBar}>
        <button
          className={
            filter === "all" ? styles.filterBtnActive : styles.filterBtn
          }
          onClick={() => setFilter("all")}
        >
          All Jobs
        </button>
        <button
          className={
            filter === "internship" ? styles.filterBtnActive : styles.filterBtn
          }
          onClick={() => setFilter("internship")}
        >
          Internships
        </button>
        <button
          className={
            filter === "full-time" ? styles.filterBtnActive : styles.filterBtn
          }
          onClick={() => setFilter("full-time")}
        >
          Full-time
        </button>
      </div>

      {loading ? (
        <div className={styles.jobsList}>
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className={styles.jobsList}>
          {jobs.map((job) => (
            <div key={job.id} className={styles.jobCard}>
              <div className={styles.jobHeader}>
                <div>
                  <h3>{job.role_title}</h3>
                  <p className={styles.company}>{job.company_name}</p>
                </div>
                <span className={styles.jobType}>{job.job_type}</span>
              </div>

              <p className={styles.location}>📍 {job.location || "Remote"}</p>

              <p className={styles.description}>{job.description}</p>

              {job.posted_by_name && (
                <p className={styles.postedBy}>
                  Posted by {job.posted_by_name}
                </p>
              )}

              <a
                href={job.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.applyBtn}
              >
                Apply Now →
              </a>
            </div>
          ))}
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💼</div>
          <h3>No job postings yet</h3>
          <p>Check back later for new opportunities from your alumni network</p>
        </div>
      )}
    </div>
  );
}
