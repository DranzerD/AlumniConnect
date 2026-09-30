// Formatting helpers safe to use on both server and client.

// SQLite datetime('now') values look like "2026-01-31 14:05:00" (UTC, no zone).
export function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? `${value.replace(" ", "T")}Z`
    : value;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function timeAgo(value) {
  const d = parseDate(value);
  if (!d) return "";
  const seconds = Math.round((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const units = [
    ["y", 31536000],
    ["mo", 2592000],
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
  ];
  for (const [label, size] of units) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${label} ago`;
  }
  return "just now";
}

export function formatDate(value) {
  const d = parseDate(value);
  return d
    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
}

export function formatDateTime(value) {
  const d = parseDate(value);
  return d
    ? d.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";
}

export function initials(name = "") {
  return (
    name
      .replace(/^(Dr|Prof)\.?\s+/i, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "?"
  );
}

export const ROLE_LABELS = {
  student: "Student",
  alumni: "Alumni",
  faculty: "Faculty",
  admin: "Admin",
};

export const JOB_TYPE_LABELS = {
  "full-time": "Full-time",
  internship: "Internship",
  "part-time": "Part-time",
  contract: "Contract",
};

export const EVENT_TYPE_LABELS = {
  networking: "Networking",
  workshop: "Workshop",
  webinar: "Webinar",
  reunion: "Reunion",
  "career-fair": "Career fair",
};
