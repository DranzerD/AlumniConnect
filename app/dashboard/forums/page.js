"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./forums.module.css";

export default function ForumsPage() {
  const [discussions, setDiscussions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [search, setSearch] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  const categoryOptions = [
    { id: "general", label: "General", icon: "💬" },
    { id: "career", label: "Career Advice", icon: "💼" },
    { id: "technical", label: "Technical", icon: "💻" },
    { id: "networking", label: "Networking", icon: "🤝" },
    { id: "resources", label: "Resources", icon: "📚" },
    { id: "announcements", label: "Announcements", icon: "📢" },
  ];

  useEffect(() => {
    fetchDiscussions();
  }, [activeCategory, sort, search]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: activeCategory,
        sort,
        search,
        limit: "20",
      });
      const response = await fetch(`/api/forums?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDiscussions(data.discussions || []);
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
    } finally {
      setLoading(false);
    }
  };

  const createDiscussion = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/forums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (response.ok) {
        setShowNewPost(false);
        setNewPost({ title: "", content: "", category: "general", tags: [] });
        fetchDiscussions();
      }
    } catch (error) {
      console.error("Failed to create discussion:", error);
    }
  };

  const addTag = () => {
    if (
      tagInput &&
      !newPost.tags.includes(tagInput) &&
      newPost.tags.length < 5
    ) {
      setNewPost({ ...newPost, tags: [...newPost.tags, tagInput] });
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setNewPost({ ...newPost, tags: newPost.tags.filter((t) => t !== tag) });
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Discussion Forums</h1>
          <p className={styles.subtitle}>
            Connect, share knowledge, and learn from fellow alumni
          </p>
        </div>
        <button
          className={styles.newPostButton}
          onClick={() => setShowNewPost(true)}
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
          New Discussion
        </button>
      </div>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h3>Categories</h3>
            <ul className={styles.categoryList}>
              <li>
                <button
                  className={`${styles.categoryItem} ${
                    activeCategory === "all" ? styles.active : ""
                  }`}
                  onClick={() => setActiveCategory("all")}
                >
                  <span className={styles.categoryIcon}>📋</span>
                  All Discussions
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
                    <span className={styles.categoryIcon}>{cat.icon}</span>
                    {cat.label}
                    <span className={styles.categoryCount}>
                      {categories.find((c) => c.category === cat.id)?.count ||
                        0}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.sidebarSection}>
            <h3>Popular Tags</h3>
            <div className={styles.tagCloud}>
              {[
                "career",
                "jobs",
                "interview",
                "salary",
                "remote",
                "startup",
                "advice",
                "mentorship",
              ].map((tag) => (
                <span key={tag} className={styles.tagItem}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
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
                placeholder="Search discussions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.sortDropdown}>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
                <option value="unanswered">Unanswered</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingList}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : discussions.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>💬</div>
              <h3>No discussions found</h3>
              <p>Be the first to start a discussion!</p>
              <button
                className={styles.emptyButton}
                onClick={() => setShowNewPost(true)}
              >
                Start Discussion
              </button>
            </div>
          ) : (
            <div className={styles.discussionList}>
              {discussions.map((discussion) => (
                <Link
                  key={discussion.id}
                  href={`/dashboard/forums/${discussion.id}`}
                  className={`${styles.discussionCard} ${
                    discussion.is_pinned ? styles.pinned : ""
                  }`}
                >
                  {discussion.is_pinned && (
                    <span className={styles.pinnedBadge}>📌 Pinned</span>
                  )}
                  <div className={styles.discussionHeader}>
                    <img
                      src={discussion.author_avatar || "/default-avatar.png"}
                      alt=""
                      className={styles.authorAvatar}
                    />
                    <div className={styles.authorInfo}>
                      <span className={styles.authorName}>
                        {discussion.author_name}
                      </span>
                      <span className={styles.postTime}>
                        {formatTimeAgo(discussion.created_at)}
                      </span>
                    </div>
                    {discussion.is_solved && (
                      <span className={styles.solvedBadge}>✅ Solved</span>
                    )}
                  </div>
                  <h3 className={styles.discussionTitle}>{discussion.title}</h3>
                  <p className={styles.discussionExcerpt}>
                    {discussion.content.substring(0, 200)}
                    {discussion.content.length > 200 ? "..." : ""}
                  </p>
                  <div className={styles.discussionFooter}>
                    <span className={styles.category}>
                      {
                        categoryOptions.find(
                          (c) => c.id === discussion.category,
                        )?.icon
                      }{" "}
                      {discussion.category}
                    </span>
                    <div className={styles.stats}>
                      <span>👁 {discussion.view_count}</span>
                      <span>💬 {discussion.reply_count}</span>
                    </div>
                  </div>
                  {discussion.tags && discussion.tags.length > 0 && (
                    <div className={styles.discussionTags}>
                      {discussion.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* New Discussion Modal */}
      {showNewPost && (
        <div className={styles.modal} onClick={() => setShowNewPost(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Start a New Discussion</h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowNewPost(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={createDiscussion}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  placeholder="What's your question or topic?"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Category</label>
                <select
                  value={newPost.category}
                  onChange={(e) =>
                    setNewPost({ ...newPost, category: e.target.value })
                  }
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  placeholder="Share your thoughts, questions, or insights..."
                  rows={6}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tags (optional)</label>
                <div className={styles.tagInputWrapper}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    placeholder="Add tags..."
                  />
                  <button type="button" onClick={addTag}>
                    Add
                  </button>
                </div>
                <div className={styles.selectedTags}>
                  {newPost.tags.map((tag) => (
                    <span key={tag} className={styles.selectedTag}>
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowNewPost(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Post Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
