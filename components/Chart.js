"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Chart.module.css";

// Animated Bar Chart
export function BarChart({
  data,
  height = 300,
  showLabels = true,
  showValues = true,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div ref={chartRef} className={styles.barChart} style={{ height }}>
      <div className={styles.bars}>
        {data.map((item, index) => (
          <div key={index} className={styles.barWrapper}>
            <div className={styles.barContainer}>
              {showValues && (
                <div
                  className={styles.barValue}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transitionDelay: `${index * 100 + 300}ms`,
                  }}
                >
                  {item.value}
                </div>
              )}
              <div
                className={styles.bar}
                style={{
                  height: isVisible
                    ? `${(item.value / maxValue) * 100}%`
                    : "0%",
                  transitionDelay: `${index * 100}ms`,
                  background:
                    item.color ||
                    `linear-gradient(180deg, #667eea 0%, #764ba2 100%)`,
                }}
              />
            </div>
            {showLabels && <div className={styles.barLabel}>{item.label}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Animated Donut Chart
export function DonutChart({
  data,
  size = 200,
  strokeWidth = 30,
  showLegend = true,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  const defaultColors = [
    "#667eea",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
  ];

  return (
    <div ref={chartRef} className={styles.donutChart}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={styles.donutSvg}
      >
        {data.map((item, index) => {
          const percent = item.value / total;
          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const strokeDashoffset = -cumulativePercent * circumference;
          cumulativePercent += percent;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color || defaultColors[index % defaultColors.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className={`${styles.donutSegment} ${isVisible ? styles.visible : ""}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            />
          );
        })}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className={styles.donutCenter}
        >
          <tspan x={size / 2} dy="-0.25em" className={styles.donutValue}>
            {total}
          </tspan>
          <tspan x={size / 2} dy="1.5em" className={styles.donutLabel}>
            Total
          </tspan>
        </text>
      </svg>

      {showLegend && (
        <div className={styles.legend}>
          {data.map((item, index) => (
            <div key={index} className={styles.legendItem}>
              <span
                className={styles.legendColor}
                style={{
                  background:
                    item.color || defaultColors[index % defaultColors.length],
                }}
              />
              <span className={styles.legendLabel}>{item.label}</span>
              <span className={styles.legendValue}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Line Chart
export function LineChart({
  data,
  height = 200,
  showDots = true,
  showArea = true,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const padding = 40;
  const width = 100;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const valueRange = maxValue - minValue || 1;

  const points = data.map((item, index) => ({
    x: padding + (index / (data.length - 1)) * chartWidth,
    y:
      padding +
      chartHeight -
      ((item.value - minValue) / valueRange) * chartHeight,
    ...item,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z`;

  return (
    <div ref={chartRef} className={styles.lineChart}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className={styles.lineSvg}
        style={{ height }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#667eea" stopOpacity="0" />
          </linearGradient>
        </defs>

        {showArea && (
          <path
            d={areaPath}
            fill="url(#lineGradient)"
            className={`${styles.lineArea} ${isVisible ? styles.visible : ""}`}
          />
        )}

        <path
          d={linePath}
          fill="none"
          stroke="#667eea"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${styles.linePath} ${isVisible ? styles.visible : ""}`}
        />

        {showDots &&
          points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="1"
              fill="#667eea"
              className={`${styles.lineDot} ${isVisible ? styles.visible : ""}`}
              style={{ transitionDelay: `${index * 50}ms` }}
            />
          ))}
      </svg>

      <div className={styles.lineLabels}>
        {data.map((item, index) => (
          <div key={index} className={styles.lineLabel}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// Progress Ring
export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  label,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ringRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    if (ringRef.current) {
      observer.observe(ringRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (value / max) * 100;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div ref={ringRef} className={styles.progressRing}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={isVisible ? offset : circumference}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={styles.progressCircle}
        />
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className={styles.progressText}
        >
          {Math.round(percentage)}%
        </text>
      </svg>
      {label && <div className={styles.progressLabel}>{label}</div>}
    </div>
  );
}
