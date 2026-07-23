# Zimal Dental Clinic And Implant Center — Website

A professional, mobile-first website for **Zimal Dental Clinic And Implant Center**
(Mansehra, Pakistan), with an integrated appointment system and two role-based
panels (Doctor/Admin and Patient).

## Tech Stack

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Frontend  | Next.js 16 (App Router, React 19, TypeScript)|
| Styling   | Tailwind CSS v4 — flat blue/white, no gradients |
| Backend   | FastAPI (Python), async via Motor            |
| Database  | MongoDB (Atlas)                              |
| Auth      | JWT issued by FastAPI                         |

The frontend and backend run as **two separate services**. The frontend never
talks to MongoDB directly — every read and write goes through the FastAPI REST API.

## Project Structure

```
.
├── frontend/            # Next.js app (UI, rendering)
│   └── src/
│       ├── app/         # App Router routes  ((public) group + panels later)
│       ├── components/  # ui/ primitives, layout/, system/
│       ├── config/      # site config (brand, nav, contact)
│       └── lib/         # typed API client, utilities
├── backend/             # FastAPI app (REST API, business logic, data access)
│   └── app/
│       ├── core/        # settings/config
│       ├── db/          # MongoDB connection
│       ├── models/      # Pydantic schemas
│       └── routers/     # domain routers (auth, doctors, services, ...)
└── dental-clinic-website-spec.md
```

## Prerequisites

- Node.js 20+ and npm
- Python 3.11+
- A MongoDB connection string (MongoDB Atlas or a local instance)

## Getting Started

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Windows (use: source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
cp .env.example .env             # then set MONGO_URI and JWT_SECRET
uvicorn app.main:app --reload --port 8000
```

- API base: <http://127.0.0.1:8000>
- Health check: <http://127.0.0.1:8000/health>
- Interactive docs: <http://127.0.0.1:8000/docs>

Seed initial data (run once, from `backend/`, with the venv active):

```bash
python -m app.seed         # doctors, services, testimonials
python -m app.seed_admin   # default doctor/admin account (prints the password)
```

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local       # set NEXT_PUBLIC_API_URL if different
npm run dev
```

- App: <http://localhost:3000>

## Environment Variables

**Backend (`backend/.env`)** — see `backend/.env.example`
`MONGO_URI`, `MONGO_DB_NAME`, `CORS_ORIGINS`, `JWT_SECRET`, …

**Frontend (`frontend/.env.local`)** — see `frontend/.env.example`
`NEXT_PUBLIC_API_URL`

> `.env` files are git-ignored and must never be committed.

## Build Progress

Development follows the phased plan in `dental-clinic-website-spec.md`.

- [x] **Phase 1 — Project setup:** two services, design system, shared layout,
      UI primitives, typed API client, CORS, health/ping verified.
- [x] **Phase 2 — Database & models:** Pydantic schemas for all 7 entities,
      indexes, seed (3 doctors + 15 services + testimonials), public read endpoints.
- [x] **Phase 3 — Authentication & roles:** JWT + bcrypt, patient register/login,
      role dependencies, Next.js proxy route guards, doctor/patient panels.
- [x] **Phase 4 — Public website:** Home (all sections), Services listing + detail,
      Team, Gallery, Contact — all rendered live from the database.
- [x] **Phase 5 — Appointment booking:** login-required booking form with doctor
      selection, availability enforcement, double-booking prevention, `pending` status.
- [x] **Phase 6 — Patient panel:** dashboard with upcoming appointments, in-panel
      booking, upcoming/past appointments with cancel, read-only treatment history,
      profile view/edit — every query scoped to the signed-in patient (data isolation).
- [ ] Phase 7 — Doctor / admin panel
- [ ] Phase 8 — Polish & hardening
