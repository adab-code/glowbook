# W03 Team: Project & Code Review Report — GlowBook

Week 03 deliverables: team meeting summary, project setup evidence, architecture and design planning, and the pull-request code review.

---

## 1. Team Meeting Summary

**Synchronous meeting — Thursday, Sept 24, 2026 · 20:00 MDT (Microsoft Teams)**

- **Team members present:** Iván Chulde, Aaron Daniel Alfaro Barra
- **Team leader for Week 03:** Iván Chulde
- **Next team leader (Week 04):** Aaron Daniel Alfaro Barra

### Major decisions made

1. **Specification reviewed and confirmed.** We walked through [`docs/glowbook-spec.md`](https://github.com/adab-code/glowbook/blob/main/docs/glowbook-spec.md) story by story. Scope stayed at five user stories: account access, service catalog, client profiles, appointment calendar, daily dashboard. We added the two sections the Week 02 draft was missing — **Technical Requirements** and **Assumptions** — and explicitly pushed payments, client-facing self-booking, reminders, recurring appointments, and a month calendar view into a **Phase 2 backlog**. No functional requirement was cut.
2. **Database: PostgreSQL, accessed with Prisma 7.** Chosen over MongoDB because the domain is relational (an appointment must always resolve to a real client, service, and studio) and PostgreSQL is explicitly approved by the course. A local PostgreSQL 18 instance serves development. For deployment the app is hosted on Render with a Render Postgres instance, which the course allows under "Vercel or similar"; `DATABASE_URL` is the instance's internal connection string. Render's free tier exposes no separate pooler, so `DATABASE_URL` and `DIRECT_URL` are the same string, and pooling is handled in code by `@prisma/adapter-pg`.
3. **Authentication: Auth.js v5 with the Credentials provider.** We considered Clerk and chose Auth.js because GlowBook needs studio tenancy and staff invites — identity has to live in *our* `Account` / `StaffUser` tables so we can enforce the isolation rules ourselves. Duplicate-email and generic "invalid email or password" behaviour is enforced in `authorize()`.
4. **Component architecture agreed** (recorded in [`docs/architecture.md`](https://github.com/adab-code/glowbook/blob/main/docs/architecture.md)). Two route groups — `(auth)` for public pages and `(app)` for the authenticated shell — plus a `proxy.ts` guard. Data flows one way: route handler → Prisma → server component → client component state, with no client-side fetching library. Roughly 40 components planned across layout, shared, feature, and UI layers (22 built as of this submission); no feature folder may import from another feature folder.
5. **Design and branding agreed** (recorded in [`docs/design-system.md`](https://github.com/adab-code/glowbook/blob/main/docs/design-system.md)): a warm "Glow Rose / Studio Gold / Warm Stone" palette, **Geist Sans** for UI with **Fraunces** for display headings, a 4px spacing scale, and 44px minimum touch targets. **shadcn/ui was chosen as the shared component library** for Week 04 on top of Tailwind v4 tokens; the primitives built so far are hand-rolled on `class-variance-authority` and Radix and follow shadcn's structure, so the migration is additive rather than a rewrite.
6. **Data model agreed** (recorded in [`docs/data-model.md`](https://github.com/adab-code/glowbook/blob/main/docs/data-model.md)): eight entities with money stored as integer cents, appointments carrying a `priceCentsTotal` snapshot, `Restrict` on deletes that would orphan history, and `accountId` on every tenant-scoped table.
7. **Branching workflow practised and formalised.** Branch names are `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, and the agreed rule is that no work lands on `main` except through a pull request carrying at least one approving review from the other member, with a 24-hour turnaround expectation. The branch → commit → push → pull request → merge loop was exercised for real this week: **fourteen pull requests** (#9–#22) carried the Week 04 work into `main`, and the stacked series was merged in dependency order. **One part of the agreed rule is not yet satisfied:** the second member currently holds read-only access to the repository, so every one of those pull requests was authored and merged by the same person and no cross-member review has been recorded in the repository yet. Granting write access and landing one reviewed pull request closes this, and it is the first item on the Week 04 list.
8. **Board updated.** The project board now carries the issues split into frontend, backend, and infrastructure work, each scoped to 4–8 hours and assigned to the member who owns it, and the highest-priority P1 issues are attached to a **Week 04 milestone**.
9. **Async cadence agreed:** a short progress-and-blockers message in Teams by 5:00pm MDT each working day, blockers flagged immediately rather than at the next meeting, and the board updated before end of day so it stays a living tool.
10. **AI instructions drafted.** We captured the stack, architecture, data, styling, and workflow rules in [`.github/copilot-instructions.md`](https://github.com/adab-code/glowbook/blob/main/.github/copilot-instructions.md) so every AI assistant suggests code that fits this project. We will test and refine it as a Week 04 deliverable.
11. **Local environments verified.** Both members cloned the repository, ran `npm install`, and confirmed `npm run dev` serving the app on `localhost:3000` before any architecture work began.

### Responsibilities assigned

| Team member | Week 03 responsibility | Week 04 ownership (Week 04 milestone) |
|---|---|---|
| **Iván Chulde** (Week 03 lead) | Facilitated the meeting, captured decisions, kept the board current, drafted the design system and component architecture | Design tokens + shadcn/ui setup, `AppShell` layout, service catalog CRUD, client profiles CRUD, dashboard and calendar UI |
| **Aaron Daniel Alfaro Barra** | Ran the branching/merge practice, drafted the data model and AI instructions, verified both local environments | Prisma schema + migrations + seed, Auth.js credentials flow, session and `proxy.ts` guard, staff invitations, appointment API and overlap detection |

Shared: the appointment booking flow (FR-017 → FR-024) is co-owned — the API and validation by Aaron, the calendar UI by Iván — and is the first deliberately paired piece of work.

---

## 2. Project Setup

- **Team public GitHub repository:** https://github.com/adab-code/glowbook
  The [`README.md`](https://github.com/adab-code/glowbook/blob/main/README.md) lists both team members (Iván Chulde and Aaron Daniel Alfaro Barra) with their focus areas, plus the feature list, tech stack, local setup steps, deployment steps, environment-variable table, project structure, and the full API endpoint documentation.

- **Local development screenshot:**
  ![VS Code–style IDE with the glowbook project open, npm run dev in the terminal, and the GlowBook login page in the integrated browser preview](./images/w03-local-setup.png)
  What the screenshot shows: an IDE window (VS Code–style editor) with the `glowbook` project open, laid out in three panels. **Left** — the project file explorer with the active git branch. **Centre** — an integrated browser preview loaded at `http://localhost:3000/login`, rendering the GlowBook sign-in screen (the pink GlowBook logo, the "Welcome back" heading, the Email and Password fields, and the "Sign in" button). **Right** — a command terminal running `npm run dev`, showing the `next dev` output: Next.js 16.3.5 on Turbopack, the local server at `http://localhost:3000`, the loaded `.env`, and the "Ready" state.

- **GitHub Project Board (with issues and the Week 04 milestone):** https://github.com/users/adab-code/projects/2

  | # | Issue | Owner | Milestone | State at submission |
  |---|---|---|---|---|
  | 1 | Scaffold Next.js project with App Router, TypeScript and Tailwind | Iván | **Week 04** | Done — 17 app routes (12 pages + 5 route handlers) |
  | 3 | Design database schema and seed data: Account, StaffUser, Client, Service, Appointment | Aaron | **Week 04** | Done — 8 models, migration committed, seed verified |
  | 2 | Implement authentication: sign up, sign in, sign out, password reset | Aaron | **Week 04** | Done — Credentials sign-in, session tenancy claims, route gate |
  | 4 | Service catalog CRUD with validation and delete confirmation | Iván | **Week 04** | Done — archive-or-delete on referenced services |
  | 5 | Client profiles CRUD with notes and appointment history | Iván | **Week 04** | Done — refuses archiving while future appointments exist |
  | 6 | Appointment calendar: create, view, edit, cancel and overlap warning | Both | — | Not started — next slice |
  | 7 | Daily dashboard with today's and upcoming appointments | Iván | — | Done — four metrics plus the next five appointments |
  | 8 | Deploy application to Render with environment variables configured | Both | — | Not started |

  Eight issues, each scoped to 4–8 hours and split into setup, data, auth, feature, and infrastructure work. **Five issues carry the Week 04 milestone** — #1 through #5, the P1 set — and the remaining three are deliberately left out of the milestone as later sprint work. The *Area* grouping is carried on the board by the issue title prefixes `frontend:`, `backend:`, and `infra:`.

The *Owner* column records the split we agreed in the meeting, and it is **not** currently mirrored by GitHub's assignee field. Iván's write invitation to the repository had not been accepted, so GitHub rejects the assignment without a warning — `gh issue edit --add-assignee` still exits 0 — and issues #1, #4, #5 and #7 therefore show no assignee on the board, while #2, #3, #6 and #8 are assigned to Aaron. Nothing is misassigned; the four are simply unassigned. Assigning them is the first step once the invitation goes through.

  Six of the eight issues were complete at the time of this submission and had reached `main` through pull requests #9–#18. Issue #6, the appointment calendar, is the only piece of Week 04 work not started, and it leads the next sprint.

- **Supporting planning documents added this week** (all in the repository):
  - Component architecture: [`docs/architecture.md`](https://github.com/adab-code/glowbook/blob/main/docs/architecture.md)
  - Data model: [`docs/data-model.md`](https://github.com/adab-code/glowbook/blob/main/docs/data-model.md)
  - Design system: [`docs/design-system.md`](https://github.com/adab-code/glowbook/blob/main/docs/design-system.md)
  - AI assistant instructions: [`.github/copilot-instructions.md`](https://github.com/adab-code/glowbook/blob/main/.github/copilot-instructions.md)

---

## 3. Architecture & Design Planning

### 3.1 Data model

Full field-level specification: [`docs/data-model.md`](https://github.com/adab-code/glowbook/blob/main/docs/data-model.md). Summary of core entities, key fields, and relationships:

| Entity | Key fields | Relationships |
|---|---|---|
| **Account** (studio — tenancy root) | `id`, `studioName`, `slug` (unique), `timezone`, `currency`, `onboardingComplete` | Owns all staff, clients, services, and appointments (1:N to each) |
| **StaffUser** | `id`, `accountId`, `email` (unique), `passwordHash`, `role` (`OWNER`/`STAFF`), `firstName`, `lastName`, `isActive`, `lastLoginAt` | Belongs to one Account (1:N); performs many Appointments (1:N) |
| **StaffInvite** | `id`, `accountId`, `email`, `role`, `token` (hashed, 7-day expiry), `expiresAt`, `acceptedAt` | Sent by an Account (1:N); accepted into a StaffUser |
| **Client** | `id`, `accountId`, `firstName`, `lastName`, `email`, `phone`, `notes` (allergies/preferences), `isArchived` | Belongs to an Account (1:N); books many Appointments (1:N) |
| **Service** | `id`, `accountId`, `name`, `description`, `priceCents`, `durationMinutes`, `isActive` | Belongs to an Account (1:N); appears on many Appointments (N:M via the join table) |
| **Appointment** | `id`, `accountId`, `clientId`, `staffUserId`, `startsAt`, `endsAt`, `status` (`SCHEDULED`/`COMPLETED`/`CANCELLED`/`NO_SHOW`), `cancellationReason`, `priceCentsTotal` | Belongs to a Client (1:N) and optionally a StaffUser (1:N); has many AppointmentService rows (1:N) |
| **AppointmentService** (join) | `appointmentId` + `serviceId` (composite PK) | Resolves the Appointment ↔ Service many-to-many |
| **PasswordResetToken** | `id`, `staffUserId`, `tokenHash` (unique), `expiresAt` (1 hour), `usedAt` | Belongs to a StaffUser (1:N) |

The same model as a rendered diagram — 8 entities, 11 relationships — saved as [`images/w03-data-model.png`](./images/w03-data-model.png) so it can be submitted as an image rather than as Mermaid source:

![GlowBook data model: 8 entities with their key fields and 11 relationships, including the Appointment to Service many-to-many through AppointmentService](./images/w03-data-model.png)

```mermaid
erDiagram
    ACCOUNT ||--o{ STAFF_USER : "has staff"
    ACCOUNT ||--o{ STAFF_INVITE : "sends invites"
    ACCOUNT ||--o{ CLIENT : "serves"
    ACCOUNT ||--o{ SERVICE : "offers"
    ACCOUNT ||--o{ APPOINTMENT : "books"
    STAFF_USER ||--o{ APPOINTMENT : "performs"
    STAFF_USER ||--o{ STAFF_INVITE : "accepts"
    STAFF_USER ||--o{ PASSWORD_RESET_TOKEN : "requests"
    CLIENT ||--o{ APPOINTMENT : "books"
    APPOINTMENT ||--|{ APPOINTMENT_SERVICE : "includes"
    SERVICE ||--o{ APPOINTMENT_SERVICE : "booked in"

    ACCOUNT {
        uuid id PK
        string studioName
        string slug UK
        string timezone "IANA name"
        string currency "ISO 4217"
        boolean onboardingComplete
    }

    STAFF_USER {
        uuid id PK
        uuid accountId FK
        string email UK
        string passwordHash "bcrypt, nullable while invite pending"
        enum role "OWNER or STAFF"
        string firstName
        string lastName
        string phone
        boolean isActive
    }

    STAFF_INVITE {
        uuid id PK
        uuid accountId FK
        uuid acceptedById FK
        string email
        enum role "OWNER or STAFF"
        string token UK "hashed at rest, 7 day expiry"
    }

    CLIENT {
        uuid id PK
        uuid accountId FK
        string firstName
        string lastName
        string email
        string phone
        string notes "allergies and preferences"
        boolean isArchived
    }

    SERVICE {
        uuid id PK
        uuid accountId FK
        string name
        string description
        int priceCents "integer cents, never a float"
        int durationMinutes
        boolean isActive
    }

    APPOINTMENT {
        uuid id PK
        uuid accountId FK
        uuid clientId FK
        uuid staffUserId FK "nullable"
        datetime startsAt
        datetime endsAt "derived from service durations"
        enum status "SCHEDULED, COMPLETED, CANCELLED, NO_SHOW"
        string cancellationReason
        int priceCentsTotal "snapshot at booking time"
    }

    APPOINTMENT_SERVICE {
        uuid appointmentId PK,FK
        uuid serviceId PK,FK
    }

    PASSWORD_RESET_TOKEN {
        uuid id PK
        uuid staffUserId FK
        string tokenHash UK "hashed at rest"
        datetime expiresAt "1 hour"
        datetime usedAt "single use"
    }
```

**Relationship decisions the team made:**

- **`Account` is the isolation boundary.** Every tenant-scoped table carries `accountId`, and every query takes it from the session — never from user input. A record belonging to another studio returns `404`, not `403`, so IDs cannot be probed.
- **Appointment ↔ Service is many-to-many** through `AppointmentService` with a composite primary key, so one booking can cover several services (for example a lash fill plus a brow tint) and duplicate selections are impossible.
- **`Appointment.endsAt` is derived** from the selected services' `durationMinutes`, and **`priceCentsTotal` is a snapshot** taken at booking time, so editing a service price later never rewrites appointment history.
- **Delete policy:** deleting a studio cascades. A client or service referenced by appointments is protected at the schema level with `Restrict`, and the API handles it by archiving (`isArchived` / `isActive = false`) and returning `meta.archived` with an explanation, so the UI can warn and ask for confirmation rather than surfacing a raw constraint error. A service with no references is hard-deleted. Removing a staff member `SetNull`s their appointments, which become unassigned rather than vanishing.
- **Money is integer cents**, never a float, so totals never drift by a rounding error. **Timestamps are `timestamptz(3)`.** Each `Account` stores its own IANA `timezone` and every appointment time is rendered through that zone. Storing the instant instead of a wall-clock reading means a booking on either side of a daylight-saving change keeps its real UTC offset. The remaining work is on the presentation side, not the storage side: the appointment calendar has to convert the studio's day boundary into that zone before it can range-filter a single day, which is the first follow-up to Week 04 rather than something described here as already correct.
- **Indexes** on `StaffUser.email` (unique), `Client(accountId, lastName)`, `Service(accountId, isActive)`, `Appointment(accountId, startsAt)`, `Appointment(staffUserId, startsAt, endsAt)`, and `Appointment(clientId, startsAt)`.

**Referential integrity at a glance** — every foreign key in the schema, and what happens when the parent row is deleted:

| Child table | Parent | `onDelete` | Why |
|---|---|---|---|
| `StaffUser`, `StaffInvite`, `Client`, `Service`, `Appointment` | `Account` | `Cascade` | A studio owns its records outright; deleting the studio removes them together |
| `Appointment` | `Client` | `Restrict` | Appointment history is the reason the record is kept, so the API archives instead of erroring |
| `AppointmentService` | `Service` | `Restrict` | A service named in a booking cannot vanish from it |
| `AppointmentService` | `Appointment` | `Cascade` | The bridge rows have no meaning without their appointment |
| `Appointment` | `StaffUser` | `SetNull` | Removing a staff member leaves the booking, unassigned, rather than deleting it |
| `StaffInvite` | `StaffUser` | `SetNull` | The invitation stays as a record of who accepted it |
| `PasswordResetToken` | `StaffUser` | `Cascade` | A reset link is meaningless without the account it resets |

### 3.2 Design planning

Full specification with token values: [`docs/design-system.md`](https://github.com/adab-code/glowbook/blob/main/docs/design-system.md).

**Brand direction:** *calm, warm, precise* — a tool that removes anxiety about double bookings, aimed at solo professionals working from a phone between appointments. Tagline: "Your studio, beautifully organised."

**Colour palette** — defined once as Tailwind v4 `@theme` tokens in `src/app/globals.css` and consumed everywhere as `brand-*`, `accent-*`, `neutral-*`, plus semantic status pairs:

| Role | Scale |
|---|---|
| **Brand — Glow Rose** (primary actions, active nav, focus rings) | `50 #FDF2F7` · `100 #FAE6EF` · `200 #F4C9DC` · `300 #EBA3C1` · `400 #DE74A1` · `500 #CE4C81` · **`600 #B4346A` (primary button, links — 5.84:1 on white)** · `700 #932A57` (hover) · `800 #762449` · `900 #5F213D` |
| **Accent — Studio Gold** (highlights, "now" marker) | `100 #FAEECF` · `300 #EAC062` · `500 #C9861F` · `700 #855115` |
| **Neutral — Warm Stone** (surfaces, text, borders) | `50 #FAF8F7` · `100 #F3EFEE` · `200 #E6DEDA` (borders) · `300 #D2C7C2` · `400 #A99C97` · `500 #857874` · `600 #6B605C` (secondary text, 6.1:1) · `700 #574E4B` · `800 #3B3533` · `900 #221E1D` · `950 #14100F` (page background) |
| **Semantic** | success `#2F7D57` / `#E8F5EE` · warning `#B45309` / `#FDF3E3` · danger `#C0342B` / `#FBEBEA` · info `#2F6F8F` / `#E9F2F7` |
| **Appointment status mapping** | Scheduled → info · Completed → success · Cancelled → danger · No-show → warning. Always rendered with a text label, never colour alone |

**Typography**

| Role | Family | Treatment |
|---|---|---|
| Body / UI | **Geist Sans** (`next/font`) | Variable weight; `body` 16/24, `body-sm` 14/20, `label` 13/16 |
| Display / page titles | **Fraunces** (`next/font`, variable) | `h1` `clamp(1.75rem, 3vw, 2rem)`/1.2 at weight 600; `display` `clamp(2.5rem, 6vw, 3.5rem)` for the landing hero only |
| Times and prices | Geist Sans with `tabular-nums` | Keeps calendar slots and prices from shifting as digits change |

**Layout and spacing conventions**

- **4px base scale** using Tailwind's default steps, applied semantically: page gutter `px-4 sm:px-6 lg:px-8` · `space-y-4` between form fields · `gap-6` between cards · `space-y-8` between page sections · `p-4 sm:p-6` card padding · `gap-2` between an icon and its label · `gap-1 p-2` inside dense calendar blocks.
- **App shell:** CSS grid — fixed `w-64` sidebar at `lg` and above, sticky `h-16` topbar, independently scrolling content, content capped at `max-w-7xl`.
- **Mobile-first.** Below `lg` the sidebar collapses behind a hamburger in the topbar, using a Radix Dialog so focus is trapped and `Escape` closes it. Tables fall back to stacked cards on small screens so nothing ever scrolls horizontally. 375px is the primary design target.
- **Radii and elevation:** `0.5rem` controls, `1rem` cards, `rounded-full` badges; `shadow-xs` at rest → `shadow-sm` on hover → `shadow-md` for popovers and dialogs.
- **Motion:** 150ms hover, 200ms panels, 300ms page fades, all `ease-out` and wrapped in `motion-reduce` variants.
- **Shared UI library:** the team agreed on **shadcn/ui** as the Week 04 library, on top of Tailwind v4 tokens, so both members install identical primitives. Two things are honest gaps rather than completions at submission time: only **4 of the 14 planned primitives** are built — `button`, `card`, `input`, `label` in `src/components/ui/` — and **`components.json` has not been added yet**, so the "both members install identical versions" goal is not yet enforced by tooling. The built primitives are hand-rolled on `class-variance-authority` and Radix and follow shadcn's structure, which keeps the eventual migration additive rather than a rewrite. The other 10 planned primitives are `textarea`, `select`, `dialog`, `alert-dialog`, `dropdown-menu`, `table`, `badge`, `calendar`, `popover`, and `skeleton`. Seven shared components (`confirm-dialog`, `empty-state`, `form-field`, `page-header`, `spinner`, `status-badge`, `submit-button`) already cover the dialog, form, status, and empty-state work that several of those primitives would otherwise supply.

**Component architecture summary:** two route groups (`(auth)`, `(app)`) plus `src/proxy.ts` for auth interception. The architecture the team agreed in Week 03 plans **8 layout/shared components, ~19 feature components across `auth`/`dashboard`/`calendar`/`clients`/`services`/`staff`, and 14 UI primitives** — about 40 in total, recorded the same way in [`docs/architecture.md`](https://github.com/adab-code/glowbook/blob/main/docs/architecture.md).

As of this submission, 22 of those are built — 3 layout (`app-header`, `app-sidebar`, `auth-card`), 7 shared (`confirm-dialog`, `empty-state`, `form-field`, `page-header`, `spinner`, `status-badge`, `submit-button`), 8 feature (4 under `features/auth`, 2 under `features/clients`, 2 under `features/services`), and 4 UI primitives (`button`, `card`, `input`, `label`). Of these, **11 are used across two or more pages** (`card` in 10, `button` in 8, `page-header` in 7, `input`/`empty-state`/`form-field` in 6 each), which already clears the "at least 5 components used across multiple pages" requirement. `dashboard` is a page rather than a feature-component folder, and the `features/calendar` and `features/staff` folders are not built yet — `calendar` depends on the appointment work scheduled for Week 04, and `staff` on the invitation handlers.   A full component hierarchy diagram and the Week 04 priority ranking are in [`docs/architecture.md`](https://github.com/adab-code/glowbook/blob/main/docs/architecture.md). The hierarchy is also rendered here so it can be submitted as an image:

  ![GlowBook component hierarchy: the (auth) and (app) route groups, the AppShell layout, and the layout, shared, features, and ui component layers](./images/w03-component-hierarchy.png)

---

## 4. W03 Team: Code Review Report

**Pull Request reviewed:** https://github.com/ivanchulde/sacrament-meetings/pull/1

- **Repository (assigned teammate's):** https://github.com/ivanchulde/sacrament-meetings
- **Pull Request URL:** https://github.com/ivanchulde/sacrament-meetings/pull/1
- **PR title:** Complete Sacrament Meeting Planner
- **Branch:** `peer-code-review` → `main` · 4 commits · 19 files changed · +846 / −97
- **Preview deployment:** Vercel deployed the branch successfully; all checks passed, no conflicts with the base branch

### Review comment submitted on the pull request

> Overall, the implementation meets the main requirements of the checklist. The TypeScript data model is properly defined, there are five complete meeting records, and no `any` type is used in the modified files. The reusable components are present, and `MeetingDetail` displays the required meeting information. The routing, layouts, API routes, and typed data fetching are also implemented correctly.
>
> One area I would recommend checking is the cleanup of the original Next.js template code. The diff shows some old imports and template content in `app/layout.tsx` and `app/page.tsx`. If any of that code remains in the final files, it should be removed to avoid unused imports and unnecessary code. Other than that, the implementation follows the checklist well.

**What I checked:** the TypeScript data model and whether the five meeting records are complete, that no `any` type slipped into the modified files, that the reusable components are actually shared across pages, that `MeetingDetail` renders every required field, and that routing, layouts, the API routes, and typed data fetching are all correctly implemented.

**The one actionable finding:** leftover `create-next-app` template code in `app/layout.tsx` and `app/page.tsx` — old imports and boilerplate markup that should be removed so the final files carry no unused imports.

### Vercel deployment review notes

Tested the Vercel preview deployment of the same branch on **PC / Chrome**. No issues were found on any route:

- `/api/meetings` — no problems were found.
- `/api/meetings/1` — no problems were found.
- `/meetings` — no problems were found.
- `/meetings/1` — no problems were found.
- `/meetings/current` — no problems were found.
- `/meetings` layout — no problems were found.
