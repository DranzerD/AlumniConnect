"use client";

import { useState, useCallback, useRef } from "react";
import styles from "./SearchInput.module.css";

/**
 * Advanced Search Input Component with autocomplete
 * @param {Object} props - Component props
 */
export default function SearchInput({
  value = "",
  onChange,
  onSearch,
  placeholder = "Search...",
  suggestions = [],
  onSuggestionSelect,
  loading = false,
  showClear = true,
  size = "md",
  variant = "default",
  disabled = false,
  autoFocus = false,
  debounce = 300,
  icon = "🔍",
  className = "",
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      onChange?.(newValue);

      // Debounced search
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onSearch?.(newValue);
      }, debounce);
    },
    [onChange, onSearch, debounce],
  );

  const handleKeyDown = (e) => {
    if (!suggestions.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          onSuggestionSelect?.(suggestions[selectedIndex]);
          setSelectedIndex(-1);
        } else {
          onSearch?.(value);
        }
        break;
      case "Escape":
        setIsFocused(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    onChange?.("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionSelect?.(suggestion);
    setIsFocused(false);
    setSelectedIndex(-1);
  };

  const showSuggestions = isFocused && suggestions.length > 0;

  return (
    <div
      className={`${styles.container} ${styles[size]} ${styles[variant]} ${className}`}
    >
      <div
        className={`${styles.inputWrapper} ${isFocused ? styles.focused : ""}`}
      >
        <span className={styles.icon}>{icon}</span>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={styles.input}
          role="combobox"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        {loading && (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
          </div>
        )}

        {showClear && value && !loading && (
          <button
            className={styles.clearBtn}
            onClick={handleClear}
            type="button"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {showSuggestions && (
        <ul className={styles.suggestions} role="listbox">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`${styles.suggestion} ${selectedIndex === index ? styles.selected : ""}`}
              onClick={() => handleSuggestionClick(suggestion)}
              role="option"
              aria-selected={selectedIndex === index}
            >
              {typeof suggestion === "object" ? (
                <>
                  {suggestion.icon && (
                    <span className={styles.suggestionIcon}>
                      {suggestion.icon}
                    </span>
                  )}
                  <div className={styles.suggestionContent}>
                    <span className={styles.suggestionLabel}>
                      {suggestion.label}
                    </span>
                    {suggestion.description && (
                      <span className={styles.suggestionDesc}>
                        {suggestion.description}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                suggestion
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Filter Pills Component - for active search filters
 */
export function FilterPills({ filters = [], onRemove, onClearAll }) {
  if (filters.length === 0) return null;

  return (
    <div className={styles.filterPills}>
      {filters.map((filter, index) => (
        <span key={index} className={styles.filterPill}>
          {filter.label}: {filter.value}
          <button onClick={() => onRemove(index)}>×</button>
        </span>
      ))}
      {filters.length > 1 && (
        <button className={styles.clearAllBtn} onClick={onClearAll}>
          Clear all
        </button>
      )}
    </div>
  );
}
