import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Custom hook for infinite scrolling with pagination
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {Object} options - Configuration options
 * @returns {Object} - Scroll state and handlers
 */
export default function useInfiniteScroll(fetchFunction, options = {}) {
  const {
    threshold = 100,
    initialPage = 1,
    pageSize = 20,
    dependencies = [],
  } = options;

  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Fetch data
  const fetchData = useCallback(
    async (pageNum, reset = false) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const result = await fetchFunction(pageNum, pageSize);

        setData((prev) => (reset ? result.items : [...prev, ...result.items]));
        setHasMore(result.hasMore ?? result.items.length === pageSize);
        setPage(pageNum);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    },
    [fetchFunction, pageSize, loading],
  );

  // Initial load
  useEffect(() => {
    fetchData(initialPage, true);
  }, [...dependencies, initialPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;

    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchData(page + 1);
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, page, threshold, fetchData]);

  // Reset data
  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    fetchData(initialPage, true);
  }, [initialPage, fetchData]);

  // Load more manually
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchData(page + 1);
    }
  }, [hasMore, loading, page, fetchData]);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMoreRef,
    reset,
    loadMore,
    page,
    setData,
  };
}
