"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./InfiniteScroll.module.css";
import LoadingSkeleton from "./LoadingSkeleton";

export default function InfiniteScroll({
  loadMore,
  hasMore = true,
  loader,
  endMessage = "No more items to load",
  threshold = 100,
  children,
}) {
  const [loading, setLoading] = useState(false);

  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      setLoading(true);
      loadMore().finally(() => setLoading(false));
    }
  }, [loading, hasMore, loadMore, threshold]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className={styles.container}>
      {children}

      {loading && (
        <div className={styles.loader}>
          {loader || (
            <div className={styles.defaultLoader}>
              <div className={styles.spinner}></div>
              <span>Loading more...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && (
        <div className={styles.endMessage}>
          {typeof endMessage === "string" ? <p>{endMessage}</p> : endMessage}
        </div>
      )}
    </div>
  );
}

// Virtualized List for performance
export function VirtualizedList({
  items,
  itemHeight,
  renderItem,
  containerHeight = 400,
  overscan = 3,
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan,
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      item: items[i],
      index: i,
      style: {
        position: "absolute",
        top: i * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
      },
    });
  }

  return (
    <div
      className={styles.virtualizedContainer}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        className={styles.virtualizedContent}
        style={{ height: totalHeight }}
      >
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Masonry Grid Layout
export function MasonryGrid({ items, columns = 3, gap = 16, renderItem }) {
  const columnItems = Array.from({ length: columns }, () => []);

  items.forEach((item, index) => {
    const columnIndex = index % columns;
    columnItems[columnIndex].push({ item, index });
  });

  return (
    <div className={styles.masonryContainer} style={{ gap }}>
      {columnItems.map((column, colIndex) => (
        <div key={colIndex} className={styles.masonryColumn} style={{ gap }}>
          {column.map(({ item, index }) => (
            <div key={index} className={styles.masonryItem}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
