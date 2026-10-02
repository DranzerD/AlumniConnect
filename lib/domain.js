// Shared server-side queries and business rules used by several API routes.
import { get, run } from "./db";
import { HttpError } from "./http";

// Loads another active user from the caller's college, or 404s. All user-to-user
// interactions are scoped to a single college (the platform is multi-tenant).
export function getColleague(currentUser, userId) {
  const user = get(
    `SELECT u.id, u.role, p.full_name AS fullName, p.open_to_mentor AS openToMentor
       FROM users u JOIN profiles p ON p.user_id = u.id
      WHERE u.id = ? AND u.college_id = ? AND u.is_active = 1`,
    userId,
    currentUser.collegeId,
  );
  if (!user) throw new HttpError(404, "User not found");
  return user;
}

// Returns the connection row between two users regardless of direction.
export function findConnection(a, b) {
  return get(
    `SELECT * FROM connections
      WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)`,
    a,
    b,
    b,
    a,
  );
}

// SQL expression for the relationship between the caller (@me) and another user,
// given a LEFT JOIN of `connections c` in either direction.
export const CONNECTION_STATUS_SQL = `
  CASE
    WHEN c.status = 'accepted' THEN 'connected'
    WHEN c.requester_id = @me THEN 'pending_sent'
    WHEN c.id IS NOT NULL THEN 'pending_received'
    ELSE 'none'
  END`;

export function notify(userId, { type, title, body = null, link = null }) {
  run(
    "INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)",
    userId,
    type,
    title,
    body,
    link,
  );
}

// Roles allowed to create content visible to the whole college.
export const CAN_POST_JOBS = ["alumni", "faculty", "admin"];
export const CAN_CREATE_EVENTS = ["alumni", "faculty", "admin"];
export const CAN_MENTOR = ["alumni", "faculty"];

export const JOB_TYPES = ["full-time", "internship", "part-time", "contract"];
export const EVENT_TYPES = ["networking", "workshop", "webinar", "reunion", "career-fair"];

// College email domains: lowercase hostnames like "northwood.edu" or "cs.example.ac.in".
export const DOMAIN_RULE = { type: "string", min: 4, max: 100, label: "email domain" };
export function normalizeDomain(value) {
  const domain = value.trim().toLowerCase().replace(/^@/, "");
  if (!/^(?=.{4,100}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(domain)) {
    throw new HttpError(422, "Enter a domain like northwood.edu", { domain: "Enter a domain like northwood.edu" });
  }
  return domain;
}
