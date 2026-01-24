import { useEffect, useRef } from "react";

/**
 * Custom hook to detect clicks outside of a component
 * Useful for dropdowns, modals, and popups
 * @param {Function} handler - Callback function to run on outside click
 * @param {boolean} enabled - Whether the hook is active
 * @returns {Object} - Ref to attach to the component
 */
export default function useClickOutside(handler, enabled = true) {
  const ref = useRef(null);
  const handlerRef = useRef(handler);

  // Update handler ref on each render
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handlerRef.current(event);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handlerRef.current(event);
      }
    };

    // Add event listeners
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [enabled]);

  return ref;
}
