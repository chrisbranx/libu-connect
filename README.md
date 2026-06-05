# LIBU Connect

**Your campus, connected.**

LIBU Connect is a full-stack, production-grade campus life management web application designed for African university students, starting with Cameroonian institutions. It replaces scattered WhatsApp messages, paper notes, and verbal announcements with one unified, intelligent, bilingual (English/French) hub.

## Tech Stack

### Frontend
- **React 18 + Vite** — Modern, fast development
- **Tailwind CSS** — Utility-first styling with custom design tokens
- **Zustand** — Lightweight state management
- **React Router v6** — Client-side routing
- **Framer Motion** — Smooth animations & transitions
- **Lucide React** — Clean, consistent icons
- **Recharts** — Data visualization (GPA charts, distributions)
- **TipTap** — Rich text editor for notes
- **React Hook Form + Zod** — Form validation
- **React Hot Toast** — Notification toasts
- **date-fns** — Date utilities
- **i18next** — Internationalization (EN/FR)
- **Vite PWA Plugin** — Offline support & installability

### Backend
- **Node.js + Express.js** — RESTful API server
- **PostgreSQL + Prisma** — Database with type-safe ORM
- **Redis (ioredis)** — Caching & session management
- **JWT + Refresh Tokens** — Secure authentication
- **Socket.io** — Real-time notifications
- **Cloudinary** — File uploads & storage
- **Nodemailer** — Email service
- **Anthropic Claude API** — AI Academic Advisor

## Features

### 📅 Smart Scheduler
- Weekly timetable (Mon–Sat, 07:00–20:00)
- Monthly calendar view
- Recurring events & reminders
- Color-coded event types
- Export/Import schedule

### 📝 Notes & Study Hub
- Rich text editor (TipTap)
- Organize by course, tags, department
- Share notes with classmates
- Attach files via Cloudinary
- Full-text search

### 📊 Academic Tracker
- GPA calculation (4.0 & 20-point Cameroonian scale)
- Per-semester breakdown
- GPA trend & grade distribution charts
- "What if" GPA simulator

### 🎯 Campus Activities Feed
- Browse & filter events
- RSVP / Join activities
- Admin activity management
- Department-specific announcements

### 👥 Campus Directory
- Search students, lecturers, admin
- Filter by role, department, level
- Privacy-controlled profiles

### 🤖 AI Advisor (Claude)
- Chat interface with academic context
- Reads schedule, grades, notes & activities
- Study plans, GPA analysis, reminders
- Bilingual responses (EN/FR)

### 🔔 Real-time Notifications
- In-app notification bell with badge
- Socket.io real-time delivery
- Notification preferences

### ⚙️ Settings
- Profile, Account, Appearance, Privacy
- Dark/Light mode
- Language toggle (English/French)
- Data export & management

### 🛡️ Admin Panel
- User management
- Activity moderation
- Department broadcast messages
- Usage analytics

## Project Structure

```
libu-connect/
├── client/                  # React frontend
│   ├── public/              # Static assets, PWA manifest
│   ├── src/
│   │   ├── components/      # UI components & layout
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand state management
│   │   ├── services/        # API client
│   │   ├── i18n/            # Translations (EN/FR)
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
│   └── ...
├── server/                  # Express backend
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/       # Auth, roles, rate limiting
│   │   ├── services/        # Business logic
│   │   ├── config/          # DB, Redis, Socket.io
│   │   └── utils/           # Helpers (tokens, GPA calc)
│   ├── prisma/              # Schema & seed data
│   └── ...
├── docker-compose.yml
└── .env.example
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+ (optional, falls back gracefully)
- Docker (optional)

### Environment Setup

1. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

2. Install server dependencies:
```bash
cd server && npm install
```

3. Install client dependencies:
```bash
cd ../client && npm install
```

4. Run database migrations:
```bash
cd ../server
npx prisma migrate dev --name init
npx prisma db seed
```

5. Start development servers:

Terminal 1 (API server):
```bash
cd server && npm run dev
```

Terminal 2 (Frontend):
```bash
cd client && npm run dev
```

### Docker Setup
```bash
docker-compose up --build
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/register` | Register new user |
| `POST /api/v1/auth/login` | Login |
| `POST /api/v1/auth/refresh` | Refresh access token |
| `GET /api/v1/auth/me` | Current user profile |
| `GET/POST/PUT/DELETE /api/v1/schedules` | Schedule CRUD |
| `GET/POST/PUT/DELETE /api/v1/notes` | Notes CRUD |
| `GET/POST/PUT/DELETE /api/v1/grades` | Academic grades CRUD |
| `GET/POST /api/v1/activities` | Activities & RSVP |
| `GET /api/v1/directory` | User directory |
| `POST /api/v1/ai/chat` | AI Advisor chat |
| `GET/PUT /api/v1/notifications` | Notifications |

## Default Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@libuconnect.com | admin123 |
| Lecturer | lecturer@libuconnect.com | lecturer123 |
| Student | student@libuconnect.com | student123 |

---

*Built for SAIBUIST students — and every campus in Cameroon and beyond.*
*LIBU Connect — Your campus, connected.*
