"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./DatePicker.module.css";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  format = "YYYY-MM-DD",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    value ? new Date(value) : new Date(),
  );
  const [selectedDate, setSelectedDate] = useState(
    value ? new Date(value) : null,
  );
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return format
      .replace("YYYY", year)
      .replace("MM", month)
      .replace("DD", day)
      .replace("M", d.getMonth() + 1)
      .replace("D", d.getDate());
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateDisabled = (date) => {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (isDateDisabled(newDate)) return;

    setSelectedDate(newDate);
    onChange?.(formatDate(newDate));
    setIsOpen(false);
  };

  const navigateMonth = (delta) => {
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1),
    );
  };

  const navigateYear = (delta) => {
    setViewDate(
      new Date(viewDate.getFullYear() + delta, viewDate.getMonth(), 1),
    );
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyDay} />);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const isDisabled = isDateDisabled(date);

      days.push(
        <button
          key={day}
          type="button"
          className={`${styles.day} ${isSelected ? styles.selected : ""} ${
            isToday ? styles.today : ""
          } ${isDisabled ? styles.disabled : ""}`}
          onClick={() => handleDateSelect(day)}
          disabled={isDisabled}
        >
          {day}
        </button>,
      );
    }

    return days;
  };

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      <div
        className={`${styles.input} ${isOpen ? styles.focused : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.icon}>📅</span>
        <span className={selectedDate ? styles.value : styles.placeholder}>
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        <span className={`${styles.chevron} ${isOpen ? styles.rotated : ""}`}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div className={styles.calendar}>
          <div className={styles.header}>
            <button type="button" onClick={() => navigateYear(-1)}>
              ««
            </button>
            <button type="button" onClick={() => navigateMonth(-1)}>
              «
            </button>
            <span className={styles.monthYear}>
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button type="button" onClick={() => navigateMonth(1)}>
              »
            </button>
            <button type="button" onClick={() => navigateYear(1)}>
              »»
            </button>
          </div>

          <div className={styles.weekdays}>
            {DAYS.map((day) => (
              <div key={day} className={styles.weekday}>
                {day}
              </div>
            ))}
          </div>

          <div className={styles.days}>{renderCalendar()}</div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.todayBtn}
              onClick={() => {
                const today = new Date();
                setViewDate(today);
                setSelectedDate(today);
                onChange?.(formatDate(today));
                setIsOpen(false);
              }}
            >
              Today
            </button>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => {
                setSelectedDate(null);
                onChange?.("");
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
