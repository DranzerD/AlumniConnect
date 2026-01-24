# AlumniConnect 🎓

A production-ready alumni networking platform built with Next.js and PostgreSQL. It connects alumni, supports mentorship, enables job sharing, and strengthens community engagement.

## Highlights

- Secure authentication with role-based access (Admin, Alumni, Student)
- Alumni directory, connections, messaging, forums, and notifications
- Jobs, mentorship, resources, achievements, and events
- Admin dashboard for user management and analytics
- Real-time features via WebSockets

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Node.js 18+
- PostgreSQL 14+ (SQLite for dev/test)
- CSS Modules

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Create the database and apply the schema

```bash
psql -U your_username -d alumniconnect -f database/schema.sql
```

3. Configure environment variables

```bash
cp .env.example .env
```

Minimum required values in `.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/alumniconnect
JWT_SECRET=your-generated-secret-key
NODE_ENV=development
```

4. Run the app

```bash
npm run dev
```

Open http://localhost:3000

## Default Admin (after schema import)

- Email: admin@demo.edu
- Password: Admin@123

Change this password immediately after first login.

## Project Layout

```
WT-MINI-PROJECT-main/
├── app/            # App Router pages and API routes
├── components/     # Reusable UI components
├── context/        # React context providers
├── database/       # SQL schema
├── hooks/          # Custom hooks
├── lib/            # Utilities and helpers
├── public/         # Static assets
└── middleware.js   # Route protection and headers
```

## Scripts

- npm run dev
- npm run build
- npm run start
- npm run lint

## License

MIT License — see LICENSE for details.

---

<div align="center">
  <strong>Built with ❤️ for alumni communities everywhere</strong>
</div>
