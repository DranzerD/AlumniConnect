# AlumniConnect 🎓

A multi-college alumni networking platform where students, alumni and faculty can connect, message each other, share jobs, organise events and set up mentorship. Each college's network is private to its own members.

Built with **Next.js 15 (App Router)**, **React 19** and **SQLite** (`better-sqlite3`). There is no external database to install: the database is created and filled with demo data the first time you run the app.

## Features

- **Auth:** registration with a college-email domain check, bcrypt password hashing, JWT sessions in httpOnly cookies, login rate limiting, and password change.
- **Roles:** student, alumni, faculty and admin, each with different permissions.
- **Multi-tenant:** every query is scoped to the user's college.
- **Directory:** search and filter by role, department, graduation year and mentor availability, with pagination.
- **Profiles:** editable profile with a privacy toggle. Email addresses are shown only to your connections.
- **Connections:** send, accept, decline, withdraw and remove requests.
- **Messaging:** one-to-one chat between connections, with unread counts and read receipts. New messages arrive by polling every few seconds.
- **Jobs board:** alumni, faculty and admins can post jobs, then close, reopen or delete them. Anyone can search and filter.
- **Events:** create an event, RSVP, and optionally cap attendance. The capacity check runs inside a database transaction so an event can't be overbooked. Cancelling an event notifies everyone who RSVP'd.
- **Mentorship:** request a mentor. Requests move through pending → accepted/declined → completed.
- **Notifications:** generated when someone sends or accepts a connection request, when a mentorship request changes status, and when an event is cancelled.
- **Admin dashboard:** community stats, user search, activating and deactivating accounts (a deactivated user is signed out immediately), role changes, and creating faculty accounts.

## Getting started

Requires **Node.js 18.18 or newer**.

```bash
npm install
npm run dev
```

Open http://localhost:3000 and click one of the demo accounts on the login page. Every demo account uses the password `Password123!`.

| Role    | Email                         |
| ------- | ----------------------------- |
| Student | emily.davis@northwood.edu     |
| Alumni  | sarah.johnson@northwood.edu   |
| Admin   | admin@northwood.edu           |

### Production build

```bash
cp .env.example .env        # then set JWT_SECRET (at least 32 characters)
npm run build
npm start
```

### Other scripts

| Command            | What it does                                  |
| ------------------ | --------------------------------------------- |
| `npm run db:reset` | Deletes the database and re-seeds demo data   |
| `npm run lint`     | Runs ESLint                                   |

## Project structure

```
app/
  api/            REST API route handlers (auth, profiles, connections, messages,
                  jobs, events, mentorship, notifications, admin)
  dashboard/      Signed-in pages
  login/ register/
components/       Shared UI (nav, modal, toast, avatar, …)
database/         schema.sql, seed data, DB initialisation
lib/              db access, auth (JWT), session, validation, rate limiting
middleware.js     Route protection and security headers
```

## Design notes

- **Security is enforced in two layers.** The middleware rejects requests without a valid token. Each API route then re-checks the user against the database, so deactivations and role changes take effect immediately.
- **All SQL is parameterised.** `LIKE` wildcards in search input are escaped.
- **Errors have a consistent shape.** Input is validated on every route, and failures come back as `{ error, details }` with correct HTTP status codes (400, 401, 403, 404, 409, 422 or 429).

## Limitations / future work

- Chat uses polling instead of WebSockets.
- SQLite and the in-memory rate limiter assume a single server. Scaling out would need PostgreSQL and Redis.
- There is no email verification or password-reset email yet.
- There is no automated test suite yet.

## License

MIT
