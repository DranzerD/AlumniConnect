"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./map.module.css";

export default function AlumniMapPage() {
  const [mapData, setMapData] = useState({
    locations: [],
    stats: {},
    topLocations: [],
    companiesByLocation: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filters, setFilters] = useState({
    year: "",
    company: "",
    industry: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    years: [],
    industries: [],
    companies: [],
  });
  const [viewMode, setViewMode] = useState("map"); // map, list, stats

  const fetchMapData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.year) params.append("year", filters.year);
      if (filters.company) params.append("company", filters.company);
      if (filters.industry) params.append("industry", filters.industry);

      const response = await fetch(`/api/alumni-map?${params}`);
      const data = await response.json();

      if (response.ok) {
        setMapData(data);
        setFilterOptions(data.filters);
      }
    } catch (error) {
      console.error("Failed to fetch map data:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  const getLocationSize = (count) => {
    if (count >= 50) return "xlarge";
    if (count >= 20) return "large";
    if (count >= 10) return "medium";
    if (count >= 5) return "small";
    return "tiny";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>🗺️ Alumni World Map</h1>
          <p className={styles.subtitle}>
            Discover where our alumni are making an impact around the world
          </p>
        </div>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === "map" ? styles.active : ""}`}
            onClick={() => setViewMode("map")}
          >
            🗺️ Map
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === "list" ? styles.active : ""}`}
            onClick={() => setViewMode("list")}
          >
            📋 List
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === "stats" ? styles.active : ""}`}
            onClick={() => setViewMode("stats")}
          >
            📊 Stats
          </button>
        </div>
      </div>

      {/* Stats Banner */}
      <div className={styles.statsBanner}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>
            {mapData.stats.total_alumni || 0}
          </span>
          <span className={styles.statLabel}>Alumni Worldwide</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>
            {mapData.stats.countries || 0}
          </span>
          <span className={styles.statLabel}>Countries</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{mapData.stats.cities || 0}</span>
          <span className={styles.statLabel}>Cities</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>
            {mapData.stats.top_city || "N/A"}
          </span>
          <span className={styles.statLabel}>Top Location</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          value={filters.year}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, year: e.target.value }))
          }
          className={styles.filterSelect}
        >
          <option value="">All Years</option>
          {filterOptions.years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={filters.industry}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, industry: e.target.value }))
          }
          className={styles.filterSelect}
        >
          <option value="">All Industries</option>
          {filterOptions.industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>

        <select
          value={filters.company}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, company: e.target.value }))
          }
          className={styles.filterSelect}
        >
          <option value="">All Companies</option>
          {filterOptions.companies.map((comp) => (
            <option key={comp} value={comp}>
              {comp}
            </option>
          ))}
        </select>

        <button
          className={styles.clearBtn}
          onClick={() => setFilters({ year: "", company: "", industry: "" })}
        >
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading alumni map...</p>
        </div>
      ) : (
        <>
          {viewMode === "map" && (
            <div className={styles.mapContainer}>
              {/* Interactive Map Placeholder - In production, integrate with Mapbox/Google Maps */}
              <div className={styles.mapPlaceholder}>
                <div className={styles.worldMap}>
                  <div className={styles.mapOverlay}>
                    <h3>Interactive Map</h3>
                    <p>Integration with Mapbox or Google Maps</p>
                  </div>

                  {/* Location Markers */}
                  <div className={styles.markers}>
                    {mapData.locations.slice(0, 20).map((loc, index) => (
                      <div
                        key={index}
                        className={`${styles.marker} ${styles[getLocationSize(loc.count)]}`}
                        onClick={() => setSelectedLocation(loc)}
                        style={{
                          left: `${(index * 4 + 10) % 80}%`,
                          top: `${(index * 7 + 15) % 60}%`,
                        }}
                        title={`${loc.location}: ${loc.count} alumni`}
                      >
                        <span className={styles.markerCount}>{loc.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location Details Sidebar */}
              {selectedLocation && (
                <div className={styles.sidebar}>
                  <div className={styles.sidebarHeader}>
                    <h3>📍 {selectedLocation.location}</h3>
                    <button onClick={() => setSelectedLocation(null)}>×</button>
                  </div>
                  <p className={styles.alumniCount}>
                    {selectedLocation.count} Alumni
                  </p>
                  <div className={styles.alumniList}>
                    {selectedLocation.alumni.slice(0, 10).map((person, idx) => (
                      <div key={idx} className={styles.alumniItem}>
                        <div className={styles.alumniAvatar}>
                          {person.photo ? (
                            <img src={person.photo} alt={person.name} />
                          ) : (
                            <span>{person.name?.charAt(0)}</span>
                          )}
                        </div>
                        <div className={styles.alumniDetails}>
                          <strong>{person.name}</strong>
                          <p>
                            {person.jobTitle} at {person.company}
                          </p>
                          <span className={styles.year}>
                            Class of {person.graduationYear}
                          </span>
                        </div>
                      </div>
                    ))}
                    {selectedLocation.alumni.length > 10 && (
                      <p className={styles.moreAlumni}>
                        +{selectedLocation.alumni.length - 10} more alumni
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {viewMode === "list" && (
            <div className={styles.listView}>
              <div className={styles.locationGrid}>
                {mapData.topLocations.map((loc, index) => (
                  <div
                    key={index}
                    className={styles.locationCard}
                    onClick={() => {
                      const fullLoc = mapData.locations.find(
                        (l) => l.location === loc.city,
                      );
                      if (fullLoc) {
                        setSelectedLocation(fullLoc);
                        setViewMode("map");
                      }
                    }}
                  >
                    <div className={styles.locationRank}>#{index + 1}</div>
                    <div className={styles.locationInfo}>
                      <h4>{loc.city}</h4>
                      <p>{loc.country}</p>
                    </div>
                    <div className={styles.locationCount}>
                      <span className={styles.countBig}>
                        {loc.alumni_count}
                      </span>
                      <span className={styles.countLabel}>Alumni</span>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className={styles.sectionTitle}>
                Companies with Multiple Alumni
              </h3>
              <div className={styles.companyGrid}>
                {mapData.companiesByLocation.map((item, index) => (
                  <div key={index} className={styles.companyCard}>
                    <div className={styles.companyLocation}>📍 {item.city}</div>
                    <div className={styles.companyName}>{item.company}</div>
                    <div className={styles.companyCount}>
                      {item.count} alumni
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === "stats" && (
            <div className={styles.statsView}>
              <div className={styles.statsGrid}>
                <div className={styles.chartCard}>
                  <h3>🌍 Alumni by Region</h3>
                  <div className={styles.barChart}>
                    {mapData.topLocations.slice(0, 8).map((loc, index) => (
                      <div key={index} className={styles.barItem}>
                        <span className={styles.barLabel}>{loc.city}</span>
                        <div className={styles.barTrack}>
                          <div
                            className={styles.barFill}
                            style={{
                              width: `${(loc.alumni_count / (mapData.topLocations[0]?.alumni_count || 1)) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className={styles.barValue}>
                          {loc.alumni_count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.chartCard}>
                  <h3>🏢 Top Employers</h3>
                  <div className={styles.employerList}>
                    {filterOptions.companies
                      .slice(0, 10)
                      .map((company, index) => (
                        <div key={index} className={styles.employerItem}>
                          <span className={styles.rank}>{index + 1}</span>
                          <span className={styles.employerName}>{company}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className={styles.chartCard}>
                  <h3>📈 Growth Over Years</h3>
                  <div className={styles.yearsList}>
                    {filterOptions.years.slice(0, 10).map((year, index) => (
                      <div key={index} className={styles.yearItem}>
                        <span className={styles.yearLabel}>{year}</span>
                        <div className={styles.yearDot}></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.chartCard}>
                  <h3>🏭 Industries</h3>
                  <div className={styles.industryCloud}>
                    {filterOptions.industries.map((industry, index) => (
                      <span
                        key={index}
                        className={styles.industryTag}
                        style={{ fontSize: `${0.8 + Math.random() * 0.4}rem` }}
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Connect CTA */}
      <div className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h3>🤝 Connect with Alumni in Your Area</h3>
          <p>Find alumni near you and expand your professional network</p>
          <button className={styles.ctaButton}>Find Local Alumni</button>
        </div>
      </div>
    </div>
  );
}
