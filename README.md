# ✦ Inkwell — AI-Powered Notes Workspace

> *Where ideas find form.*

Inkwell is a full-stack, AI-powered notes workspace built for the Peblo Full Stack Developer Challenge. It combines an editorial writing experience with Claude AI to summarise notes, extract action items, and suggest titles — all backed by a clean REST API and a local SQLite database.

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast HMR, minimal config |
| **State** | Zustand | Lightweight, no boilerplate |
| **Routing** | React Router v6 | File-based, simple |
| **Backend** | Node.js + Express | Familiar, fast to build |
| **Database** | SQLite via sqlite + sqlite3 | Pure JS, zero native compilation, works on all platforms |
| **Auth** | JWT + bcrypt | Stateless, secure |
| **AI** | Google Gemini 1.5 Flash | Free tier — no credit card needed |
| **Styling** | Pure CSS variables + inline styles | No build-time CSS overhead |

---

## Architecture

```
inkwell/
├── backend/                  # Express API server
│   ├── db/
│   │   └── init.js           # SQLite schema + initialiser
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js           # POST /auth/signup, /auth/login, GET /auth/me
│   │   ├── notes.js          # CRUD + public share endpoint
│   │   ├── ai.js             # POST /ai/generate/:id, GET /ai/stats
│   │   └── insights.js       # GET /insights (dashboard data)
│   ├── server.js             # Express app + middleware wiring
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── UI.jsx        # Design system (Btn, Input, Tag, Toast, Card, Spinner, Empty)
│   │   │   ├── Sidebar.jsx   # Nav rail + note list + search + tag filter
│   │   │   └── NoteEditor.jsx# Title, content, tags, category, autosave, AI panel
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx       # Sign in / Sign up
│   │   │   ├── WorkspacePage.jsx  # Main layout shell
│   │   │   ├── InsightsPage.jsx   # Dashboard with charts
│   │   │   └── SharedNotePage.jsx # Public note view (no auth)
│   │   ├── lib/
│   │   │   ├── api.js        # Axios instance + typed API calls
│   │   │   └── store.js      # Zustand global state
│   │   ├── App.jsx           # Router + protected routes
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # CSS variables, fonts, animations
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── docs/
│   └── sample-outputs.json   # Example API responses
│
└── .gitignore
```

---

## Database Schema

```sql
users (
  id TEXT PK, name TEXT, email TEXT UNIQUE,
  password TEXT, created_at TEXT, updated_at TEXT
)

notes (
  id TEXT PK, user_id TEXT FK,
  title TEXT, content TEXT, category TEXT,
  is_archived INTEGER, is_public INTEGER,
  share_id TEXT UNIQUE, word_count INTEGER,
  created_at TEXT, updated_at TEXT
)

tags (
  id TEXT PK, note_id TEXT FK, name TEXT
)

ai_generations (
  id TEXT PK, note_id TEXT FK, user_id TEXT FK,
  summary TEXT, action_items TEXT (JSON),
  suggested_title TEXT, tokens_used INTEGER,
  created_at TEXT
)

note_activity (
  id TEXT PK, user_id TEXT FK, note_id TEXT FK,
  action TEXT, created_at TEXT
)
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | ✗ | Register new user |
| POST | `/auth/login` | ✗ | Login, receive JWT |
| GET | `/auth/me` | ✓ | Get current user |
| GET | `/notes` | ✓ | List notes (search, tag, category, sort, archived) |
| POST | `/notes` | ✓ | Create note |
| PATCH | `/notes/:id` | ✓ | Update note (partial) |
| DELETE | `/notes/:id` | ✓ | Delete note |
| GET | `/notes/shared/:shareId` | ✗ | Public note view |
| POST | `/ai/generate/:noteId` | ✓ | Generate AI summary + action items |
| GET | `/ai/stats` | ✓ | AI usage statistics |
| GET | `/insights` | ✓ | Dashboard data |
| GET | `/health` | ✗ | Health check |

---

## Setup & Running

### Prerequisites
- Node.js 18+
- A free Google Gemini API key — get one in 60 seconds at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (sign in with Google, click "Create API Key", done)

### 1. Clone

```bash
git clone https://github.com/your-username/inkwell.git
cd inkwell
```

### 2. Backend

```bash
cd backend
npm install

# Create your .env from the example
cp .env.example .env
# Edit .env — fill in JWT_SECRET and GEMINI_API_KEY

npm run dev
# API runs on http://localhost:4000
```

> The database (`db/inkwell.db`) is created automatically on first run.

### 3. Frontend

```bash
cd ../frontend
npm install

cp .env.example .env
# VITE_API_URL=http://localhost:4000 (default, no change needed)

npm run dev
# App runs on http://localhost:5173
```

### 4. Open

Visit **http://localhost:5173**, create an account, and start writing.

---

## Features

### ✦ Authentication
- Secure signup and login with bcrypt password hashing
- JWT sessions (7-day expiry) stored in localStorage
- Protected routes redirect unauthenticated users to `/login`
- Auto-logout on token expiry (401 interceptor)

### ✦ Notes Workspace
- Create, edit, archive, and delete notes
- Auto-save with 1.2s debounce — never lose a keystroke
- Tags (up to 8 per note) with colour-coded pills
- Categories: general, work, personal, learning, ideas, journal
- Markdown preview mode (render headings, bold, italic, code, blockquotes, lists)
- Word count and estimated read time in the editor toolbar

### ✦ AI Integration (Claude)
- One-click AI summary generation per note
- Extracts action items (up to 5) automatically
- Suggests a sharp title if none is set
- Labels key topics for the note
- All AI results stored in DB; token usage tracked per user
- Rate-limited to 10 AI requests/minute per IP

### ✦ Search & Filtering
- Full-text keyword search across title and content
- Filter by tag (click any tag in the sidebar)
- Sort by last updated or creation date
- Filter archived vs active notes separately

### ✦ Public Sharing
- Toggle any note public with one click
- Generates a unique `/shared/:shareId` URL
- Share link auto-copied to clipboard
- Clean, readable public page — no login required
- Public page shows AI summary if generated

### ✦ Productivity Insights Dashboard
- Total notes, words written, AI generations, shared notes, archived count
- 7-day activity bar chart (note edits per day)
- Most-used tags with usage bars
- Category breakdown
- AI usage stats (total generations + tokens consumed)
- Recently edited notes list

---

## Design Philosophy

Inkwell uses an **editorial ink-on-paper** aesthetic — warm paper tones (`#f5f3ee`), deep ink colours (`#1a1a18`), and Playfair Display for headings to evoke the feel of a quality notebook. The UI avoids decorative clutter; every element earns its place.

The colour palette uses CSS custom properties throughout, making it trivial to add dark mode or theming later.

---

## What I'd add with more time

- **Real-time collaboration** — WebSocket-based cursor sharing via Socket.io
- **Dark mode** — CSS variable swap, toggle in user menu
- **Keyboard shortcuts** — `Cmd+N` new note, `Cmd+S` save, `Cmd+/` AI generate
- **Optimistic UI updates** — update local state immediately, reconcile on response
- **Full-text search with SQLite FTS5** — much faster search on large datasets
- **Deployment** — Railway (backend) + Vercel (frontend)
- **Tests** — Vitest for frontend, supertest for API routes

---

## Environment Variables

### Backend (`backend/.env`)

```
PORT=4000
JWT_SECRET=inkwell_jwt_secret_make_this_long_and_random
GEMINI_API_KEY=AIza...your_key_from_aistudio_google_com
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:4000
```

> **Never commit `.env` files.** They are in `.gitignore`.

---

*Built for the Peblo Full Stack Developer Challenge — May 2026*
