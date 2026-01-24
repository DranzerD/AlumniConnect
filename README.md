# AlumniConnect 🎓

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-14+-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js" alt="Node.js" />
</div>

<br />

A **full-featured**, production-ready alumni networking platform built with Next.js 14 and PostgreSQL. Connect alumni, facilitate mentorship, share job opportunities, and build a thriving community.

## ✨ Key Features

### 🔐 Authentication & Security

- **JWT-based authentication** with HTTP-only cookies
- Password hashing with bcrypt
- Role-based access control (Admin, Alumni, Student)
- Forced password reset on first login
- Session management with auto-refresh

### 👥 Social Networking

- **Alumni Directory** - Search and filter by year, company, department, location
- **Connections System** - Send, accept, and manage connection requests
- **Messaging** - Real-time conversations with connections
- **Discussion Forums** - Community Q&A and knowledge sharing
- **Alumni Map** - Interactive world map showing alumni locations
- **Companies Directory** - Browse companies where alumni work

### 💼 Career Services

- **Job Board** - Post and browse job opportunities
- **Mentorship Program** - Connect mentors with mentees with session scheduling
- **Resource Library** - Share career documents, templates, and courses
- **Achievements** - Celebrate promotions, awards, and milestones
- **Success Stories** - Share and showcase alumni journeys

### 📅 Events & Engagement

- **Events Management** - Create, RSVP, and manage alumni events
- **Success Stories** - Share and showcase alumni journeys
- **Notifications** - Real-time updates on connections, messages, and events
- **Settings Dashboard** - Comprehensive user preferences and privacy controls

### 🔧 Developer Features

- **Error Boundary** - Graceful error handling with error reporting
- **Custom 404 Page** - Interactive not found page with suggestions
- **API Client** - Centralized API utility with error handling and retries
- **Validation Library** - Comprehensive form validation utilities
- **Constants Module** - Centralized configuration and enums
- **Middleware** - Authentication, rate limiting, and security headers

### 🛠️ Admin Features

- **User Management** - Create, approve, and manage users
- **Analytics Dashboard** - Track engagement and growth metrics
- **Content Moderation** - Review and approve submissions
- **Multi-tenant Architecture** - College-isolated data

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks and concurrent features
- **CSS Modules** - Scoped, maintainable styling
- **Responsive Design** - Mobile-first approach

### Backend

- **Next.js API Routes** - Full-stack API endpoints
- **PostgreSQL** - Production database
- **SQLite** - Development/testing database

### Architecture

- **50+ React Components** - Reusable UI component library
- **25+ Custom Hooks** - State management and utilities
- **25+ API Routes** - RESTful endpoints
- **50+ Utility Functions** - Helper library
- **Next.js Middleware** - Auth, rate limiting, security headers
- **React Context** - Global state with AppContext & SocketContext
- **WebSocket Support** - Real-time notifications and chat

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Installation

### 1. Navigate to project

```bash
cd WT-MINI-PROJECT-main
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up PostgreSQL database

Create a new PostgreSQL database:

```sql
CREATE DATABASE alumniconnect;
```

Run the schema:

```bash
psql -U your_username -d alumniconnect -f database/schema.sql
```

### 4. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your database credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/alumniconnect
JWT_SECRET=your-generated-secret-key
NODE_ENV=development
```

Generate a secure JWT secret:

```bash
openssl rand -base64 32
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Credentials

After running the schema, a default admin account is created:

- **Email**: `admin@demo.edu`
- **Password**: `Admin@123`

**Important**: Change this password immediately after first login.

## 📁 Project Structure

```
WT-MINI-PROJECT-main/
├── app/
│   ├── api/                    # RESTful API Routes
│   │   ├── auth/               # Authentication (login, logout, reset)
│   │   ├── profiles/           # User profile management
│   │   ├── jobs/               # Job board CRUD
│   │   ├── events/             # Events management
│   │   ├── mentorship/         # Mentorship program
│   │   ├── messages/           # Messaging system
│   │   ├── forums/             # Discussion forums
│   │   ├── connections/        # Social connections
│   │   ├── notifications/      # Notification system
│   │   ├── achievements/       # Achievement tracking
│   │   ├── resources/          # Resource library
│   │   ├── stories/            # Success stories
│   │   ├── analytics/          # Dashboard analytics
│   │   └── admin/              # Admin operations
│   ├── dashboard/              # User Dashboard Pages
│   │   ├── directory/          # Alumni directory
│   │   ├── jobs/               # Job listings
│   │   ├── events/             # Events calendar
│   │   ├── connections/        # Networking
│   │   ├── messages/           # Messaging
│   │   ├── forums/             # Discussions
│   │   ├── mentorship/         # Mentorship
│   │   ├── achievements/       # Achievements
│   │   ├── resources/          # Resources
│   │   ├── notifications/      # Notifications
│   │   ├── settings/           # User settings
│   │   ├── profile/            # Profile editing
│   │   └── analytics/          # User analytics
│   ├── admin/                  # Admin Panel
│   └── login/                  # Authentication Pages
├── components/                 # Reusable UI Components (40+)
│   ├── Button/                 # Button variants
│   ├── Input/                  # Form inputs
│   ├── Modal/                  # Dialogs & overlays
│   ├── Card/                   # Content cards
│   ├── DataTable/              # Data tables with sorting
│   ├── Dropdown/               # Dropdown menus
│   ├── Tabs/                   # Tab navigation
│   ├── Toast/                  # Notifications
│   ├── Pagination/             # Page navigation
│   ├── FileUpload/             # File handling
│   ├── RichTextEditor/         # Text editing
│   ├── DatePicker/             # Date selection
│   ├── Chart/                  # Data visualization
│   └── ...                     # And many more
├── hooks/                      # Custom React Hooks (20+)
│   ├── useDebounce.js          # Debounced values
│   ├── useToast.js             # Toast notifications
│   ├── useLocalStorage.js      # Persistent storage
│   ├── useIntersectionObserver.js  # Scroll detection
│   └── ...                     # And many more
├── lib/                        # Utilities & Configuration
│   ├── db.js                   # Database connection
│   ├── auth.js                 # Auth utilities
│   ├── session.js              # Session management
│   ├── utils.js                # Helper functions (30+)
│   └── api.js                  # API client
├── context/                    # React Context Providers
│   ├── AppContext.js           # Global state management with useReducer
│   └── SocketContext.js        # WebSocket provider for real-time features
├── middleware.js               # Next.js middleware (auth, rate limiting)
├── database/
│   └── schema.sql              # Database schema (35+ tables)
└── public/                     # Static assets
```

## 🔌 Real-Time Features

The platform includes WebSocket support for real-time functionality:

- **Live Notifications** - Instant notification delivery
- **Online Status** - See when connections are online
- **Real-time Chat** - Live messaging with typing indicators
- **Presence System** - Track active users

```javascript
// Using the Socket Context
import { useSocket, useChat } from "@/context/SocketContext";

const { connected, isUserOnline, send } = useSocket();
const { messages, sendMessage, typing } = useChat(conversationId);
```

## 🔒 Security Features

- HTTP-only cookies for token storage
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt (10 rounds)
- Forced password reset on first login
- Role-based access control (RBAC)
- SQL injection protection via parameterized queries
- XSS protection with content sanitization
- CSRF protection

## 🎨 Component Library

This project includes a comprehensive **50+ component library**:

| Category       | Components                                                |
| -------------- | --------------------------------------------------------- |
| **Layout**     | Card, Modal, Tabs, Accordion, Dropdown, ErrorBoundary     |
| **Forms**      | Input, Button, DatePicker, FileUpload, RichTextEditor     |
| **Data**       | DataTable, Pagination, InfiniteScroll, Chart, StatsCard   |
| **Feedback**   | Toast, LoadingSkeleton, ProgressBar, EmptyState, Tooltip  |
| **Navigation** | Navbar, Sidebar, Breadcrumbs, SearchAutocomplete, Tabs    |
| **Social**     | ProfileAvatar, AvatarGroup, Timeline, Badge, ProfileCard  |
| **Utility**    | ThemeToggle, ImageUpload, PasswordStrength, ConfirmDialog |

## 🪝 Custom Hooks

**25+ production-ready hooks** for common patterns:

```javascript
// Data fetching with caching and retries
const { data, loading, error, refetch } = useFetch("/api/users", {
  cache: true,
});

// Advanced form management with validation
const { values, errors, touched, handleChange, handleSubmit } = useForm(
  initialValues,
  validationSchema,
);

// Infinite scroll with intersection observer
const { ref, items, loading, hasMore } = useInfiniteScroll(fetchFn);

// Click outside detection for dropdowns/modals
const containerRef = useClickOutside(() => setOpen(false));

// Keyboard navigation for accessible lists
const { selectedIndex, handleKeyDown } = useKeyboardNavigation(items);

// Responsive design utilities
const { isMobile, isTablet, isDesktop, breakpoint } = useMediaQuery();

// Debounced search
const debouncedSearch = useDebounce(searchTerm, 300);

// Local storage persistence
const [theme, setTheme] = useLocalStorage("theme", "light");
```

## 📚 Utility Libraries

### API Client (`lib/api-client.js`)

```javascript
import apiClient from "@/lib/api-client";

// Typed API methods
const user = await apiClient.profiles.me();
const jobs = await apiClient.jobs.list({ status: "active" });
await apiClient.connections.send(userId);
```

### Validation (`lib/validation.js`)

```javascript
import { rules, createValidator } from "@/lib/validation";

const schema = {
  email: [rules.required(), rules.email()],
  password: [rules.required(), rules.password()],
  confirmPassword: [rules.match("password")],
};

const validator = createValidator(schema);
const { isValid, errors } = validator.validateForm(formData);
```

### Constants (`lib/constants.js`)

```javascript
import { USER_ROLES, JOB_TYPES, INDUSTRIES, SKILLS } from "@/lib/constants";
```

## 📊 Database Schema

The database includes **35+ tables** for comprehensive functionality:

- **Users & Auth**: users, sessions, password_resets, login_history
- **Social**: connections, conversations, messages, user_connections
- **Jobs**: jobs, job_applications, job_bookmarks
- **Events**: events, event_attendees, event_waitlist
- **Forums**: discussions, discussion_replies, discussion_likes, reply_likes, bookmarks
- **Mentorship**: mentors, mentorship_requests, mentorship_sessions, mentorship_reviews
- **Content**: stories, achievements, achievement_likes, resources, resource_bookmarks
- **System**: notifications, analytics, audit_logs, settings

## 🔐 Middleware & Security

The application includes robust Next.js middleware:

```javascript
// middleware.js features:
- Authentication verification for protected routes
- Rate limiting (configurable per route)
- Admin route protection
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Request logging
- Automatic token refresh
```

## 🚀 Deployment

See [SETUP.md](SETUP.md) for detailed deployment instructions.

### Quick Deploy Options

- **Vercel**: One-click deploy with PostgreSQL integration
- **Docker**: Containerized deployment
- **Traditional**: Node.js server with PostgreSQL

## 📈 Performance

- Server-side rendering for SEO
- Optimized database queries with indexes
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Caching strategies for API responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built with ❤️ for alumni communities everywhere</strong>
</div>
