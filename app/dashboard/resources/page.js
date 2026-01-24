"use client";

import { useState, useEffect } from "react";
import styles from "./resources.module.css";

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeType, setActiveType] = useState(null);
  const [search, setSearch] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "link",
    category: "career",
    url: "",
    tags: [],
  });

  const resourceTypes = [
    { id: "document", label: "Documents", icon: "📄" },
    { id: "video", label: "Videos", icon: "🎥" },
    { id: "link", label: "Links", icon: "🔗" },
    { id: "template", label: "Templates", icon: "📋" },
    { id: "course", label: "Courses", icon: "🎓" },
  ];

  const categoryOptions = [
    { id: "career", label: "Career Development", icon: "💼" },
    { id: "technical", label: "Technical Skills", icon: "💻" },
    { id: "interview", label: "Interview Prep", icon: "🎯" },
    { id: "networking", label: "Networking", icon: "🤝" },
    { id: "entrepreneurship", label: "Entrepreneurship", icon: "🚀" },
    { id: "leadership", label: "Leadership", icon: "👔" },
    { id: "finance", label: "Finance & Investing", icon: "💰" },
    { id: "wellness", label: "Wellness", icon: "🧘" },
  ];

  useEffect(() => {
    fetchResources();
  }, [activeCategory, activeType, search]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: activeCategory,
        ...(activeType && { type: activeType }),
        ...(search && { search }),
        limit: "24",
      });
      const response = await fetch(`/api/resources?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || []);
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const bookmarkResource = async (id) => {
    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bookmark", resourceId: id }),
      });

      if (response.ok) {
        const { bookmarked } = await response.json();
        setResources((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  is_bookmarked: bookmarked,
                  bookmark_count: r.bookmark_count + (bookmarked ? 1 : -1),
                }
              : r,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to bookmark:", error);
    }
  };

  const trackDownload = async (id, url) => {
    await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "download", resourceId: id }),
    });
    window.open(url, "_blank");
  };

  const submitResource = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResource),
      });

      if (response.ok) {
        setShowSubmitModal(false);
        setNewResource({
          title: "",
          description: "",
          type: "link",
          category: "career",
          url: "",
          tags: [],
        });
        alert("Resource submitted for review!");
      }
    } catch (error) {
      console.error("Failed to submit resource:", error);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      document: "📄",
      video: "🎥",
      link: "🔗",
      template: "📋",
      course: "🎓",
    };
    return icons[type] || "📁";
  };

  const getCategoryIcon = (category) => {
    const cat = categoryOptions.find((c) => c.id === category);
    return cat?.icon || "📁";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Resource Library</h1>
          <p className={styles.subtitle}>
            Curated resources to help you grow professionally
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
          Share Resource
        </button>
      </div>

      {/* Search and Filters */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.typeFilters}>
          {resourceTypes.map((type) => (
            <button
              key={type.id}
              className={`${styles.typeButton} ${
                activeType === type.id ? styles.active : ""
              }`}
              onClick={() =>
                setActiveType(activeType === type.id ? null : type.id)
              }
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.layout}>
        {/* Sidebar Categories */}
        <aside className={styles.sidebar}>
          <h3>Categories</h3>
          <ul className={styles.categoryList}>
            <li>
              <button
                className={`${styles.categoryItem} ${
                  activeCategory === "all" ? styles.active : ""
                }`}
                onClick={() => setActiveCategory("all")}
              >
                <span>📚</span>
                All Resources
              </button>
            </li>
            {categoryOptions.map((cat) => (
              <li key={cat.id}>
                <button
                  className={`${styles.categoryItem} ${
                    activeCategory === cat.id ? styles.active : ""
                  }`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                  <span className={styles.count}>
                    {categories.find((c) => c.category === cat.id)?.count || 0}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Resources Grid */}
        <main className={styles.main}>
          {loading ? (
            <div className={styles.grid}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📚</div>
              <h3>No resources found</h3>
              <p>Try adjusting your filters or share a resource!</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className={`${styles.resourceCard} ${
                    resource.is_featured ? styles.featured : ""
                  }`}
                >
                  {resource.is_featured && (
                    <span className={styles.featuredBadge}>⭐ Featured</span>
                  )}
                  <div className={styles.cardThumbnail}>
                    {resource.thumbnail ? (
                      <img src={resource.thumbnail} alt={resource.title} />
                    ) : (
                      <div className={styles.thumbnailPlaceholder}>
                        {getTypeIcon(resource.type)}
                      </div>
                    )}
                    <span className={styles.typeBadge}>
                      {getTypeIcon(resource.type)} {resource.type}
                    </span>
                  </div>
                  <div className={styles.cardContent}>
                    <span className={styles.category}>
                      {getCategoryIcon(resource.category)} {resource.category}
                    </span>
                    <h3>{resource.title}</h3>
                    <p>{resource.description}</p>
                    {resource.tags && resource.tags.length > 0 && (
                      <div className={styles.tags}>
                        {resource.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className={styles.tag}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={styles.cardFooter}>
                    <div className={styles.stats}>
                      <span>👁 {resource.view_count}</span>
                      <span>⬇️ {resource.download_count}</span>
                    </div>
                    <div className={styles.actions}>
                      <button
                        className={`${styles.bookmarkButton} ${
                          resource.is_bookmarked ? styles.bookmarked : ""
                        }`}
                        onClick={() => bookmarkResource(resource.id)}
                        title="Bookmark"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill={
                            resource.is_bookmarked ? "currentColor" : "none"
                          }
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                      <button
                        className={styles.openButton}
                        onClick={() => trackDownload(resource.id, resource.url)}
                      >
                        Open
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className={styles.modal} onClick={() => setShowSubmitModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Share a Resource</h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowSubmitModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={submitResource}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) =>
                    setNewResource({ ...newResource, title: e.target.value })
                  }
                  placeholder="Resource title"
                  required
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Type</label>
                  <select
                    value={newResource.type}
                    onChange={(e) =>
                      setNewResource({ ...newResource, type: e.target.value })
                    }
                  >
                    {resourceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select
                    value={newResource.category}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        category: e.target.value,
                      })
                    }
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>URL</label>
                <input
                  type="url"
                  value={newResource.url}
                  onChange={(e) =>
                    setNewResource({ ...newResource, url: e.target.value })
                  }
                  placeholder="https://..."
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={newResource.description}
                  onChange={(e) =>
                    setNewResource({
                      ...newResource,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe this resource..."
                  rows={3}
                />
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
                  Submit Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
