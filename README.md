# Cyber Security Awareness Platform

A free, simple web app where anyone can paste a suspicious SMS, email, message, or URL
and get an instant, plain-language risk assessment — designed to be usable by elderly
users, students, first-time smartphone users, and rural users.

> "From a single pasted message to a clear, actionable verdict."

## How it works

```
Frontend (React)
     ↓  REST API
Backend (Express)
     ↓
Risk Engine
     ↓
Detection Modules (phishing, URLs, OTP, urgency, India-specific scams...)
     ↓
Risk Score (0-100) + Risk Level (SAFE / CAUTION / HIGH_RISK)
     ↓
API Response → Frontend Result
```

The frontend never contains detection logic — all analysis happens on the backend so
detection rules can be updated without touching the UI.

## Project structure

```
cyber-security-awareness-platform/
├── frontend/   React + Vite app
├── backend/    Express REST API + modular risk engine
├── README.md
└── .gitignore
```

## Getting started

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The API runs at `http://localhost:5000` by default.

- `GET /api/health` — health check
- `POST /api/analyze` — body `{ "text": "..." }` → risk assessment
- `POST /api/auth/login` — body `{ "username": "...", "password": "..." }` → JWT token
- `GET /api/analytics` — aggregated usage statistics (requires `Authorization: Bearer <token>`)

### Admin login

The analytics dashboard is protected by a single admin account, seeded on first
startup from `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `backend/.env` (also set
`JWT_SECRET` to a long random string). There is no public sign-up — this is an
admin-only view, not a user-account system. Change the default credentials before
deploying anywhere public. Visit `/login` in the frontend to sign in.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and talks to the backend via
`VITE_API_BASE_URL` (see `frontend/.env.example`).

## Extending detection

Each scam category lives in its own file under `backend/rules/`:

```
rules/
  phishingRules.js
  digitalArrestRules.js
  courierScamRules.js
  maliciousAppRules.js
  otpRules.js
  urgencyRules.js
```

To add a new pattern: add an entry to the relevant file's `RULES` array (or create a
new rules file and wire it into `backend/services/scamPatternDetector.js`). No other
file needs to change.

## Multi-language support

UI strings live in `frontend/src/locales/*.json` (starting with English and Hindi).
Add a new language by creating another locale file and registering it in
`frontend/src/services/i18n.js` — no component code needs to change.

## Important notes

- This tool provides a **risk assessment**, not a guarantee. It does not claim
  perfect detection.
- The analytics dashboard only stores aggregated, non-sensitive statistics
  (risk score, risk level, detected threat categories). Raw pasted messages are
  **never** stored.
- URLs are inspected as text only — the app never visits or executes a submitted
  link.
- Helpline/report links point to genuine official resources (e.g. cybercrime.gov.in,
  1930), not invented numbers.

## Deployment

- **Frontend**: deployable to Vercel as a static Vite build (`npm run build` → `dist/`).
- **Backend**: deployable to Vercel serverless functions, Render, or any Node host.
- **Database**: starts with a local JSON file (`backend/data/store.json`) behind a
  swappable driver in `backend/config/database.js` — point `DB_DRIVER` at a hosted
  database driver later without touching the rest of the app.
