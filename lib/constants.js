/**
 * Application Constants
 * Centralized configuration and constant values
 */

// Application metadata
export const APP_CONFIG = {
  name: "AlumniConnect",
  version: "1.0.0",
  description: "A comprehensive alumni networking platform",
  author: "AlumniConnect Team",
  support: "support@alumniconnect.com",
};

// API configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Authentication
export const AUTH_CONFIG = {
  tokenKey: "auth_token",
  refreshTokenKey: "refresh_token",
  sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
  rememberMeDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Pagination defaults
export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
  defaultPage: 1,
};

// File upload limits
export const UPLOAD_LIMITS = {
  avatar: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    dimensions: { width: 500, height: 500 },
  },
  resume: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  resource: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ["application/pdf", "image/*", "video/*", "application/zip"],
  },
};

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  ALUMNI: "alumni",
  STUDENT: "student",
  FACULTY: "faculty",
};

// Role permissions
export const PERMISSIONS = {
  [USER_ROLES.ADMIN]: ["*"],
  [USER_ROLES.MODERATOR]: ["manage:content", "manage:users", "view:analytics"],
  [USER_ROLES.ALUMNI]: [
    "create:posts",
    "create:jobs",
    "create:events",
    "mentorship",
  ],
  [USER_ROLES.STUDENT]: ["create:posts", "apply:jobs", "register:events"],
  [USER_ROLES.FACULTY]: ["create:posts", "create:events", "view:analytics"],
};

// Connection status
export const CONNECTION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  BLOCKED: "blocked",
};

// Job types
export const JOB_TYPES = {
  FULL_TIME: "full-time",
  PART_TIME: "part-time",
  CONTRACT: "contract",
  INTERNSHIP: "internship",
  REMOTE: "remote",
  HYBRID: "hybrid",
};

// Job status
export const JOB_STATUS = {
  ACTIVE: "active",
  CLOSED: "closed",
  DRAFT: "draft",
  EXPIRED: "expired",
};

// Experience levels
export const EXPERIENCE_LEVELS = {
  ENTRY: "entry",
  MID: "mid",
  SENIOR: "senior",
  LEAD: "lead",
  EXECUTIVE: "executive",
};

// Event types
export const EVENT_TYPES = {
  WEBINAR: "webinar",
  WORKSHOP: "workshop",
  NETWORKING: "networking",
  REUNION: "reunion",
  CAREER_FAIR: "career-fair",
  GUEST_LECTURE: "guest-lecture",
};

// Notification types
export const NOTIFICATION_TYPES = {
  CONNECTION_REQUEST: "connection_request",
  CONNECTION_ACCEPTED: "connection_accepted",
  MESSAGE: "message",
  JOB_POSTED: "job_posted",
  JOB_APPLICATION: "job_application",
  EVENT_REMINDER: "event_reminder",
  MENTORSHIP_REQUEST: "mentorship_request",
  ACHIEVEMENT: "achievement",
  SYSTEM: "system",
};

// Discussion categories
export const DISCUSSION_CATEGORIES = {
  GENERAL: "general",
  CAREER: "career",
  TECHNICAL: "technical",
  INDUSTRY_NEWS: "industry-news",
  MENTORSHIP: "mentorship",
  EVENTS: "events",
  ANNOUNCEMENTS: "announcements",
};

// Resource categories
export const RESOURCE_CATEGORIES = {
  CAREER: "career",
  TECHNICAL: "technical",
  SOFT_SKILLS: "soft-skills",
  INTERVIEW_PREP: "interview-prep",
  INDUSTRY: "industry",
  ENTREPRENEURSHIP: "entrepreneurship",
};

// Mentorship status
export const MENTORSHIP_STATUS = {
  AVAILABLE: "available",
  LIMITED: "limited",
  UNAVAILABLE: "unavailable",
};

// Session duration options
export const SESSION_DURATIONS = [
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
];

// Industry list
export const INDUSTRIES = [
  "Technology",
  "Finance & Banking",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Consulting",
  "Retail & E-commerce",
  "Media & Entertainment",
  "Real Estate",
  "Energy & Utilities",
  "Telecommunications",
  "Government",
  "Non-Profit",
  "Legal",
  "Marketing & Advertising",
  "Transportation & Logistics",
  "Hospitality & Tourism",
  "Agriculture",
  "Construction",
  "Other",
];

// Skills list
export const SKILLS = [
  "JavaScript",
  "Python",
  "Java",
  "React",
  "Node.js",
  "SQL",
  "Machine Learning",
  "Data Analysis",
  "Project Management",
  "Leadership",
  "Communication",
  "Problem Solving",
  "Cloud Computing",
  "DevOps",
  "UI/UX Design",
  "Agile",
  "Marketing",
  "Sales",
  "Finance",
  "Strategy",
];

// Graduation years (dynamic)
export const getGraduationYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear + 4; year >= 1970; year--) {
    years.push(year);
  }
  return years;
};

// Theme configuration
export const THEME_CONFIG = {
  colors: {
    primary: "#3b82f6",
    secondary: "#6b7280",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#0ea5e9",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  search: { key: "k", modifier: "ctrl", description: "Open search" },
  notifications: {
    key: "n",
    modifier: "ctrl",
    description: "Open notifications",
  },
  newPost: { key: "p", modifier: "ctrl", description: "Create new post" },
  messages: { key: "m", modifier: "ctrl", description: "Open messages" },
  help: { key: "?", description: "Show keyboard shortcuts" },
};

// Social links template
export const SOCIAL_PLATFORMS = [
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    baseUrl: "https://linkedin.com/in/",
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: "🐦",
    baseUrl: "https://twitter.com/",
  },
  { id: "github", name: "GitHub", icon: "💻", baseUrl: "https://github.com/" },
  { id: "portfolio", name: "Portfolio", icon: "🌐", baseUrl: "" },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    baseUrl: "https://instagram.com/",
  },
];

// Error messages
export const ERROR_MESSAGES = {
  network: "Unable to connect. Please check your internet connection.",
  unauthorized: "Please log in to continue.",
  forbidden: "You do not have permission to perform this action.",
  notFound: "The requested resource was not found.",
  serverError: "Something went wrong. Please try again later.",
  validation: "Please check your input and try again.",
  fileSize: "File size exceeds the maximum limit.",
  fileType: "This file type is not supported.",
};

// Success messages
export const SUCCESS_MESSAGES = {
  profileUpdated: "Profile updated successfully!",
  connectionSent: "Connection request sent!",
  jobPosted: "Job posted successfully!",
  eventCreated: "Event created successfully!",
  messageSent: "Message sent!",
  settingsSaved: "Settings saved successfully!",
};

export default {
  APP_CONFIG,
  API_CONFIG,
  AUTH_CONFIG,
  PAGINATION,
  UPLOAD_LIMITS,
  USER_ROLES,
  PERMISSIONS,
  CONNECTION_STATUS,
  JOB_TYPES,
  JOB_STATUS,
  EXPERIENCE_LEVELS,
  EVENT_TYPES,
  NOTIFICATION_TYPES,
  DISCUSSION_CATEGORIES,
  RESOURCE_CATEGORIES,
  MENTORSHIP_STATUS,
  SESSION_DURATIONS,
  INDUSTRIES,
  SKILLS,
  getGraduationYears,
  THEME_CONFIG,
  KEYBOARD_SHORTCUTS,
  SOCIAL_PLATFORMS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
