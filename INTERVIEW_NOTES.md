# AlumniConnect: Interview Revision Notes

Personal study notes. Read top to bottom the night before; skim the **bold** parts five minutes before.

---

## 1. The 30-second pitch

> "AlumniConnect is a multi-college alumni networking platform. Each college gets its own private network where students, alumni and faculty can find each other, connect, message, share jobs, organize events and set up mentorship. It's built with Next.js 15, React 19 and SQLite. The interesting parts are the **multi-tenant data isolation**, a **two-level admin system** (platform admin manages colleges, college admins manage their members), and the security layer: **bcrypt, JWT in httpOnly cookies, rate limiting, input validation and role-based access control**."

## 2. The problem it solves

- Colleges lose touch with graduates; students have no easy way to reach alumni for referrals or advice.
- LinkedIn is public and noisy. This is **private per college**: you only see people from your own institution, and you must sign up with your **college email domain**.
- One deployment serves **many colleges** (multi-tenant), so a college can be onboarded without new infrastructure.

## 3. Key numbers (memorize)

| Thing | Number |
|---|---|
| API route files | **26** (38 HTTP handlers) |
| Pages | **16** |
| Database tables | **10** |
| Roles | **5**: student, alumni, faculty, admin (college), superadmin (platform) |
| End-to-end checks I ran | **140**, all passing |
| Session lifetime | 7 days |
| Login rate limit | 10 attempts / 15 min per IP+email |

> Note: an older resume bullet said "24 API routes". The accurate number is now 26 route files / 38 handlers. Use those.

## 4. Tech stack and *why*

| Choice | Why | Trade-off to mention |
|---|---|---|
| **Next.js 15 (App Router)** | Frontend and backend in one codebase; server components can query the DB directly; file-based routing for APIs | Couples frontend and API deployment |
| **React 19** | Standard UI library; hooks for state | none of note |
| **SQLite (better-sqlite3)** | Zero setup: `npm install && npm run dev` just works; synchronous API is simple and fast; real SQL with transactions and foreign keys | Single server only. To scale out: PostgreSQL |
| **jose** for JWT | Uses Web Crypto, so it runs in **Edge middleware** *and* Node route handlers (`jsonwebtoken` does not run on Edge) | none |
| **bcryptjs** | Industry-standard slow password hashing (cost 10) | Pure JS, slower than native bcrypt |
| **Plain CSS + CSS Modules** with design tokens | No framework lock-in; every color/size comes from variables in `globals.css` | More CSS to write than Tailwind |
| **lucide-react** | One consistent icon set | none |

## 5. Architecture

```
 Browser (React client components)
      │  fetch() JSON  ── lib/client.js (api helper: throws ApiError, redirects on 401)
      ▼
 middleware.js  (Edge runtime)
   • verifies JWT cookie (jose)
   • 401 for API / redirect to /login for pages
   • role gates: /dashboard/admin → admin, /dashboard/platform → superadmin
   • security headers (X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy)
      ▼
 Route handlers  app/api/**/route.js   (Node runtime)
   • wrapped in handler() → consistent JSON errors
   • requireUser()/requireRole() → re-reads user from DB
   • validate() → input validation, 422 with field errors
   • business rules (lib/domain.js), notifications
      ▼
 lib/db.js  → better-sqlite3, one connection per process
      ▼
 SQLite file  data/alumniconnect.db  (schema.sql auto-applied, demo data auto-seeded)

 Server components (dashboard home, admin, platform pages) skip the API
 and query the DB directly for fast first render.
```

### Request lifecycle example: "send a connection request"
1. User clicks **Connect** → `ConnectButton` calls `POST /api/connections { user_id }`.
2. **Middleware** checks the cookie's JWT is valid.
3. Route handler: `requireUser()` loads the user from the DB (catches deactivated accounts).
4. `validate()` checks `user_id` is a positive integer.
5. `getColleague()` confirms the target is **active and in the same college**, else 404.
6. Inside a **transaction**: if the other person already sent me a request, **accept it** (no duplicate); otherwise insert a pending request.
7. `notify()` inserts a notification for the other person.
8. Returns `201 { connection: { id, status } }`; UI updates to "Request sent".

### Folder map
```
app/
  api/              REST endpoints (auth, profiles, connections, messages, jobs,
                    events, mentorship, notifications, summary, admin, platform)
  dashboard/        signed-in pages (+ admin/, platform/)
  login/ register/  auth pages
  page.js           landing page
components/         AppNav, Modal, Toast, Avatar, ConnectButton, ui.js (states)
lib/
  db.js             DB connection + all/get/run/transaction helpers
  auth.js           JWT sign/verify (Edge-safe), cookie options
  session.js        getCurrentUser / requireUser / requireRole
  http.js           HttpError, handler() wrapper, pagination
  validation.js     validate() + password rules
  rate-limit.js     in-memory fixed-window limiter
  domain.js         shared rules: same-college lookup, notifications, role lists
  client.js/hooks.js  browser-side fetch helper, useApi, useDebounce
database/
  schema.sql        all tables (idempotent CREATE IF NOT EXISTS)
  init.js           opens DB, applies schema, seeds if empty
  seed.js           fictional demo data
middleware.js       auth gate + security headers
render.yaml         deployment config
```

## 6. Data model (10 tables)

| Table | Purpose | Notable constraints |
|---|---|---|
| `colleges` | Tenants | unique `domain`, `is_active` flag |
| `users` | Accounts | unique email (case-insensitive), role CHECK, `college_id` NULL **only** for superadmin (CHECK constraint) |
| `profiles` | 1:1 with users | `is_public`, `open_to_mentor` flags |
| `connections` | Requests between two users | `UNIQUE(requester, addressee)`, `CHECK(requester <> addressee)`; reverse duplicates prevented in code |
| `messages` | 1:1 messages | `read_at` for unread counts/read receipts |
| `jobs` | Job posts | scoped by `college_id`, `status open/closed` |
| `events` | Events | optional `capacity` (NULL = unlimited) |
| `event_rsvps` | Who's going | composite PK `(event_id, user_id)` → no double RSVP |
| `mentorship_requests` | Mentor/mentee workflow | status: pending → accepted/declined → completed |
| `notifications` | In-app notifications | `is_read` |

- **Foreign keys** with `ON DELETE CASCADE`; **indexes** on the common lookups (college + role, unread messages, notifications per user).
- WAL mode for better read/write concurrency.

## 7. Security: what I did and why (very likely questions)

1. **Passwords**: bcrypt hashed, never stored in plain text. Rules: 8–72 chars (bcrypt ignores bytes after 72), with a letter and a number.
2. **Sessions**: JWT (HS256) in an **httpOnly, SameSite=Lax, Secure-in-production** cookie.
   - httpOnly → JavaScript can't read it → protects against token theft via XSS.
   - SameSite=Lax → blocks cross-site POSTs → CSRF protection.
3. **JWT_SECRET is required in production** (app refuses to sign tokens without one, min 32 chars). Dev uses a fallback so it runs with zero setup.
4. **Two-layer authorization**:
   - Middleware rejects bad tokens early (cheap, at the edge).
   - Every route **re-reads the user from the DB**, so deactivating a user or a college **revokes access immediately**, even though their JWT hasn't expired. *(Interview gold: "JWTs can't be revoked by themselves, so I check the DB on each request.")*
5. **Multi-tenant isolation**: every query filters by the caller's `college_id`. Cross-college access returns **404, not 403**, so it doesn't reveal that the resource exists.
6. **SQL injection**: all queries are **parameterized**. Search input also escapes `LIKE` wildcards (`%`, `_`).
7. **Rate limiting**: login, register and password change.
8. **Timing-safe login**: if the email doesn't exist, bcrypt still compares against a dummy hash, so response time doesn't reveal which emails are registered.
9. **Open-redirect protection**: the `?next=` param after login must be a same-site path.
10. **Input validation** on every write endpoint, with consistent `422 { error, details }` responses.
11. **Privacy**: email addresses only visible to your connections (or admins).
12. **Security headers** set in middleware.
13. Upgraded **Next.js 14 → 15.5** to fix critical CVEs (including a Windows RCE).

## 8. Business rules worth explaining

- **Mutual connection requests**: if B already requested A, A clicking Connect accepts B's request instead of creating a duplicate.
- **Messaging only between connections** (anti-spam). Accepting a **mentorship automatically connects** the pair so they can message.
- **Event capacity**: the count check and insert run in **one transaction**, so two people can't grab the last seat at once.
- **Mentorship state machine**: a transitions table defines who can do what from which status (mentor accepts/declines; either completes; mentee cancels). Invalid moves → `409 Conflict`.
- **Cancelling an event** notifies everyone who RSVP'd.
- **Registration**: only students and alumni self-register, with an email on the college's domain. Faculty and admins are created by admins.
- **Deactivating a college** signs out its members and blocks logins, but **deletes nothing** (soft delete), and it disappears from sign-up.

## 9. HTTP status codes used (know these)

| Code | When |
|---|---|
| 200 / 201 | OK / created |
| 400 | Malformed JSON or bad filter |
| 401 | Not logged in / invalid token |
| 403 | Logged in but not allowed (wrong role, deactivated account) |
| 404 | Not found **or** belongs to another college |
| 409 | Conflict: duplicate request, event full, invalid state change |
| 422 | Validation failed (with per-field `details`) |
| 429 | Rate limited |

## 10. Frontend notes

- **Server components** for read-heavy pages (dashboard home, admin, platform); **client components** for interactive pages.
- Small custom hooks: `useApi(path)` gives `{ data, error, loading, reload }`; `useDebounce` for search (300 ms).
- Every data page handles **loading (skeletons), empty, and error (with retry)** states.
- Messaging updates by **polling** (thread every 4 s using `?after=<lastId>`; conversation list every 15 s; nav badges every 20 s).
- Design system: CSS variables for a neutral scale, one accent color, 5 type sizes, 4px spacing grid. Accessible: focus rings, labels, `aria-*`, keyboard navigable.

## 11. Honest limitations (say these before they ask)

| Limitation | How I'd fix it |
|---|---|
| No email verification / password reset email | Token table + email service (e.g. Resend/SES), expiring single-use tokens |
| Polling instead of real-time | WebSockets or Server-Sent Events |
| SQLite + in-memory rate limiter = single server | PostgreSQL + Redis for rate limits/sessions |
| Free hosting resets data on restart | Persistent disk or managed Postgres |
| No automated test suite in the repo | Add Vitest/Jest for units, Playwright for E2E, run in CI |
| JWT role can be stale for up to 7 days in middleware | Already mitigated: handlers re-check the DB; could also shorten TTL + refresh tokens |
| No profile photos / file uploads | Object storage (S3) with signed URLs |
| No moderation (report/block) | Reports table + admin review queue |

## 12. Likely interview questions with short answers

**Why Next.js and not a separate Express backend?**
One codebase and one deploy; API routes and pages share code (validation, formatting). For a bigger team I'd consider splitting.

**Why SQLite? Isn't that a toy?**
It's a real ACID database with transactions and foreign keys. It made the project runnable with zero setup. The queries are plain SQL, so moving to PostgreSQL is mostly a driver change plus a few syntax tweaks.

**How do you stop users seeing another college's data?**
Every query includes `college_id = <caller's college>`; shared helpers like `getColleague()` enforce it, and cross-tenant lookups return 404.

**JWTs can't be revoked: how do you handle a banned user?**
The middleware only does a fast signature check; every API route reloads the user from the DB and rejects inactive users or users of inactive colleges. So revocation is immediate.

**How do you prevent overbooking an event?**
Capacity check plus insert in one SQLite transaction; SQLite serializes writes, so it's race-free on one server. On Postgres I'd use `SELECT ... FOR UPDATE` or a conditional insert.

**How would you scale this?**
Postgres, Redis (rate limits, caching, pub/sub for chat), WebSockets for messaging, horizontal app servers behind a load balancer, background jobs for emails/notifications.

**What was hardest?**
The project I started from didn't build: legacy React/Express code mixed in, missing exports, two inconsistent database schemas, fake "API" calls using `setTimeout`. I cut the scope to a coherent core and rebuilt the data layer, auth and APIs so every feature works end to end, then redesigned the UI.

**How did you test it?**
An end-to-end script with 140 checks against a running production build: auth, permissions, cross-tenant isolation, validation, capacity limits, rate limiting, and every page loading. Plus manual browser testing on desktop and mobile widths.

**What would you add next?**
Email verification and password reset first (the biggest real-world gap), then real-time chat, then automated tests in CI.

## 13. 2-minute demo script

1. Landing page → **Sign in** → click **Student (Emily)**.
2. Dashboard: point out "Needs your attention" (pending requests, unread messages).
3. **Directory**: search "google", filter "Open to mentor".
4. **Connections** → accept Priya's request → **Messages**: reply to Sarah.
5. **Jobs**: filter internships. **Events**: RSVP; show the "Full" event (capacity enforced).
6. Log out → **College admin**: stats, deactivate a user (they're signed out instantly).
7. Log out → **Platform admin**: add a college, appoint its admin, deactivate a college.

## 14. Run commands

```bash
npm install
npm run dev          # http://localhost:3000
npm run db:reset     # fresh demo data (needed after schema changes)
npm run lint
npm run build && npm start   # production (set JWT_SECRET in .env)
```

Demo password for every account: `Password123!`
Accounts: `emily.davis@northwood.edu` (student), `sarah.johnson@northwood.edu` (alumni), `admin@northwood.edu` (college admin), `platform@alumniconnect.dev` (platform admin).

## 15. Resume bullets (current)

- Built a full-stack multi-college alumni networking platform with Next.js 15, React 19 and SQLite, with 26 REST API route files covering a searchable directory, connections, messaging, a jobs board, events and mentorship.
- Implemented secure authentication with bcrypt, JWT sessions in httpOnly cookies, role-based access control for 5 roles, rate limiting and per-college data isolation.
- Designed a multi-tenant admin hierarchy: a platform admin onboards colleges and appoints their admins, and college admins manage their own members. Deactivation revokes sessions immediately without deleting data.
- Enforced event capacity with atomic database transactions and built a mentorship workflow modelled as a state machine; verified with 140 end-to-end API checks.

## 16. Before the interview: preparation checklist

These notes are a revision sheet, not a replacement for knowing the code. Work through this list:

- [ ] **Read the 5 core files** and be able to explain each line by line:
  - `middleware.js`: how requests are blocked or redirected
  - `lib/session.js`: how the logged-in user is loaded from the DB
  - `lib/auth.js`: how JWTs are signed and verified
  - `app/api/connections/route.js`: a full feature (validation, same-college check, transaction, notification)
  - `app/api/events/[id]/rsvp/route.js`: the capacity check inside a transaction
- [ ] **Trace one feature end to end** with the app running: button → component → `fetch` → API route → SQL → table.
- [ ] **Make one small change yourself** (no AI), e.g. add a location filter to Jobs, or let users delete their own message. This makes "I built this" true and prepares you for live coding.
- [ ] **Revise the concepts behind it** (interviewers test these more than the app):
  - JWT vs server sessions; why httpOnly cookies
  - Why bcrypt (slow hashing, salts)
  - SQL joins, indexes, transactions, foreign keys
  - React hooks (`useState`, `useEffect`), props vs state
  - Next.js server vs client components; API routes
  - HTTP methods and status codes (section 9)
  - What multi-tenancy is and how isolation is enforced
  - XSS, CSRF and SQL injection, and how this app prevents each
- [ ] **Say the 30-second pitch and the 2-minute demo out loud** until they feel natural.
- [ ] **Know your honest limitations** (section 11) and say them before you're asked.
- [ ] **If asked about AI help, be honest:** "I used AI assistance, then reviewed, tested and extended the code myself." Claiming every line and then failing to explain it does more damage.
- [ ] **Do a mock interview** (ask Claude to quiz you on this project one question at a time).
