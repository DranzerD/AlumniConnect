"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * useAnalytics - Custom hook for tracking user interactions and page views
 * Provides analytics functionality for the application
 */
export function useAnalytics() {
  const [sessionId] = useState(() => generateSessionId());
  const [pageViewCount, setPageViewCount] = useState(0);

  // Track page view
  const trackPageView = useCallback(
    (page, metadata = {}) => {
      setPageViewCount((prev) => prev + 1);

      const event = {
        type: "page_view",
        page,
        sessionId,
        timestamp: new Date().toISOString(),
        ...metadata,
        userAgent: typeof window !== "undefined" ? navigator.userAgent : null,
        referrer: typeof document !== "undefined" ? document.referrer : null,
      };

      sendAnalytics(event);
    },
    [sessionId],
  );

  // Track custom event
  const trackEvent = useCallback(
    (eventName, properties = {}) => {
      const event = {
        type: "event",
        name: eventName,
        sessionId,
        timestamp: new Date().toISOString(),
        properties,
      };

      sendAnalytics(event);
    },
    [sessionId],
  );

  // Track user action (click, submit, etc.)
  const trackAction = useCallback(
    (action, target, metadata = {}) => {
      const event = {
        type: "action",
        action,
        target,
        sessionId,
        timestamp: new Date().toISOString(),
        ...metadata,
      };

      sendAnalytics(event);
    },
    [sessionId],
  );

  // Track timing (performance metrics)
  const trackTiming = useCallback(
    (category, variable, duration, label = "") => {
      const event = {
        type: "timing",
        category,
        variable,
        duration,
        label,
        sessionId,
        timestamp: new Date().toISOString(),
      };

      sendAnalytics(event);
    },
    [sessionId],
  );

  // Track errors
  const trackError = useCallback(
    (error, context = {}) => {
      const event = {
        type: "error",
        message: error.message,
        stack: error.stack,
        sessionId,
        timestamp: new Date().toISOString(),
        url: typeof window !== "undefined" ? window.location.href : null,
        context,
      };

      sendAnalytics(event);
    },
    [sessionId],
  );

  return {
    sessionId,
    pageViewCount,
    trackPageView,
    trackEvent,
    trackAction,
    trackTiming,
    trackError,
  };
}

/**
 * usePageTracking - Automatically track page views
 */
export function usePageTracking(pageName) {
  const { trackPageView, trackTiming } = useAnalytics();
  const [loadTime, setLoadTime] = useState(null);

  useEffect(() => {
    const startTime = performance.now();

    trackPageView(pageName);

    // Track page load time after component mounts
    const timer = setTimeout(() => {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      setLoadTime(duration);
      trackTiming("page_load", pageName, duration);
    }, 0);

    return () => clearTimeout(timer);
  }, [pageName, trackPageView, trackTiming]);

  return { loadTime };
}

/**
 * useEventTracking - Create tracked event handlers
 */
export function useEventTracking() {
  const { trackAction } = useAnalytics();

  const createClickHandler = useCallback(
    (eventName, metadata = {}) => {
      return (event) => {
        trackAction("click", eventName, {
          ...metadata,
          x: event?.clientX,
          y: event?.clientY,
        });
      };
    },
    [trackAction],
  );

  const createSubmitHandler = useCallback(
    (formName, metadata = {}) => {
      return (formData) => {
        trackAction("submit", formName, {
          ...metadata,
          fieldCount: Object.keys(formData || {}).length,
        });
      };
    },
    [trackAction],
  );

  return {
    createClickHandler,
    createSubmitHandler,
    trackAction,
  };
}

/**
 * usePerformanceMetrics - Track performance metrics
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState({
    fcp: null, // First Contentful Paint
    lcp: null, // Largest Contentful Paint
    fid: null, // First Input Delay
    cls: null, // Cumulative Layout Shift
    ttfb: null, // Time to First Byte
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.performance) return;

    // Get navigation timing
    const navigation = performance.getEntriesByType("navigation")[0];
    if (navigation) {
      setMetrics((prev) => ({
        ...prev,
        ttfb: Math.round(navigation.responseStart - navigation.requestStart),
      }));
    }

    // Observe web vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case "paint":
            if (entry.name === "first-contentful-paint") {
              setMetrics((prev) => ({
                ...prev,
                fcp: Math.round(entry.startTime),
              }));
            }
            break;
          case "largest-contentful-paint":
            setMetrics((prev) => ({
              ...prev,
              lcp: Math.round(entry.startTime),
            }));
            break;
          case "first-input":
            setMetrics((prev) => ({
              ...prev,
              fid: Math.round(entry.processingStart - entry.startTime),
            }));
            break;
          case "layout-shift":
            if (!entry.hadRecentInput) {
              setMetrics((prev) => ({
                ...prev,
                cls: (prev.cls || 0) + entry.value,
              }));
            }
            break;
        }
      }
    });

    try {
      observer.observe({
        entryTypes: [
          "paint",
          "largest-contentful-paint",
          "first-input",
          "layout-shift",
        ],
      });
    } catch (e) {
      // Some browsers don't support all entry types
    }

    return () => observer.disconnect();
  }, []);

  return metrics;
}

// Helper functions
function generateSessionId() {
  return (
    "sess_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  );
}

async function sendAnalytics(event) {
  // In development, just log
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", event);
    return;
  }

  // In production, send to analytics endpoint
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      keepalive: true, // Ensures request completes even if page unloads
    });
  } catch (error) {
    console.error("Analytics error:", error);
  }
}

export default useAnalytics;
