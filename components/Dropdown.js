"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Dropdown.module.css";

export default function Dropdown({
  trigger,
  children,
  position = "bottom-left",
  closeOnSelect = true,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSelect = () => {
    if (closeOnSelect) {
      setIsOpen(false);
    }
  };

  return (
    <div className={`${styles.dropdown} ${className}`} ref={dropdownRef}>
      <div
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`${styles.menu} ${styles[position]}`}
          role="menu"
          onClick={handleSelect}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  icon,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      className={`${styles.item} ${danger ? styles.danger : ""} ${
        disabled ? styles.disabled : ""
      }`}
      onClick={disabled ? undefined : onClick}
      role="menuitem"
      disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className={styles.divider} role="separator" />;
}

export function DropdownHeader({ children }) {
  return <div className={styles.header}>{children}</div>;
}
