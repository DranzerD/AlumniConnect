"use client";

import { useState, useCallback, useRef } from "react";

/**
 * useAsync - Advanced async operation hook with loading, error, and success states
 * Perfect for API calls, form submissions, and any async operations
 */
export function useAsync(asyncFunction, immediate = false) {
  const [status, setStatus] = useState("idle"); // idle, pending, success, error
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const execute = useCallback(
    async (...args) => {
      setStatus("pending");
      setData(null);
      setError(null);

      try {
        const result = await asyncFunction(...args);

        if (mountedRef.current) {
          setData(result);
          setStatus("success");
        }

        return result;
      } catch (err) {
        if (mountedRef.current) {
          setError(err);
          setStatus("error");
        }

        throw err;
      }
    },
    [asyncFunction],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setData(null);
    setError(null);
  }, []);

  // Execute immediately if requested
  useState(() => {
    if (immediate) {
      execute();
    }
    return () => {
      mountedRef.current = false;
    };
  });

  return {
    execute,
    reset,
    status,
    data,
    error,
    isIdle: status === "idle",
    isPending: status === "pending",
    isSuccess: status === "success",
    isError: status === "error",
  };
}

/**
 * usePagination - Pagination state management
 */
export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const nextPage = useCallback(() => {
    if (hasNext) setPage((p) => p + 1);
  }, [hasNext]);

  const prevPage = useCallback(() => {
    if (hasPrev) setPage((p) => p - 1);
  }, [hasPrev]);

  const goToPage = useCallback(
    (pageNum) => {
      const validPage = Math.max(1, Math.min(pageNum, totalPages));
      setPage(validPage);
    },
    [totalPages],
  );

  const reset = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
    goToPage,
    reset,
  };
}

/**
 * useToggle - Boolean toggle state
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, { toggle, setTrue, setFalse, setValue }];
}

/**
 * usePrevious - Get the previous value of a state
 */
export function usePrevious(value) {
  const ref = useRef();

  useState(() => {
    ref.current = value;
  });

  return ref.current;
}

/**
 * useLocalStorageState - useState but persisted to localStorage
 */
export function useLocalStorageState(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage:", error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error("Error writing localStorage:", error);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error("Error removing localStorage:", error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * useInterval - Declarative setInterval
 */
export function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  useState(() => {
    savedCallback.current = callback;
  });

  useState(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  });
}

/**
 * useTimeout - Declarative setTimeout
 */
export function useTimeout(callback, delay) {
  const savedCallback = useRef(callback);

  useState(() => {
    savedCallback.current = callback;
  });

  useState(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  });
}

/**
 * useWindowSize - Track window dimensions
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useState(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  return size;
}

/**
 * useOnlineStatus - Track online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useState(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  });

  return isOnline;
}

/**
 * useCopyToClipboard - Copy text to clipboard
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const copy = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      setError(new Error("Clipboard not supported"));
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);

      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);

      return true;
    } catch (err) {
      setError(err);
      setCopied(false);
      return false;
    }
  }, []);

  return { copy, copied, error };
}

/**
 * useDocumentTitle - Set document title
 */
export function useDocumentTitle(title, restoreOnUnmount = false) {
  const previousTitle = useRef(
    typeof document !== "undefined" ? document.title : "",
  );

  useState(() => {
    if (typeof document !== "undefined") {
      document.title = title;
    }

    return () => {
      if (restoreOnUnmount && typeof document !== "undefined") {
        document.title = previousTitle.current;
      }
    };
  });
}

/**
 * useHover - Track hover state
 */
export function useHover() {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  useState(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener("mouseenter", handleMouseEnter);
      node.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        node.removeEventListener("mouseenter", handleMouseEnter);
        node.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  });

  return [ref, isHovered];
}

/**
 * useFocus - Track focus state
 */
export function useFocus() {
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef(null);

  useState(() => {
    const node = ref.current;
    if (node) {
      const handleFocus = () => setIsFocused(true);
      const handleBlur = () => setIsFocused(false);

      node.addEventListener("focus", handleFocus);
      node.addEventListener("blur", handleBlur);

      return () => {
        node.removeEventListener("focus", handleFocus);
        node.removeEventListener("blur", handleBlur);
      };
    }
  });

  const focus = useCallback(() => ref.current?.focus(), []);
  const blur = useCallback(() => ref.current?.blur(), []);

  return { ref, isFocused, focus, blur };
}

export default {
  useAsync,
  usePagination,
  useToggle,
  usePrevious,
  useLocalStorageState,
  useInterval,
  useTimeout,
  useWindowSize,
  useOnlineStatus,
  useCopyToClipboard,
  useDocumentTitle,
  useHover,
  useFocus,
};
