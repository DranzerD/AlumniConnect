"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./companies.module.css";

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [sortBy, setSortBy] = useState("alumni_count");
  const [industries, setIndustries] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
      });

      if (search) params.append("search", search);
      if (industry) params.append("industry", industry);

      const response = await fetch(`/api/companies?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCompanies(data.companies);
        setIndustries(data.industries);
        setTopCompanies(data.topCompanies);
        setStats(data.stats);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, industry, sortBy]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const fetchCompanyDetails = async (companyName) => {
    try {
      const response = await fetch(
        `/api/companies/${encodeURIComponent(companyName)}`,
      );
      const data = await response.json();

      if (response.ok) {
        setCompanyDetails(data);
        setSelectedCompany(companyName);
      }
    } catch (error) {
      console.error("Failed to fetch company details:", error);
    }
  };

  const getCompanyLogo = (name) => {
    // Generate a consistent color based on company name
    const colors = [
      "#ef4444",
      "#f97316",
      "#eab308",
      "#22c55e",
      "#14b8a6",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>🏢 Alumni Organizations</h1>
          <p className={styles.subtitle}>
            Explore companies and organizations where our alumni work
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🏢</span>
          <div>
            <span className={styles.statValue}>
              {stats.total_companies || 0}
            </span>
            <span className={styles.statLabel}>Companies</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🏭</span>
          <div>
            <span className={styles.statValue}>
              {stats.total_industries || 0}
            </span>
            <span className={styles.statLabel}>Industries</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🏆</span>
          <div>
            <span className={styles.statValue}>
              {stats.top_company || "N/A"}
            </span>
            <span className={styles.statLabel}>Top Employer</span>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Sidebar with top companies */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>🔥 Top Companies</h3>
          <div className={styles.topList}>
            {topCompanies.map((company, index) => (
              <div
                key={index}
                className={styles.topItem}
                onClick={() => fetchCompanyDetails(company.company)}
              >
                <span className={styles.rank}>{index + 1}</span>
                <div
                  className={styles.companyMini}
                  style={{ background: getCompanyLogo(company.company) }}
                >
                  {company.company.charAt(0)}
                </div>
                <div className={styles.topInfo}>
                  <span className={styles.topName}>{company.company}</span>
                  <span className={styles.topCount}>
                    {company.count} alumni
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className={styles.content}>
          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>

            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="alumni_count">Most Alumni</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>

          {/* Companies Grid */}
          {loading ? (
            <div className={styles.loadingGrid}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}></div>
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏢</div>
              <h3>No companies found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className={styles.companyGrid}>
              {companies.map((company, index) => (
                <div
                  key={index}
                  className={styles.companyCard}
                  onClick={() => fetchCompanyDetails(company.company)}
                >
                  <div className={styles.cardHeader}>
                    <div
                      className={styles.companyLogo}
                      style={{ background: getCompanyLogo(company.company) }}
                    >
                      {company.company.charAt(0)}
                    </div>
                    <div className={styles.companyInfo}>
                      <h3 className={styles.companyName}>{company.company}</h3>
                      <p className={styles.companyIndustry}>
                        {company.industry || "Various Industries"}
                      </p>
                    </div>
                  </div>

                  <div className={styles.cardStats}>
                    <div className={styles.cardStat}>
                      <span className={styles.cardStatValue}>
                        {company.alumni_count}
                      </span>
                      <span className={styles.cardStatLabel}>Alumni</span>
                    </div>
                    <div className={styles.cardStat}>
                      <span className={styles.cardStatValue}>
                        {company.locations?.length || 0}
                      </span>
                      <span className={styles.cardStatLabel}>Locations</span>
                    </div>
                    <div className={styles.cardStat}>
                      <span className={styles.cardStatValue}>
                        {company.jobTitles?.length || 0}
                      </span>
                      <span className={styles.cardStatLabel}>Roles</span>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    {company.locations?.slice(0, 3).map((loc, i) => (
                      <span key={i} className={styles.locationTag}>
                        📍 {loc}
                      </span>
                    ))}
                    {company.locations?.length > 3 && (
                      <span className={styles.moreTag}>
                        +{company.locations.length - 3}
                      </span>
                    )}
                  </div>

                  <div className={styles.yearRange}>
                    Class of {company.earliest_year} - {company.latest_year}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Company Details Modal */}
      {selectedCompany && companyDetails && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedCompany(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalCompanyInfo}>
                <div
                  className={styles.modalLogo}
                  style={{ background: getCompanyLogo(selectedCompany) }}
                >
                  {selectedCompany.charAt(0)}
                </div>
                <div>
                  <h2>{selectedCompany}</h2>
                  <p>
                    {companyDetails.company.industry || "Various Industries"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className={styles.closeBtn}
              >
                ×
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.modalStats}>
                <div className={styles.modalStat}>
                  <span className={styles.bigNumber}>
                    {companyDetails.company.alumniCount}
                  </span>
                  <span>Total Alumni</span>
                </div>
              </div>

              <div className={styles.charts}>
                <div className={styles.chart}>
                  <h4>📋 Roles</h4>
                  <div className={styles.chartList}>
                    {companyDetails.company.jobDistribution
                      .slice(0, 5)
                      .map((item, i) => (
                        <div key={i} className={styles.chartItem}>
                          <span>{item.job_title}</span>
                          <span className={styles.chartCount}>
                            {item.count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className={styles.chart}>
                  <h4>📍 Locations</h4>
                  <div className={styles.chartList}>
                    {companyDetails.company.locationDistribution
                      .slice(0, 5)
                      .map((item, i) => (
                        <div key={i} className={styles.chartItem}>
                          <span>{item.city}</span>
                          <span className={styles.chartCount}>
                            {item.count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <h4 className={styles.alumniTitle}>
                👥 Alumni at {selectedCompany}
              </h4>
              <div className={styles.alumniGrid}>
                {companyDetails.alumni.slice(0, 12).map((person, i) => (
                  <div key={i} className={styles.alumniCard}>
                    <div className={styles.alumniAvatar}>
                      {person.photo ? (
                        <img src={person.photo} alt={person.name} />
                      ) : (
                        <span>{person.name?.charAt(0)}</span>
                      )}
                    </div>
                    <div className={styles.alumniInfo}>
                      <strong>{person.name}</strong>
                      <p>{person.job_title}</p>
                      <span>Class of {person.graduation_year}</span>
                    </div>
                  </div>
                ))}
              </div>

              {companyDetails.jobs.length > 0 && (
                <>
                  <h4 className={styles.jobsTitle}>💼 Open Positions</h4>
                  <div className={styles.jobsList}>
                    {companyDetails.jobs.map((job, i) => (
                      <div key={i} className={styles.jobItem}>
                        <h5>{job.title}</h5>
                        <p>{job.location}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
