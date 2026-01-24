"use client";

import { useState, useEffect } from "react";
import ProfileAvatar from "@/components/ProfileAvatar";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { useDebounce } from "@/hooks/useDebounce";
import styles from "./directory.module.css";

export default function DirectoryPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    year: "",
    company: "",
    department: "",
    location: "",
  });

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    fetchProfiles();
  }, [debouncedSearch, filters]);

  const fetchProfiles = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.year) params.set("year", filters.year);
    if (filters.company) params.set("company", filters.company);
    if (filters.department) params.set("department", filters.department);
    if (filters.location) params.set("location", filters.location);

    const res = await fetch(`/api/profiles?${params}`);
    const data = await res.json();
    setProfiles(data.profiles || []);
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Alumni Directory</h1>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Search by name or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        <div className={styles.filters}>
          <input
            type="number"
            placeholder="Year"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className={styles.filterInput}
          />
          <input
            type="text"
            placeholder="Company"
            value={filters.company}
            onChange={(e) =>
              setFilters({ ...filters, company: e.target.value })
            }
            className={styles.filterInput}
          />
          <input
            type="text"
            placeholder="Department"
            value={filters.department}
            onChange={(e) =>
              setFilters({ ...filters, department: e.target.value })
            }
            className={styles.filterInput}
          />
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
            className={styles.filterInput}
          />
        </div>

        <button type="submit" className={styles.searchBtn}>
          Search
        </button>
      </form>

      {loading ? (
        <div className={styles.profilesGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className={styles.profilesGrid}>
          {profiles.map((profile) => (
            <div key={profile.user_id} className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <ProfileAvatar name={profile.full_name} size="large" />
                <div className={styles.profileInfo}>
                  <h3>{profile.full_name}</h3>
                  {profile.current_role && (
                    <p className={styles.role}>{profile.current_role}</p>
                  )}
                </div>
              </div>
              {profile.current_company && (
                <p className={styles.company}>🏢 {profile.current_company}</p>
              )}
              <div className={styles.details}>
                {profile.graduation_year && (
                  <span>🎓 Class of {profile.graduation_year}</span>
                )}
                {profile.department && <span>📚 {profile.department}</span>}
                {profile.location && <span>📍 {profile.location}</span>}
              </div>
              {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
              <div className={styles.cardActions}>
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkedinBtn}
                  >
                    LinkedIn →
                  </a>
                )}
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.githubBtn}
                  >
                    GitHub →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && profiles.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3>No alumni found</h3>
          <p>Try adjusting your search filters or check back later</p>
        </div>
      )}
    </div>
  );
}
