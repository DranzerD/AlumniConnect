import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Custom hook for accessible keyboard navigation
 * Useful for lists, menus, and complex interactive components
 * @param {Object} options - Configuration options
 * @returns {Object} - Navigation state and handlers
 */
export default function useKeyboardNavigation(options = {}) {
  const {
    itemCount = 0,
    onSelect = null,
    onEscape = null,
    orientation = "vertical", // vertical, horizontal, grid
    gridColumns = 1,
    loop = true,
    initialIndex = -1,
    typeaheadDelay = 500,
  } = options;

  const [focusedIndex, setFocusedIndex] = useState(initialIndex);
  const [typeahead, setTypeahead] = useState("");
  const typeaheadTimeoutRef = useRef(null);
  const itemsRef = useRef([]);

  // Clear typeahead after delay
  useEffect(() => {
    if (typeahead) {
      typeaheadTimeoutRef.current = setTimeout(() => {
        setTypeahead("");
      }, typeaheadDelay);
    }

    return () => {
      if (typeaheadTimeoutRef.current) {
        clearTimeout(typeaheadTimeoutRef.current);
      }
    };
  }, [typeahead, typeaheadDelay]);

  // Navigation helpers
  const navigateNext = useCallback(() => {
    setFocusedIndex((prev) => {
      if (prev >= itemCount - 1) {
        return loop ? 0 : prev;
      }
      return prev + 1;
    });
  }, [itemCount, loop]);

  const navigatePrev = useCallback(() => {
    setFocusedIndex((prev) => {
      if (prev <= 0) {
        return loop ? itemCount - 1 : 0;
      }
      return prev - 1;
    });
  }, [itemCount, loop]);

  const navigateDown = useCallback(() => {
    if (orientation === "grid") {
      setFocusedIndex((prev) => {
        const next = prev + gridColumns;
        if (next >= itemCount) {
          return loop ? next % itemCount : prev;
        }
        return next;
      });
    } else {
      navigateNext();
    }
  }, [orientation, gridColumns, itemCount, loop, navigateNext]);

  const navigateUp = useCallback(() => {
    if (orientation === "grid") {
      setFocusedIndex((prev) => {
        const next = prev - gridColumns;
        if (next < 0) {
          return loop ? itemCount + next : prev;
        }
        return next;
      });
    } else {
      navigatePrev();
    }
  }, [orientation, gridColumns, itemCount, loop, navigatePrev]);

  const navigateFirst = useCallback(() => {
    setFocusedIndex(0);
  }, []);

  const navigateLast = useCallback(() => {
    setFocusedIndex(itemCount - 1);
  }, [itemCount]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e, itemLabels = []) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          navigateDown();
          break;
        case "ArrowUp":
          e.preventDefault();
          navigateUp();
          break;
        case "ArrowRight":
          e.preventDefault();
          if (orientation === "horizontal" || orientation === "grid") {
            navigateNext();
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (orientation === "horizontal" || orientation === "grid") {
            navigatePrev();
          }
          break;
        case "Home":
          e.preventDefault();
          navigateFirst();
          break;
        case "End":
          e.preventDefault();
          navigateLast();
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex >= 0 && onSelect) {
            onSelect(focusedIndex);
          }
          break;
        case "Escape":
          e.preventDefault();
          onEscape?.();
          break;
        default:
          // Typeahead search
          if (e.key.length === 1 && itemLabels.length > 0) {
            const newTypeahead = typeahead + e.key.toLowerCase();
            setTypeahead(newTypeahead);

            // Find matching item
            const matchIndex = itemLabels.findIndex((label) =>
              label.toLowerCase().startsWith(newTypeahead),
            );

            if (matchIndex !== -1) {
              setFocusedIndex(matchIndex);
            }
          }
      }
    },
    [
      orientation,
      focusedIndex,
      typeahead,
      navigateDown,
      navigateUp,
      navigateNext,
      navigatePrev,
      navigateFirst,
      navigateLast,
      onSelect,
      onEscape,
    ],
  );

  // Register item ref
  const registerItem = useCallback((index, element) => {
    itemsRef.current[index] = element;
  }, []);

  // Focus item when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0 && itemsRef.current[focusedIndex]) {
      itemsRef.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  // Get item props helper
  const getItemProps = useCallback(
    (index, label = "") => ({
      tabIndex: focusedIndex === index ? 0 : -1,
      "aria-selected": focusedIndex === index,
      ref: (el) => registerItem(index, el),
      onFocus: () => setFocusedIndex(index),
      onClick: () => {
        setFocusedIndex(index);
        onSelect?.(index);
      },
    }),
    [focusedIndex, registerItem, onSelect],
  );

  // Container props helper
  const getContainerProps = useCallback(
    (itemLabels = []) => ({
      role: "listbox",
      tabIndex: 0,
      onKeyDown: (e) => handleKeyDown(e, itemLabels),
      "aria-activedescendant":
        focusedIndex >= 0 ? `item-${focusedIndex}` : undefined,
    }),
    [handleKeyDown, focusedIndex],
  );

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    getItemProps,
    getContainerProps,
    navigateNext,
    navigatePrev,
    navigateFirst,
    navigateLast,
  };
}
