"use client";

import { useState } from "react";
import styles from "./Accordion.module.css";

export default function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className = "",
}) {
  const [openItems, setOpenItems] = useState(new Set(defaultOpen));

  const toggleItem = (index) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(index);
      }

      return newSet;
    });
  };

  return (
    <div className={`${styles.accordion} ${className}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.id || index}
          item={item}
          isOpen={openItems.has(index)}
          onToggle={() => toggleItem(index)}
        />
      ))}
    </div>
  );
}

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className={`${styles.item} ${isOpen ? styles.open : ""}`}>
      <button
        className={styles.header}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${item.id}`}
      >
        <div className={styles.headerContent}>
          {item.icon && <span className={styles.icon}>{item.icon}</span>}
          <span className={styles.title}>{item.title}</span>
          {item.subtitle && (
            <span className={styles.subtitle}>{item.subtitle}</span>
          )}
        </div>
        <span className={styles.chevron}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </button>

      <div
        id={`accordion-content-${item.id}`}
        className={styles.content}
        role="region"
        aria-labelledby={`accordion-header-${item.id}`}
      >
        <div className={styles.contentInner}>{item.content}</div>
      </div>
    </div>
  );
}

// FAQ Component using Accordion
export function FAQ({ questions }) {
  const items = questions.map((q, i) => ({
    id: i,
    title: q.question,
    content: <p>{q.answer}</p>,
  }));

  return (
    <div className={styles.faq}>
      <Accordion items={items} />
    </div>
  );
}
