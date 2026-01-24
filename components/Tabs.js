"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Tabs.module.css";

export default function Tabs({
  tabs,
  defaultTab = 0,
  onChange,
  variant = "default",
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(defaultTab);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabRefs = useRef([]);

  useEffect(() => {
    updateIndicator();
  }, [activeIndex]);

  const updateIndicator = () => {
    const activeTab = tabRefs.current[activeIndex];
    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    }
  };

  const handleTabClick = (index) => {
    setActiveIndex(index);
    onChange?.(index, tabs[index]);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "ArrowRight") {
      const nextIndex = (index + 1) % tabs.length;
      tabRefs.current[nextIndex]?.focus();
      handleTabClick(nextIndex);
    } else if (e.key === "ArrowLeft") {
      const prevIndex = (index - 1 + tabs.length) % tabs.length;
      tabRefs.current[prevIndex]?.focus();
      handleTabClick(prevIndex);
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div
        className={`${styles.tabList} ${styles[variant]}`}
        role="tablist"
        aria-orientation="horizontal"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id || index}
            ref={(el) => (tabRefs.current[index] = el)}
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls={`panel-${tab.id || index}`}
            tabIndex={activeIndex === index ? 0 : -1}
            className={`${styles.tab} ${
              activeIndex === index ? styles.active : ""
            }`}
            onClick={() => handleTabClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={tab.disabled}
          >
            {tab.icon && <span className={styles.icon}>{tab.icon}</span>}
            <span className={styles.label}>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={styles.badge}>{tab.badge}</span>
            )}
          </button>
        ))}
        {variant === "default" && (
          <div className={styles.indicator} style={indicatorStyle} />
        )}
      </div>

      <div className={styles.panels}>
        {tabs.map((tab, index) => (
          <div
            key={tab.id || index}
            id={`panel-${tab.id || index}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id || index}`}
            hidden={activeIndex !== index}
            className={styles.panel}
          >
            {activeIndex === index && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
