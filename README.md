# GlowBook

Booking and client management for independent beauty professionals and small studios — lash technicians, hairstylists, nail artists, and estheticians. One place to schedule appointments, keep client history and notes, and manage the services a studio offers, replacing the WhatsApp/Instagram-DM juggling and paper notebooks these businesses run on today.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · PostgreSQL (Render) + Prisma · Auth.js v5 · shadcn/ui · Render

---

## Final Submission Status (W06) — for the evaluator

Everything below is live and verifiable right now:

| Item | Link / Location |
|---|---|
| Live application | https://glowbook-lzts.onrender.com |
| Product demo summary (2–3 paragraphs) | [`docs/product-demo.md`](docs/product-demo.md) |
| Lighthouse mobile evidence + contrast audit | [`docs/lighthouse-w06.md`](docs/lighthouse-w06.md) |
| Weekly sprint & code-review reports | [`docs/w02-reports.md`](docs/w02-reports.md) … [`docs/w06-reports.md`](docs/w06-reports.md) |
| Demo credentials + grader test steps | [Demo credentials](#demo-credentials) and [How to test](#how-to-test-for-the-grader) below |

Delivered and working: sign-up / sign-in / sign-out with protected routes (Auth.js v5); five dynamic views (dashboard, services, clients, appointments, settings); full CRUD on services, clients, and appointments; OWNER/STAFF role enforcement (destructive deletes are owner-only, `403` for staff); editable studio settings with in-place session refresh; a 30-test Vitest suite in CI; a responsive mobile nav; AA-clean text contrast; Lighthouse (mobile) 98/100/100/100 on `/login` and 84/100/100/60 on `/dashboard` (SEO is `noindex` by design on private routes). Known gaps are listed under [Known Issues](#known-issues--opportunities-for-improvement) — nothing shipped is overstated here.

---

## Team Members

| Name | GitHub | Focus areas |
|---|---|---|
| Aaron Daniel Alfaro Barra | [@adab-code](https://github.com/adab-code) | Team lead (Week 02), data model, authentication, API route handlers |
| Iván Chulde | [@ivanchulde](https://github.com/ivanchulde) | Team lead (Week 03), design system, component library, dashboard & calendar UI |

> **Solo completion note.** Iván withdrew from the course during the project and took no part from Week 04 on. All remaining work (Weeks 04–06: RBAC enforcement, editable settings, unit tests, mobile nav, and every report) was completed solo by Aaron — see `docs/w04-reports.md` §1. Both names stay listed above because both contributed to the shipped product.

---

## Features

The MVP scope comes from [`docs/glowbook-spec.md`](docs/glowbook-spec.md) and is tracked on the [GitHub Project Board](https://github.com/users/adab-code/projects/2).

- **Account access** — studio sign-up, sign-in, sign-out, password reset, staff invites (planned — see [Known Issues](#known-issues--opportunities-for-improvement)), per-studio data isolation
- **Service catalog** — CRUD with required-field validation and delete confirmation when appointments reference a service
- **Client profiles** — CRUD with free-form notes (allergies, preferences) and appointment history
- **Appointment calendar** — create, view, edit, and cancel bookings with double-booking (overlap) detection
- **Daily dashboard** — today's appointments in chronological order plus an upcoming preview, with status updates inline
- **Discoverability** — per-page titles and descriptions, a code-generated Open Graph image, and `noindex` on the private `(app)` routes so studio data is never surfaced to crawlers

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
| `DIRECT_URL` | **Not used.** Nothing reads it — not `prisma7.config.ts`, not the schema, not any source file. It survives in `.env.example` from the usual Prisma convention of separating migration traffic from app traffic. Prisma 7 reads `DATABASE_URL` for both, and Render's free tier exposes no separate pooler that would justify wiring one up |
| `AUTH_SECRET` | Secret used by Auth.js to sign session cookies (`npx auth secret` to generate) |
| `AUTH_TRUST_HOST` | Set to `true` on Render so Auth.js trusts the `X-Forwarded-Host` header from Render's proxy |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the deploy (e.g. `https://glowbook-lzts.onrender.com`). Used for `metadataBase` and Open Graph links; defaults to `http://localhost:3000` locally |

Never commit `.env.local` — `.gitignore` already excludes `.env*`.

### 3. Set up the database

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

Sign in with a demo account (see Demo credentials below), then open `/services`: the list is rendered by `service-manager.tsx` calling `GET /api/services`, which reads the studio's rows via Prisma. Create/edit/archive a service and watch the list update — that is the client → route handler → database loop.

### Demo credentials

Seeded by `prisma/seed.ts` (`npx prisma db seed`):

| Role | Email | Password |
|---|---|---|
| Owner | `owner@glowbook.dev` | value of `SEED_PASSWORD` (`GlowBook!2026` by default) |
| Staff | `staff@glowbook.dev` | same as above |

Never use these on a real database — the seed resets the `aurea-lashes` studio and refuses to run in production unless `ALLOW_PRODUCTION_SEED=1` + `SEED_ALLOWED_STUDIO=aurea-lashes`.

### How to test (for the grader)

Auth provider: **Auth.js v5** (Credentials provider; session in a signed cookie — no external provider needed).

1. **Sign in as OWNER** — `owner@glowbook.dev` / `GlowBook!2026` (or the `SEED_PASSWORD` value if overridden). Land on `/dashboard` with today's and upcoming appointments — real rows from the seeded studio.
2. **Exercise two-model CRUD** — `/services`: create/edit/archive a service (archiving keeps past bookings). `/clients`: create/edit/archive a client with notes. `/appointments`: book a slot (overlap returns `409`), edit, change status, cancel.
3. **Verify role enforcement** — open `/settings` as OWNER, change the studio name/timezone/currency, save: the sidebar branding updates with no sign-out. Then sign in as STAFF (`staff@glowbook.dev`, same password): `/settings` is read-only, Archive/Delete buttons are hidden, and calling `DELETE /api/services/:id` directly returns `403`.
4. **Sign-up flow** — `/signup` creates a brand-new studio + OWNER account, proving multi-tenancy (each studio only sees its own data).
5. **Sign-out** — the header menu signs out and the auth gate (`proxy.ts`) bounces logged-out visitors back to `/login`.

### Other scripts

```bash
npm run build        # production build
npm run start        # serve the production build
npm run lint         # ESLint
npm run test         # Vitest unit suite (30 tests)
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

4. Add the environment variables under **Environment** for the web service: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, and `NEXT_PUBLIC_SITE_URL=https://<your-service>.onrender.com` (used for `metadataBase` and Open Graph links). Migrations are run manually from a local machine — see [`docs/data-model.md`](docs/data-model.md) §1.
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

The structure below reflects the repository as it stands after the Week 06 milestone (auth + metadata + services/clients/appointments CRUD + OWNER/STAFF role enforcement + editable settings + Vitest unit suite).

```
src/
  auth.ts              → Auth.js v5 config: Credentials provider, JWT session claims
  proxy.ts             → optimistic auth gate (Next 16 renamed middleware.ts → proxy.ts)
  app/
    layout.tsx         → root layout, next/font (Geist, Geist_Mono, Fraunces)
    globals.css        → Tailwind v4 design tokens in an @theme block
    (auth)/            → login, signup, forgot-password, reset-password
    (app)/            → authenticated shell: dashboard, services, clients, appointments*, team*, settings
    api/               → route handlers (client → server → DB)
  components/
    ui/                → design-system primitives: button, card, input, label
    shared/            → form-field, submit-button, confirm-dialog, status-badge, empty-state, page-header, spinner
    layout/            → auth-card, app-sidebar, app-header
    features/          → auth/, services/, clients/, appointments/, settings/  *(staff/ not built yet)*
  lib/
    db.ts              → Prisma 7 client singleton with the @prisma/adapter-pg driver adapter
    auth/              → session.ts (requireUser / requireOwner), actions.ts (server actions)
    api/errors.ts      → ApiError + the shared JSON error envelope
    validations/       → Zod 4 schemas shared by forms and route handlers
    utils/             → format, tokens, api-client, datetime
  types/               → next-auth module augmentation
vitest.config.ts     → Vitest unit suite (30 tests: datetime, schemas, tokens, format)
prisma/
  schema.prisma, migrations/, seed.ts
docs/
  glowbook-spec.md   → the project specification (authoritative)
  architecture.md    → routes, components, hierarchy, Week 04 priority ranking
  data-model.md      → entities, fields, relationships
  design-system.md   → palette, typography, spacing
  w02-reports.md, w03-reports.md, w04-reports.md, w05-reports.md
specs/001-glowbook-booking/  → original Spec-Kit working spec (superseded by docs/glowbook-spec.md)
.github/copilot-instructions.md → AI assistant rules for the whole team
```

\* `team` is a stub — see [Known Issues](#known-issues--opportunities-for-improvement). `settings` is editable for OWNER since Week 06 (`PATCH /api/account`); STAFF sees it read-only. `appointments` is a working day-view with book/edit/cancel/status (month view is Phase 2).

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
| `GET` | `/api/appointments` | List appointments, filter by status/date | Yes |
| `POST` | `/api/appointments` | Book an appointment; `409` on overlap | Yes |
| `GET` | `/api/appointments/[id]` | Read one appointment | Yes |
| `PATCH` | `/api/appointments/[id]` | Update date, time, client, or services | Yes |
| `PATCH` | `/api/appointments/[id]/status` | Update status (Scheduled, Completed, Cancelled, No-show) | Yes |
| `DELETE` | `/api/appointments/[id]` | Delete an appointment record | Yes |
| `PATCH` | `/api/account` | Update studio name, timezone, currency | Yes (owner) |

Sign-up, sign-out, and password reset are React Server Actions in `src/lib/auth/actions.ts`, not REST endpoints — the session cookie is issued by Auth.js.

### Planned (not yet implemented)

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `GET` | `/api/staff/invitations` | List pending staff invitations | Yes |
| `POST` | `/api/staff/invitations` | Invite a staff member by email | Yes (owner) |
| `GET` | `/api/services/[id]` | Read one service | Yes |
| `GET` | `/api/clients/[id]` | Read a client with their appointments | Yes |

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

- **Appointment month view** — `/appointments` is a working single-day view with book/edit/cancel/status plus staff-scoped overlap detection (`409`). A month grid and drag-to-reschedule are Phase 2.
- **Staff invitations** — the `StaffInvite` model and `requireOwner()` exist, but there is no `/api/staff/invitations` handler and `/team` shows an empty state.
- **Studio settings editing** — implemented in Week 06: `PATCH /api/account` (owner-only) + `SettingsForm`, with the session refreshed in place via `useSession().update()`. STAFF sees `/settings` read-only.

**Already handled (kept here because older milestones listed them as gaps):**

- Route boundaries exist: `src/app/(app)/error.tsx` (retry + back to dashboard), `src/app/(app)/loading.tsx` (spinner, `role="status"`), `src/app/not-found.tsx` (branded 404 with way back).
- Day/week windows resolve in the studio's `Account.timezone` (`zonedDayBounds` / `zonedWeekBounds`); times render through the same zone.

**Known limitations of what is built:**

- Overlap detection is two layers: the application-level check (`assertNoOverlap`) returns a friendly 409 naming the clash, and the `appointment_no_overlap` Postgres exclusion constraint (migration `20261011035328_appointment_overlap_exclusion`) makes it race-safe — a request that slips past the check fails its write and gets the same 409. Cancelled rows collapse to an empty range so they free their slot while surviving as history.
- Password-reset links are printed to the server console rather than emailed — there is no mail provider wired up yet.
- Single-day schedule view only; a month view and drag-to-reschedule are Phase 2.
- **Unit test suite** — Vitest, 30 tests (`npm run test`, also a CI step): day/week datetime bounds incl. DST transitions, Zod schema regressions from earlier sprints, token properties, money/time formatting. Database-backed helpers are excluded from the suite by design (they throw at import without `DATABASE_URL`); Playwright end-to-end is the planned second half.

## Accessibility & Performance

- **Text contrast:** every text/background pair meets WCAG AA (body, links, buttons, and headings meet AAA) — verified by computed ratios and by Lighthouse with zero `color-contrast` violations on all audited routes.
- **Lighthouse (mobile):** `/login` 98/100/100/100, `/dashboard` 84/100/100/60 — the dashboard SEO score is the intentional `noindex` on private routes. Full method, scores, and strongest/weakest analysis: [`docs/lighthouse-w06.md`](docs/lighthouse-w06.md).

---

## License

Academic project for BYU-Idaho WDD 430. Not licensed for commercial use.
