# GlowBook

Booking and client management for independent beauty professionals and small studios — lash technicians, hairstylists, nail artists, and estheticians. One place to schedule appointments, keep client history and notes, and manage the services a studio offers, replacing the WhatsApp/Instagram-DM juggling and paper notebooks these businesses run on today.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · PostgreSQL (Render) + Prisma · Auth.js v5 · shadcn/ui · Render

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
| Database | PostgreSQL (Render free tier) + Prisma | Relational integrity across studios, clients, services, appointments |
| Auth | Auth.js v5, Credentials provider | Course default; keeps identity in our own `Account`/`StaffUser` tables |
| Hosting | Render | Course allows "Vercel or similar"; chosen for familiarity. See the [free tier limits](#free-tier-limits--read-this-before-you-grade) before relying on a deploy |

---

## Getting Started

### Prerequisites

- Node.js 20+ (developed and pinned on Node 24)
- npm 10+
- A Render account for both the web service and the PostgreSQL instance
- For local development, a PostgreSQL 18 database (local server or any managed instance)

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
| `DATABASE_URL` | PostgreSQL connection string the app uses at runtime. On Render this is the instance's **Internal Database URL**; locally it points at `localhost:5432` |
| `DIRECT_URL` | Direct connection string used by Prisma migrations. On Render use the same internal URL, since Render does not expose a separate pooler on the free tier |
| `AUTH_SECRET` | Secret used by Auth.js to sign session cookies (`npx auth secret` to generate) |
| `AUTH_TRUST_HOST` | Set to `true` on Render so Auth.js trusts the `X-Forwarded-Host` header from Render's proxy |

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

## Deploying to Render

The course constitution allows "Vercel or similar", so this project is hosted on **Render**, as a Web Service.

1. Create the database first: **New → Postgres**. Name it, pick the region closest to your users, and choose the **Free** plan. Copy the **Internal Database URL**.
2. Create the app: **New → Web Service**, connected to this repository. Render detects Node.js from the `engines` field in `package.json`.
3. Use these settings:

   | Setting | Value |
   |---|---|
   | Build command | `npm ci && npm run build` |
   | Start command | `npm run start` |
   | Node version | from `engines` in `package.json` (24) |
   | Health check path | `/login` |

4. Add the environment variables under **Environment** for the web service: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`.
5. In the **Postgres** instance settings, open **Access** and add the web service. Without this the service cannot reach the database over Render's internal network.
6. Run migrations once against the production database — Render will not do it for you:

   ```bash
   # from a local machine, with DATABASE_URL pointed at the Render instance
   npx prisma migrate deploy
   npx prisma db seed          # optional: demo studio, services, and a login
   ```

### Free tier limits — read this before you grade

Render's free tier is a **development tier, not a production tier**, and Render's own documentation says not to use it for production applications. We use it deliberately, so the limits are written down rather than discovered:

| Limit | What it means for this project |
|---|---|
| **The database expires after 30 days** | The free Postgres instance is deleted when it expires, and the deployed app stops resolving queries. To restore, create a new instance, redeploy, and re-run migrations. Nothing in the code depends on Render hosting the database — the schema lives in `prisma/migrations/`, so this is a re-provision, not a rewrite. |
| **The web service spins down after 15 minutes idle** | The first request after an idle period takes roughly a minute while Render restarts the container. Expect a slow first load, not an error. |
| **No `pre-deploy` command on the free plan** | Render only offers a pre-deploy hook on paid web services, so `prisma migrate deploy` cannot be automated as part of a deploy. It is a manual step, listed above. |
| **750 instance hours per month** | One web service and one database fit inside this allowance. |
| **Deploys restart on git push to the connected branch** | Every merge to `main` triggers a build. A build failure leaves the previous version serving traffic. |

The first three are the ones that will actually affect a reviewer. A mid-session deadline landing on day 31 is the realistic failure mode for this setup.

If this project ever needs to be genuinely live, the minimum fix is a paid Render Postgres instance; nothing else about the deployment changes.

---

## Project Structure

The structure below reflects the repository as it stands after the Week 04 milestone (issues #1–#5).

```
src/
  auth.ts              → Auth.js v5 config: Credentials provider, JWT session claims
  proxy.ts             → optimistic auth gate (Next 16 renamed middleware.ts → proxy.ts)
  app/
    layout.tsx         → root layout, next/font (Geist, Geist_Mono, Fraunces)
    globals.css        → Tailwind v4 design tokens in an @theme block
    (auth)/            → login, signup, forgot-password, reset-password
    (app)/             → authenticated shell: dashboard, services, clients, appointments*, team*, settings*
    api/               → route handlers (client → server → DB)
  components/
    ui/                → design-system primitives: button, card, input, label
    shared/            → form-field, submit-button, confirm-dialog, status-badge, empty-state, page-header, spinner
    layout/            → auth-card, app-sidebar, app-header
    features/          → auth/, services/, clients/  *(appointments/ and staff/ not built yet)*
  lib/
    db.ts              → Prisma 7 client singleton with the @prisma/adapter-pg driver adapter
    auth/              → session.ts (requireUser / requireOwner), actions.ts (server actions)
    api/errors.ts      → ApiError + the shared JSON error envelope
    validations/       → Zod 4 schemas shared by forms and route handlers
    utils/             → format, tokens, api-client
  types/               → next-auth module augmentation
prisma/
  schema.prisma, migrations/, seed.ts
docs/
  glowbook-spec.md   → the project specification (authoritative)
  architecture.md    → routes, components, hierarchy, Week 04 priority ranking
  data-model.md      → entities, fields, relationships
  design-system.md   → palette, typography, spacing
  w02-reports.md, w03-reports.md
specs/001-glowbook-booking/  → original Spec-Kit working spec (superseded by docs/glowbook-spec.md)
.github/copilot-instructions.md → AI assistant rules for the whole team
```

\* `appointments`, `team`, and `settings` are stubs or read-only — see [Known Issues](#known-issues--opportunities-for-improvement).

**Rendering strategy:** server components by default; `"use client"` only where interactivity is required (forms, optimistic list updates). Data fetching happens in server components and route handlers, not in client components.

---

## API Documentation

All endpoints are route handlers under `src/app/api`. They return JSON, require an authenticated session unless noted, and are scoped to the signed-in user's studio.

> **Status:** the table below is the agreed API surface from [`docs/glowbook-spec.md`](docs/glowbook-spec.md) and [`docs/architecture.md`](docs/architecture.md). Implemented handlers are marked ✅; the rest are planned and have no code yet.

### Implemented

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `GET`/`POST` | `/api/auth/[...nextauth]` | Auth.js catch-all: credentials sign-in, session, CSRF | No |
| `GET` | `/api/services` | List the studio's services | Yes |
| `POST` | `/api/services` | Create a service | Yes |
| `PATCH` | `/api/services/[id]` | Update a service | Yes |
| `DELETE` | `/api/services/[id]` | Delete a service, or archive it if appointments reference it | Yes |
| `GET` | `/api/clients` | List non-archived clients with appointment counts | Yes |
| `POST` | `/api/clients` | Create a client | Yes |
| `PATCH` | `/api/clients/[id]` | Update a client's details, notes, or archived flag | Yes |
| `DELETE` | `/api/clients/[id]` | Archive a client (blocked while they have upcoming appointments) | Yes |

Sign-up, sign-out, and password reset are React Server Actions in `src/lib/auth/actions.ts`, not REST endpoints — the session cookie is issued by Auth.js.

### Planned (not yet implemented)

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `GET` | `/api/staff/invitations` | List pending staff invitations | Yes |
| `POST` | `/api/staff/invitations` | Invite a staff member by email | Yes (owner) |
| `GET` | `/api/services/[id]` | Read one service | Yes |
| `GET` | `/api/clients/[id]` | Read a client with their appointments | Yes |
| `GET` | `/api/appointments` | List appointments, filter by status/date/staff | Yes |
| `POST` | `/api/appointments` | Book an appointment; `409` on overlap | Yes |
| `GET` | `/api/appointments/[id]` | Read one appointment | Yes |
| `PATCH` | `/api/appointments/[id]` | Update date, time, client, or services | Yes |
| `PATCH` | `/api/appointments/[id]/status` | Update status (Scheduled, Completed, Cancelled, No-show) | Yes |
| `DELETE` | `/api/appointments/[id]` | Delete an appointment record | Yes |

**Error shape:** `{ "error": { "code": string, "message": string, "fields"?: Record<string, string> } }` — `400` validation, `401` unauthenticated, `403` wrong studio, `404` not found, `409` conflict (overlapping booking or duplicate email).

---

## Contributing

- `main` is protected — never push directly to it.
- Branch names: `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, `chore/<slug>` (e.g. `feat/client-crud`).
- Every change lands through a pull request with at least one approving review from another team member.
- Commit small and often; PRs should stay under ~200 changed lines so reviews take 15–20 minutes.
- Formatting is Prettier (`.prettierrc`): run `npx prettier --write .` before committing. `npm run typecheck`, `npm run lint`, and `npx prettier --check .` must all pass before requesting review.
- Team conventions and the governance rules we agreed on live in [`.specify/memory/constitution.md`](.specify/memory/constitution.md).

---

## Known Issues & Opportunities

**Not built yet (next milestones):**

- **Appointment calendar** — the core value of the product. `/appointments` is a stub and no appointment route handlers exist. Booking, overlap detection, status transitions, and the calendar view are the next slice (board issue #6, P1).
- **Staff invitations** — the `StaffInvite` model and `requireOwner()` exist, but there is no `/api/staff/invitations` handler and `/team` is a stub (board issue #8 backlog).
- **Studio settings editing** — `/settings` is read-only; there is no update path.
- **No `error.tsx` / `loading.tsx` / `not-found.tsx` boundaries** — failures currently fall through to Next.js defaults.

**Known limitations of what is built:**

- Overlap detection will be application-level, not a Postgres exclusion constraint on `tstzrange`. That is race-proof and is deferred to Phase 2.
- The dashboard's "today" and "this week" windows are computed in server-local time rather than the studio's `Account.timezone`, so a UTC host reports the wrong day boundary for studios outside UTC. Times are still rendered through `formatTime(..., timezone)`.
- Password-reset links are printed to the server console rather than emailed — there is no mail provider wired up yet.
- Single-day schedule view only; a month view and drag-to-reschedule are Phase 2.
- No automated test suite yet; the spec's acceptance scenarios are written to be directly testable and should become the first Vitest/Playwright suite in a later sprint.

---

## License

Academic project for BYU-Idaho WDD 430. Not licensed for commercial use.
