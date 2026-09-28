# CyberShild

A free web app where anyone can paste a suspicious SMS, email, message, or link and get an
instant, plain-language risk assessment. Now with real accounts, a separate admin system,
and PostgreSQL-backed persistence.

## Architecture

```
Frontend (React + Vite)
     ↓ REST API (cookies, credentials included)
Backend (Express)
     ↓
Risk Engine (unchanged) ──► Detection Modules ──► Risk Score
     │
     ├─ User auth (register/login/logout, httpOnly cookie, bcrypt + JWT)
     ├─ Admin auth (fully separate table/secret/cookie from users)
     └─ Prisma ORM ──► PostgreSQL (users, admins, analysis_records)
```

- **Two independent auth systems.** Regular users and admins live in separate database
  tables, are signed with separate secrets (`AUTH_SECRET` vs `ADMIN_AUTH_SECRET`), and use
  separate cookies (`csap_session` vs `csap_admin_session`). A user token can never be used
  against an admin route or vice versa.
- **Server-side authorization everywhere.** Every admin route (`/api/admin/*`) is guarded by
  `requireAdmin` middleware on the backend - the frontend's `AdminProtectedRoute` is a UX
  convenience, not the actual security boundary.
- **Passwords are bcrypt-hashed** (cost factor 12) before they ever touch the database.
  Plaintext passwords are never logged or stored.
- **The message-analysis tool stays public** (per the platform's "free, accessible" purpose).
  If you're logged in, your checks are additionally saved to your account so they show up on
  `/history`. Logged-out visitors can still use it; nothing is saved for them beyond the same
  anonymized aggregate stats as before.

## New in this version

- **Redesigned UI**: dark-by-default premium theme with a light mode toggle, glass cards, animated gradient background, responsive header with mobile drawer, and an admin dashboard with a collapsible sidebar. One CSS design system (`frontend/src/styles/global.css`).
- **Login**: password show/hide, "Remember me" (checked = 30-day persistent cookie; unchecked = browser-session cookie, 1-day token), loading and error states, forgot-password link. All against the real backend.
- **Forgot / reset password**: real token generation, hashed storage and expiry. **No email provider is configured**, so the reset link is printed in the backend console instead of emailed. Wire up Resend/SendGrid/SES in `forgotPassword` in `backend/controllers/authController.js` before real use.
- **Migration**: run `npm run prisma:migrate` again to apply `20260201000000_add_password_reset`.
- New env var: `FRONTEND_URL` (used to build the reset link).

## Animated cyber theme

Matrix-rain canvas, moving perspective grid, scanlines, HUD corner brackets, glitch title, typed tagline, scanning animation while a message is analysed, animated risk ring, and a live **SYSTEM ONLINE** pill that polls `/api/health` (shows DB-down / API-offline states). Dark is default; light mode has a toned-down version. All motion honours `prefers-reduced-motion`; the rain pauses when the tab is hidden and is capped at ~30fps.

## Verifying the backend

- `cd backend && npm run smoke` (with the server running) exercises register, login, sessions, history, profile, password change, admin login, user search, stats and cleanup against your **real** database.
- Cross-domain deploy (frontend on Vercel, backend on Render)? Set `COOKIE_SAMESITE=none` and `CORS_ORIGIN` to the frontend URL, both over HTTPS.

## Branding

The logo is a hand-built SVG shield mark (`frontend/public/logo/cybershild-mark.svg`, also
used as the favicon at `frontend/public/icons/favicon.svg`) — no external image/generation
service involved. It's referenced in the header via a plain `<img>` tag, so swapping in a
different mark later is just replacing that file.

## Getting started

### 1. Database

You need a real PostgreSQL database (a free one from [Neon](https://neon.tech),
[Supabase](https://supabase.com), or [Render](https://render.com) all work fine for
development).

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in:
```
DATABASE_URL=postgresql://user:password@host:5432/cybershild?schema=public
AUTH_SECRET=<a long random string>
ADMIN_AUTH_SECRET=<a different long random string>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<pick something real>
```

### 2. Install, migrate, seed

```bash
npm install
npm run prisma:migrate      # creates the users / admins / analysis_records tables
npm run prisma:seed         # creates the admin account from ADMIN_USERNAME/ADMIN_PASSWORD
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_BASE_URL, defaults to http://localhost:5000/api
npm install
npm run dev
```

Runs at `http://localhost:5173`.

## Using it

- **Sign up / log in** at `/register` and `/login` — normal users.
- **Admin** logs in separately at `/admin/login` (not linked from the main nav — there's a
  small "Admin" link in the footer). This is a single bootstrapped admin account, not a
  public sign-up.
- **`/dashboard`** — admin-only: overview stats, top detected threats, and a searchable,
  paginated user-management table (edit / delete, with a confirmation dialog before delete).
- **`/history`** — logged-in users only: their own past checks.
- **First login**: after a brand-new user's first successful login, a short onboarding modal
  walks through the app; dismissing it sets `hasOnboarded = true` in the database, so it
  won't show again on any device.

## API reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create a user account |
| POST | `/api/auth/login` | — | Log in (sets `csap_session` cookie) |
| POST | `/api/auth/logout` | — | Clear session |
| GET | `/api/auth/me` | user | Current user + `hasOnboarded` |
| POST | `/api/auth/onboarding/complete` | user | Mark onboarding done |
| PATCH | `/api/auth/me` | user | Edit own name / email / username |
| POST | `/api/auth/change-password` | user | `{ currentPassword, newPassword }` |
| DELETE | `/api/history/:id` | user | Delete one of *your own* history items |
| DELETE | `/api/history` | user | Clear your history |
| POST | `/api/admin/users` | admin | Create a user |
| GET | `/api/admin/users/:id` | admin | Get one user |
| POST | `/api/auth/forgot-password` | — | Request a reset link (generic response, never reveals if the email exists) |
| POST | `/api/auth/reset-password` | — | `{ email, token, newPassword }` - token is hashed, single-use, 15 min expiry |
| GET | `/api/history` | user | The caller's own analysis history |
| POST | `/api/analyze` | optional | Risk-check text; saved to history if logged in |
| POST | `/api/admin/auth/login` | — | Admin login (sets `csap_admin_session` cookie) |
| POST | `/api/admin/auth/logout` | admin | Clear admin session |
| GET | `/api/admin/auth/me` | admin | Current admin |
| GET | `/api/admin/users` | admin | `?search=&page=&pageSize=` |
| PATCH | `/api/admin/users/:id` | admin | Edit a user |
| DELETE | `/api/admin/users/:id` | admin | Delete a user |
| GET | `/api/admin/stats` | admin | Dashboard overview stats |
| GET | `/api/health` | — | Health check |

## Environment variables

**backend/.env**
```
PORT, NODE_ENV, CORS_ORIGIN
RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS
DATABASE_URL
AUTH_SECRET, AUTH_SESSION_TTL
ADMIN_AUTH_SECRET, ADMIN_SESSION_TTL
ADMIN_USERNAME, ADMIN_PASSWORD   (consumed once by the seed script)
```

**frontend/.env**
```
VITE_API_BASE_URL
```

No secret ever appears in frontend code - the frontend only ever calls the backend and
relies on httpOnly cookies it can't read or tamper with.

## Database schema (Prisma)

- `users` — id, name, email (unique), username (unique), passwordHash, hasOnboarded, timestamps
- `admins` — id, username (unique), passwordHash, timestamps — completely separate table
- `analysis_records` — id, userId (nullable FK → users), inputType, riskScore, riskLevel,
  detectedThreats (JSON), createdAt

See `backend/prisma/schema.prisma` for the full definitions and
`backend/prisma/migrations/20260101000000_init/migration.sql` for the SQL.

## What I could not verify in this environment

I don't have network access in this sandbox, so I could not run `npm install`, `npx prisma
migrate`, or actually boot the server/database here. Everything above was hand-written and
statically checked (`node -c` on every backend file, brace/paren balance checks on the
frontend), but you'll need to run the install/migrate/start steps yourself and confirm the
end-to-end flows (register → login → onboarding → analyze → history; admin login → dashboard
→ edit/delete user) actually work against a real database. If anything errors out, send me
the exact message and I'll fix it.

## Extending detection

Detection rules are unchanged from before - see `backend/rules/*.js`. Add a new pattern by
adding an entry to the relevant file's `RULES` array.
