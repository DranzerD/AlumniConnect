import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Cache storage
 */
const cache = new Map();

/**
 * Custom hook for data fetching with caching, loading states, and error handling
 * @param {string|Function} url - API endpoint or function that returns URL
 * @param {Object} options - Fetch options
 * @returns {Object} - Fetch state and controls
 */
export default function useFetch(url, options = {}) {
  const {
    method = "GET",
    body = null,
    headers = {},
    immediate = true,
    cacheKey = null,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    retries = 0,
    retryDelay = 1000,
    onSuccess = null,
    onError = null,
    transform = null,
    dependencies = [],
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const abortControllerRef = useRef(null);
  const retriesRef = useRef(0);

  // Get cached data
  const getCachedData = useCallback((key) => {
    if (!key || !cache.has(key)) return null;

    const cached = cache.get(key);
    if (Date.now() > cached.expiry) {
      cache.delete(key);
      return null;
    }

    return cached.data;
  }, []);

  // Set cached data
  const setCachedData = useCallback(
    (key, data) => {
      if (!key) return;

      cache.set(key, {
        data,
        expiry: Date.now() + cacheTTL,
      });
    },
    [cacheTTL],
  );

  // Fetch data
  const fetchData = useCallback(
    async (fetchUrl = url, fetchBody = body) => {
      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      // Check cache first
      const key = cacheKey || (typeof fetchUrl === "string" ? fetchUrl : null);
      const cachedData = getCachedData(key);
      if (cachedData && method === "GET") {
        setData(cachedData);
        setLoading(false);
        return cachedData;
      }

      setLoading(true);
      setError(null);

      try {
        const resolvedUrl =
          typeof fetchUrl === "function" ? fetchUrl() : fetchUrl;

        const fetchOptions = {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          signal: abortControllerRef.current.signal,
        };

        if (fetchBody && method !== "GET") {
          fetchOptions.body = JSON.stringify(fetchBody);
        }

        const response = await fetch(resolvedUrl, fetchOptions);
        setStatus(response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let result = await response.json();

        // Transform data if needed
        if (transform) {
          result = transform(result);
        }

        // Cache successful GET requests
        if (method === "GET" && key) {
          setCachedData(key, result);
        }

        setData(result);
        setLoading(false);
        retriesRef.current = 0;

        onSuccess?.(result);
        return result;
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        // Retry logic
        if (retriesRef.current < retries) {
          retriesRef.current++;
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * retriesRef.current),
          );
          return fetchData(fetchUrl, fetchBody);
        }

        setError(err.message);
        setLoading(false);
        onError?.(err);
        throw err;
      }
    },
    [
      url,
      method,
      body,
      headers,
      cacheKey,
      cacheTTL,
      retries,
      retryDelay,
      onSuccess,
      onError,
      transform,
      getCachedData,
      setCachedData,
    ],
  );

  // Initial fetch
  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, ...dependencies]);

  // Refetch function
  const refetch = useCallback(
    (newUrl, newBody) => {
      return fetchData(newUrl || url, newBody || body);
    },
    [fetchData, url, body],
  );

  // Mutate function for optimistic updates
  const mutate = useCallback(
    (newData) => {
      setData(typeof newData === "function" ? newData(data) : newData);

      // Update cache
      const key = cacheKey || (typeof url === "string" ? url : null);
      if (key) {
        setCachedData(
          key,
          typeof newData === "function" ? newData(data) : newData,
        );
      }
    },
    [data, cacheKey, url, setCachedData],
  );

  // Clear cache
  const clearCache = useCallback(
    (key) => {
      if (key) {
        cache.delete(key);
      } else {
        const cacheKeyToDelete =
          cacheKey || (typeof url === "string" ? url : null);
        if (cacheKeyToDelete) {
          cache.delete(cacheKeyToDelete);
        }
      }
    },
    [cacheKey, url],
  );

  return {
    data,
    loading,
    error,
    status,
    refetch,
    mutate,
    clearCache,
    isLoading: loading,
    isError: !!error,
    isSuccess: !loading && !error && data !== null,
  };
}

/**
 * POST request helper
 */
export function usePost(url, options = {}) {
  return useFetch(url, { ...options, method: "POST", immediate: false });
}

/**
 * PUT request helper
 */
export function usePut(url, options = {}) {
  return useFetch(url, { ...options, method: "PUT", immediate: false });
}

/**
 * DELETE request helper
 */
export function useDelete(url, options = {}) {
  return useFetch(url, { ...options, method: "DELETE", immediate: false });
}
