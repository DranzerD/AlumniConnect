"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./SearchAutocomplete.module.css";
import { useDebounce } from "@/hooks/useDebounce";

export default function SearchAutocomplete({
  placeholder = "Search...",
  onSearch,
  onSelect,
  fetchSuggestions,
  minChars = 2,
  debounceMs = 300,
  maxSuggestions = 8,
  showRecentSearches = true,
  recentSearchesKey = "recentSearches",
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    if (showRecentSearches) {
      const stored = localStorage.getItem(recentSearchesKey);
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    }
  }, [recentSearchesKey, showRecentSearches]);

  useEffect(() => {
    const fetchData = async () => {
      if (debouncedQuery.length < minChars) {
        setSuggestions([]);
        return;
      }

      if (fetchSuggestions) {
        setLoading(true);
        try {
          const results = await fetchSuggestions(debouncedQuery);
          setSuggestions(results.slice(0, maxSuggestions));
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedQuery, fetchSuggestions, minChars, maxSuggestions]);

  const handleClickOutside = useCallback((e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const saveRecentSearch = (searchTerm) => {
    if (!showRecentSearches || !searchTerm.trim()) return;

    const updated = [
      searchTerm,
      ...recentSearches.filter((s) => s !== searchTerm),
    ].slice(0, 5);

    setRecentSearches(updated);
    localStorage.setItem(recentSearchesKey, JSON.stringify(updated));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      onSearch?.(query.trim());
      setIsOpen(false);
    }
  };

  const handleSelect = (item) => {
    const value = typeof item === "string" ? item : item.label || item.name;
    setQuery(value);
    saveRecentSearch(value);
    onSelect?.(item);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    const items = [...(suggestions.length ? suggestions : recentSearches)];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, items.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        if (activeIndex >= 0 && items[activeIndex]) {
          e.preventDefault();
          handleSelect(items[activeIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(recentSearchesKey);
  };

  const showDropdown =
    isOpen &&
    (suggestions.length > 0 ||
      (showRecentSearches &&
        recentSearches.length > 0 &&
        query.length < minChars));

  return (
    <div className={styles.container} ref={containerRef}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrapper}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={styles.input}
          />
          {loading && <div className={styles.loader} />}
          {query && !loading && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                inputRef.current?.focus();
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {showDropdown && (
        <div className={styles.dropdown}>
          {suggestions.length > 0 ? (
            <ul className={styles.list}>
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  className={`${styles.item} ${activeIndex === index ? styles.active : ""}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <svg
                    className={styles.itemIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <span className={styles.itemText}>
                    {typeof item === "string" ? item : item.label || item.name}
                  </span>
                  {item.type && (
                    <span className={styles.itemType}>{item.type}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <>
              <div className={styles.sectionHeader}>
                <span>Recent Searches</span>
                <button
                  className={styles.clearRecent}
                  onClick={clearRecentSearches}
                >
                  Clear
                </button>
              </div>
              <ul className={styles.list}>
                {recentSearches.map((item, index) => (
                  <li
                    key={index}
                    className={`${styles.item} ${activeIndex === index ? styles.active : ""}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <svg
                      className={styles.itemIcon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className={styles.itemText}>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
