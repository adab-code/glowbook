# GlowBook

Booking and client management for independent beauty professionals and small studios — lash technicians, hairstylists, nail artists, and estheticians. One place to schedule appointments, keep client history and notes, and manage the services a studio offers, replacing the WhatsApp/Instagram-DM juggling and paper notebooks these businesses run on today.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · PostgreSQL (Supabase) + Prisma · Auth.js v5 · shadcn/ui · Vercel

---

## Team Members

| Name | GitHub | Focus areas |
|---|---|---|
| Aaron Daniel Alfaro Barra | [@adab-code](https://github.com/adab-code) | Team lead (Week 02), data model, authentication, API route handlers |
| Iván Chulde | [@ivanchulde](https://github.com/ivanchulde) | Team lead (Week 03), design system, component library, dashboard & calendar UI |

---

## Features

The MVP scope comes from [`docs/glowbook-spec.md`](docs/glowbook-spec.md) and is tracked on the [GitHub Project Board](https://github.com/users/adab-code/projects/2).

- **Account access** — studio sign-up, sign-in, sign-out, password reset, staff invites, per-studio data isolation
- **Service catalog** — CRUD with required-field validation and delete confirmation when appointments reference a service
- **Client profiles** — CRUD with free-form notes (allergies, preferences) and appointment history
- **Appointment calendar** — create, view, edit, and cancel bookings with double-booking (overlap) detection
- **Daily dashboard** — today's appointments in chronological order plus an upcoming preview, with status updates inline

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16, App Router | Course requirement; file-based routing, server components by default |
| Language | TypeScript 5, `strict: true` | Course requirement; no `any` in our code |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility-first, shared component library, design tokens in `@theme` |
| Database | PostgreSQL (Supabase) + Prisma | Relational integrity across studios, clients, services, appointments |
| Auth | Auth.js v5, Credentials provider | Course default; keeps identity in our own `Account`/`StaffUser` tables |
| Hosting | Vercel | Course requirement; env-var configured deploys |

---

## Getting Started

### Prerequisites

- Node.js 20+ (developed on Node 24)
- npm 10+
- A Supabase project (free tier is enough) for the PostgreSQL connection strings
- A Vercel account for deployment

### 1. Clone and install

```bash
git clone https://github.com/adab-code/glowbook.git
cd glowbook
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled PostgreSQL connection string used by the app at runtime (serverless-safe) |
| `DIRECT_URL` | Direct (non-pooled) connection string used by Prisma migrations |
| `AUTH_SECRET` | Secret used by Auth.js to sign session cookies (`npx auth secret` to generate) |
| `AUTH_TRUST_HOST` | Set to `true` when deploying behind Vercel so Auth.js trusts the host |

Never commit `.env.local` — `.gitignore` already excludes `.env*`.

### 3. Set up the database

*Available once the database issue (#3) lands — the Prisma schema is on the Week 04 milestone.*

```bash
npx prisma migrate dev --name init   # apply migrations locally
npx prisma generate                  # generate the typed client
npx prisma studio                    # optional: inspect data in a GUI
```

Seed data for local development lives in `prisma/seed.ts`.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Verify the full client → server → database cycle

*Available once the first API route handler lands — the service catalog issue (#4) adds `GET /api/services` plus a client component that consumes it.* The `/api/hello` health check is also on the board for Week 04.

### Other scripts

```bash
npm run build        # production build
npm run start        # serve the production build
npm run lint         # ESLint
```

---

## Deploying to Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new) (Framework Preset: **Next.js**).
2. Add the environment variables from the table above under **Project → Settings → Environment Variables** for all three environments.
3. Deploy. Vercel runs `npm run build` and serves the App Router output.

Database migrations are **not** run on every deploy — run `npx prisma migrate deploy` from a local machine or a CI job against the production `DIRECT_URL` when a migration is added.

---

## Project Structure

Target structure agreed in the Week 03 meeting. Directories marked *(planned)* are built during Week 04; everything else exists today.

```
src/
  app/
    (auth)/login, signup, forgot-password   → unauthenticated routes *(planned)*
    (app)/dashboard, calendar, clients, …   → authenticated routes *(planned)*
    api/                                    → route handlers (client → server → DB) *(planned)*
    proxy.ts                                → auth interception *(planned)*
    layout.tsx, page.tsx, globals.css
  components/
    ui/          → shadcn/ui primitives *(planned)*
    layout/      → AppShell, Sidebar, Topbar, PageHeader *(planned)*
    features/    → service/, client/, appointment/, dashboard/ *(planned)*
  lib/
    auth.ts, db.ts, validations/ (Zod schemas) *(planned)*
  types/
prisma/
  schema.prisma, migrations/, seed.ts *(planned)*
docs/
  glowbook-spec.md   → the project specification (authoritative)
  architecture.md    → routes, components, hierarchy
  data-model.md      → entities, fields, relationships
  design-system.md   → palette, typography, spacing
  w02-reports.md, w03-reports.md
specs/001-glowbook-booking/  → Spec-Kit working spec + quality checklist
.github/copilot-instructions.md → AI assistant rules for the whole team
```

**Rendering strategy:** server components by default; `"use client"` only where interactivity is required (forms, calendar navigation, optimistic updates). Data fetching happens in server components and route handlers, not in client components.

---

## API Documentation

All endpoints are route handlers under `src/app/api`. They return JSON, require an authenticated session unless noted, and are scoped to the signed-in user's studio.

> **Status:** this is the agreed API surface from [`docs/glowbook-spec.md`](docs/glowbook-spec.md) and [`docs/architecture.md`](docs/architecture.md). The handlers themselves are implemented during Week 04 — none exist in the repository yet.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `GET` | `/api/hello` | Health check / pipeline verification | No |
| `POST` | `/api/auth/register` | Create a studio account (sign-up) | No |
| `POST` | `/api/auth/login` | Sign in and set the session cookie | No |
| `POST` | `/api/auth/logout` | End the session | Yes |
| `POST` | `/api/auth/password-reset` | Request a time-limited reset link | No |
| `POST` | `/api/auth/password-reset/[token]` | Consume the link and set a new password | No |
| `GET` | `/api/staff/invitations` | List pending staff invitations | Yes |
| `POST` | `/api/staff/invitations` | Invite a staff member by email | Yes (owner) |
| `GET` | `/api/services` | List the studio's services | Yes |
| `POST` | `/api/services` | Create a service | Yes |
| `GET` | `/api/services/[id]` | Read one service | Yes |
| `PUT` | `/api/services/[id]` | Update a service | Yes |
| `DELETE` | `/api/services/[id]` | Delete a service (warns if appointments exist) | Yes |
| `GET` | `/api/clients` | List clients (search + pagination) | Yes |
| `POST` | `/api/clients` | Create a client | Yes |
| `GET` | `/api/clients/[id]` | Read a client with their appointments | Yes |
| `PUT` | `/api/clients/[id]` | Update a client or their notes | Yes |
| `DELETE` | `/api/clients/[id]` | Delete a client (warns if appointments exist) | Yes |
| `GET` | `/api/appointments` | List appointments, filter by status/date/staff | Yes |
| `POST` | `/api/appointments` | Book an appointment; `409` on overlap | Yes |
| `GET` | `/api/appointments/[id]` | Read one appointment | Yes |
| `PUT` | `/api/appointments/[id]` | Update date, time, client, or services | Yes |
| `PATCH` | `/api/appointments/[id]/status` | Update status (Scheduled, Completed, Cancelled, No-show) | Yes |
| `DELETE` | `/api/appointments/[id]` | Delete an appointment record | Yes |
| `GET` | `/api/dashboard/today` | Today's appointments plus upcoming preview | Yes |

**Error shape:** `{ "error": { "code": string, "message": string, "fields"?: Record<string, string> } }` — `400` validation, `401` unauthenticated, `403` wrong studio, `404` not found, `409` conflict (overlapping booking or duplicate email).

---

## Contributing

- `main` is protected — never push directly to it.
- Branch names: `feat/<slug>`, `fix/<slug>`, `docs/<slug>` (e.g. `feat/client-crud`).
- Every change lands through a pull request with at least one approving review from another team member.
- Commit small and often; PRs should stay under ~200 changed lines so reviews take 15–20 minutes.
- Team conventions and the governance rules we agreed on live in [`.specify/memory/constitution.md`](.specify/memory/constitution.md).

---

## Known Issues & Opportunities

- Status changes on appointments are not yet audited — a status history table would help resolve disputes about no-shows.
- The calendar renders a single day/week view; a month view and drag-to-reschedule are Phase 2.
- Overlap detection is done in application code; a Postgres exclusion constraint on `tstzrange` would make it race-proof under concurrent requests.
- Staff invitations expire after 7 days but there is no reminder or resend flow yet.
- No automated test suite yet; the spec's acceptance scenarios are written to be directly testable and should become the first Vitest/Playwright suite in a later sprint.

---

## License

Academic project for BYU-Idaho WDD 430. Not licensed for commercial use.
