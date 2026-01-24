import { useState, useEffect, useCallback } from "react";

/**
 * Breakpoint configuration
 */
const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/**
 * Custom hook for responsive design
 * @returns {Object} - Responsive state and utilities
 */
export default function useMediaQuery() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  // Debounced resize handler
  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Check if width is at least breakpoint
  const isMin = useCallback(
    (breakpoint) => {
      const minWidth = breakpoints[breakpoint] || breakpoint;
      return windowSize.width >= minWidth;
    },
    [windowSize.width],
  );

  // Check if width is at most breakpoint
  const isMax = useCallback(
    (breakpoint) => {
      const maxWidth = breakpoints[breakpoint] || breakpoint;
      return windowSize.width < maxWidth;
    },
    [windowSize.width],
  );

  // Check if width is between breakpoints
  const isBetween = useCallback(
    (min, max) => {
      const minWidth = breakpoints[min] || min;
      const maxWidth = breakpoints[max] || max;
      return windowSize.width >= minWidth && windowSize.width < maxWidth;
    },
    [windowSize.width],
  );

  // Get current breakpoint name
  const currentBreakpoint = (() => {
    const entries = Object.entries(breakpoints).reverse();
    for (const [name, width] of entries) {
      if (windowSize.width >= width) {
        return name;
      }
    }
    return "xs";
  })();

  // Custom media query check
  const matches = useCallback((query) => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, []);

  // Device type helpers
  const isMobile = windowSize.width < breakpoints.md;
  const isTablet =
    windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg;
  const isDesktop = windowSize.width >= breakpoints.lg;

  // Orientation
  const isLandscape = windowSize.width > windowSize.height;
  const isPortrait = windowSize.height > windowSize.width;

  // Touch device detection
  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  return {
    width: windowSize.width,
    height: windowSize.height,
    breakpoint: currentBreakpoint,
    isMin,
    isMax,
    isBetween,
    matches,
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    isTouchDevice,
    // Common breakpoint checks
    isXs: currentBreakpoint === "xs",
    isSm: isMin("sm"),
    isMd: isMin("md"),
    isLg: isMin("lg"),
    isXl: isMin("xl"),
    is2xl: isMin("2xl"),
  };
}

/**
 * Simple media query matcher hook
 * @param {string} query - CSS media query string
 * @returns {boolean} - Whether the query matches
 */
export function useMatchMedia(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }

    // Legacy browsers
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, [query]);

  return matches;
}
