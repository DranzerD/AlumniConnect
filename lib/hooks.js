"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./client";

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// Loads a JSON endpoint and exposes { data, error, loading, reload }.
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: "", loading: true });

  const reload = useCallback(() => {
    if (!path) return Promise.resolve();
    return api(path)
      .then((data) => setState({ data, error: "", loading: false }))
      .catch((err) => setState((s) => ({ ...s, error: err.message, loading: false })));
  }, [path]);

  useEffect(() => {
    setState((s) => ({ ...s, loading: true }));
    reload();
  }, [reload]);

  return { ...state, reload };
}
