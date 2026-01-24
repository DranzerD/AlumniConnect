"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * useAccessibility - Comprehensive accessibility utilities hook
 * Provides keyboard navigation, focus management, and screen reader announcements
 */
export function useAccessibility() {
  const announcerRef = useRef(null);

  // Create screen reader announcer on mount
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Check if announcer already exists
    let announcer = document.getElementById("sr-announcer");

    if (!announcer) {
      announcer = document.createElement("div");
      announcer.id = "sr-announcer";
      announcer.setAttribute("aria-live", "polite");
      announcer.setAttribute("aria-atomic", "true");
      announcer.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(announcer);
    }

    announcerRef.current = announcer;

    return () => {
      // Don't remove on unmount as other components may use it
    };
  }, []);

  // Announce to screen readers
  const announce = useCallback((message, priority = "polite") => {
    if (!announcerRef.current) return;

    announcerRef.current.setAttribute("aria-live", priority);
    announcerRef.current.textContent = "";

    // Force browser to announce by setting text in next tick
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = message;
      }
    }, 100);
  }, []);

  // Announce assertively (interrupts current announcements)
  const announceAssertive = useCallback(
    (message) => {
      announce(message, "assertive");
    },
    [announce],
  );

  return {
    announce,
    announceAssertive,
  };
}

/**
 * useFocusTrap - Trap focus within a container
 */
export function useFocusTrap(isActive = true) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = getFocusableElements(container);

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement.focus();

    const handleKeyDown = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * useFocusReturn - Return focus to trigger element when closing
 */
export function useFocusReturn(isOpen) {
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current) {
      // Return focus when closed
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  return triggerRef;
}

/**
 * useArrowNavigation - Navigate with arrow keys
 */
export function useArrowNavigation(options = {}) {
  const {
    orientation = "vertical", // 'vertical', 'horizontal', 'both'
    wrap = true,
    onSelect = () => {},
    itemSelector = "[data-focusable]",
  } = options;

  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const handleKeyDown = (e) => {
      const items = Array.from(container.querySelectorAll(itemSelector));
      const currentIndex = items.indexOf(document.activeElement);

      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (e.key) {
        case "ArrowUp":
          if (orientation !== "horizontal") {
            e.preventDefault();
            nextIndex = currentIndex - 1;
          }
          break;
        case "ArrowDown":
          if (orientation !== "horizontal") {
            e.preventDefault();
            nextIndex = currentIndex + 1;
          }
          break;
        case "ArrowLeft":
          if (orientation !== "vertical") {
            e.preventDefault();
            nextIndex = currentIndex - 1;
          }
          break;
        case "ArrowRight":
          if (orientation !== "vertical") {
            e.preventDefault();
            nextIndex = currentIndex + 1;
          }
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = items.length - 1;
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          onSelect(currentIndex, items[currentIndex]);
          return;
        default:
          return;
      }

      // Handle wrapping
      if (wrap) {
        if (nextIndex < 0) nextIndex = items.length - 1;
        if (nextIndex >= items.length) nextIndex = 0;
      } else {
        nextIndex = Math.max(0, Math.min(nextIndex, items.length - 1));
      }

      items[nextIndex]?.focus();
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [orientation, wrap, onSelect, itemSelector]);

  return containerRef;
}

/**
 * useSkipLinks - Generate skip links for page navigation
 */
export function useSkipLinks(links = []) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Default skip links
    const defaultLinks = [
      { id: "main-content", label: "Skip to main content" },
      { id: "main-navigation", label: "Skip to navigation" },
    ];

    const allLinks = [...defaultLinks, ...links];

    // Create skip links container if it doesn't exist
    let container = document.getElementById("skip-links");

    if (!container) {
      container = document.createElement("div");
      container.id = "skip-links";
      container.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        z-index: 9999;
      `;
      document.body.insertBefore(container, document.body.firstChild);
    }

    // Clear existing links
    container.innerHTML = "";

    // Create skip links
    allLinks.forEach(({ id, label }) => {
      const target = document.getElementById(id);
      if (!target) return;

      const link = document.createElement("a");
      link.href = `#${id}`;
      link.textContent = label;
      link.className = "skip-link";
      link.style.cssText = `
        position: absolute;
        left: -9999px;
        padding: 8px 16px;
        background: #2563eb;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 600;
      `;

      link.addEventListener("focus", () => {
        link.style.left = "8px";
        link.style.top = "8px";
      });

      link.addEventListener("blur", () => {
        link.style.left = "-9999px";
      });

      container.appendChild(link);
    });
  }, [links]);
}

/**
 * useReducedMotion - Check if user prefers reduced motion
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

// Helper function to get focusable elements
function getFocusableElements(container) {
  const focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  return Array.from(container.querySelectorAll(focusableSelectors)).filter(
    (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
  );
}

// Import useState for useReducedMotion
import { useState } from "react";

export default {
  useAccessibility,
  useFocusTrap,
  useFocusReturn,
  useArrowNavigation,
  useSkipLinks,
  useReducedMotion,
};
