-- AlumniConnect schema (SQLite)
-- Every statement is idempotent so it can be re-applied safely on startup.

CREATE TABLE IF NOT EXISTS colleges (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  domain      TEXT    NOT NULL UNIQUE,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  college_id     INTEGER NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  email          TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash  TEXT    NOT NULL,
  role           TEXT    NOT NULL CHECK (role IN ('student', 'alumni', 'faculty', 'admin')),
  is_active      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  last_login_at  TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_college_role ON users(college_id, role);

CREATE TABLE IF NOT EXISTS profiles (
  user_id          INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name        TEXT    NOT NULL,
  headline         TEXT,
  graduation_year  INTEGER,
  degree           TEXT,
  department       TEXT,
  current_company  TEXT,
  current_role     TEXT,
  location         TEXT,
  bio              TEXT,
  skills           TEXT,     -- comma-separated
  linkedin_url     TEXT,
  github_url       TEXT,
  is_public        INTEGER NOT NULL DEFAULT 1,
  open_to_mentor   INTEGER NOT NULL DEFAULT 0,
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_profiles_year ON profiles(graduation_year);

-- A pair of users has at most one row, in either direction
-- (enforced in app/api/connections/route.js).
CREATE TABLE IF NOT EXISTS connections (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  responded_at  TEXT,
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);
CREATE INDEX IF NOT EXISTS idx_connections_addressee ON connections(addressee_id, status);

CREATE TABLE IF NOT EXISTS messages (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body          TEXT    NOT NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  read_at       TEXT,
  CHECK (sender_id <> recipient_id)
);
CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(sender_id, recipient_id, id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, read_at);

CREATE TABLE IF NOT EXISTS jobs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  college_id    INTEGER NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  posted_by     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name  TEXT    NOT NULL,
  title         TEXT    NOT NULL,
  job_type      TEXT    NOT NULL CHECK (job_type IN ('full-time', 'internship', 'part-time', 'contract')),
  location      TEXT,
  is_remote     INTEGER NOT NULL DEFAULT 0,
  description   TEXT    NOT NULL,
  apply_url     TEXT    NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_jobs_college_status ON jobs(college_id, status, created_at);

CREATE TABLE IF NOT EXISTS events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  college_id    INTEGER NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  organizer_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT    NOT NULL,
  description   TEXT    NOT NULL,
  event_type    TEXT    NOT NULL CHECK (event_type IN ('networking', 'workshop', 'webinar', 'reunion', 'career-fair')),
  starts_at     TEXT    NOT NULL,  -- ISO-8601 UTC
  location      TEXT,
  is_virtual    INTEGER NOT NULL DEFAULT 0,
  capacity      INTEGER,           -- NULL = unlimited
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_college_start ON events(college_id, starts_at);

CREATE TABLE IF NOT EXISTS event_rsvps (
  event_id    INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS mentorship_requests (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  mentee_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic         TEXT    NOT NULL,
  message       TEXT    NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  responded_at  TEXT,
  CHECK (mentee_id <> mentor_id)
);
CREATE INDEX IF NOT EXISTS idx_mentorship_mentor ON mentorship_requests(mentor_id, status);
CREATE INDEX IF NOT EXISTS idx_mentorship_mentee ON mentorship_requests(mentee_id, status);

CREATE TABLE IF NOT EXISTS notifications (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT    NOT NULL,
  title       TEXT    NOT NULL,
  body        TEXT,
  link        TEXT,
  is_read     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, id);
