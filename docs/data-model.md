# GlowBook — Data Model

**Status:** agreed in the Week 03 team meeting · **Last updated:** 2026-09-24
**Companion docs:** [`architecture.md`](./architecture.md) · [`design-system.md`](./design-system.md) · [`glowbook-spec.md`](./glowbook-spec.md)

---

## 1. Database decision

| Decision | Choice | Rationale |
|---|---|---|
| Database | **PostgreSQL on Render** (free tier instance) | The course allows any managed platform the team chooses. Relational integrity matters here: an appointment must always point at a real client, a real service, and a real studio. Render hosts both the database and the web service, which keeps the connection string and the network path in one place |
| ORM | **Prisma 7.10** | Typed client generated from one schema file, migrations checked into the repo, and `prisma studio` for verifying seed data. Keeps every query type-checked under `strict` TypeScript. On v7 the datasource block carries no `url` and the connection string, migrations path, and seed command live in `prisma7.config.ts` |
| Auth | **Auth.js v5, Credentials provider** | Course default. Identity lives in our own tables so the studio tenancy rules (FR-006/FR-007) are enforced in our code, not delegated to a vendor |
| IDs | **UUIDv4 via Prisma `@default(uuid())`** | Random rather than sequential, so IDs cannot be enumerated on public endpoints. The value is produced by **Prisma, in the query engine, when the row is inserted** — not by PostgreSQL and not by the browser. The column is still typed `@db.Uuid`, so PostgreSQL stores a real UUID and rejects anything malformed. The original plan called these UUIDv7, which `uuid()` does not produce; swapping to `@default(uuidv7())` is available if the index locality becomes worth it |
| Money | **Integer cents (`Int`), never floats** | `priceCents` avoids the rounding errors that `Decimal`/float pricing introduces in totals |
| Time | **`DateTime` as `timestamptz(3)`, with a time zone** | Every instant is stored with an offset, so an appointment never drifts when the server, the browser, and the studio are in different zones. Each `Account` separately stores its own IANA `timezone`, and that zone — not the server's — decides what "today" means, so day and week boundaries are computed with `src/lib/utils/datetime.ts` before querying. `startsAt`/`endsAt` are absolute instants; `timezone` is presentation and day-boundary policy only |

**Deployment note:** at runtime the app uses a single variable, `DATABASE_URL`, set to the Render Postgres instance's **Internal Database URL**. An earlier draft of this document also described `DIRECT_URL`, kept for the usual Prisma convention of separating migration traffic from application traffic. Nothing reads it — not `prisma7.config.ts`, not the schema, not any source file — so it is documented here as a leftover rather than a requirement, and Render exposes no pooler on the free tier that would justify adding one. `DATABASE_URL` is not used at build time, though the build does need the variable to *exist*: `src/lib/db.ts` throws at import time when it is missing, and Next evaluates route modules while collecting page data.

Migrations are a **manual step** on Render's free tier: `npx prisma migrate deploy`, run from a local machine against the production database. Render only offers an automatic pre-deploy hook on paid web services, so there is no build-time migration on any plan we are on. If the free database instance expires and is recreated, the schema is rebuilt by re-running the checked-in migrations in `prisma/migrations/`.

---

## 2. Entity relationship diagram

```mermaid
erDiagram
    ACCOUNT ||--o{ STAFF_USER : "has staff"
    ACCOUNT ||--o{ STAFF_INVITE : "sends invites"
    ACCOUNT ||--o{ CLIENT : "serves"
    ACCOUNT ||--o{ SERVICE : "offers"
    ACCOUNT ||--o{ APPOINTMENT : "books"
    STAFF_USER ||--o{ APPOINTMENT : "performs"
    STAFF_USER ||--o{ STAFF_INVITE : "accepted as"
    CLIENT ||--o{ APPOINTMENT : "books"
    APPOINTMENT ||--|{ APPOINTMENT_SERVICE : "includes"
    SERVICE ||--o{ APPOINTMENT_SERVICE : "booked in"
    STAFF_USER ||--o{ PASSWORD_RESET_TOKEN : "requests"

    ACCOUNT {
        uuid id PK
        string studioName
        string slug UK
        string timezone "IANA, e.g. America/Boise"
        string currency "ISO 4217, default USD"
        boolean onboardingComplete
        datetime createdAt
        datetime updatedAt
    }

    STAFF_USER {
        uuid id PK
        uuid accountId FK
        string email UK
        string passwordHash "bcrypt, nullable for invite-pending"
        enum role "OWNER | STAFF"
        string firstName
        string lastName
        string phone
        boolean isActive
        datetime emailVerifiedAt
        datetime lastLoginAt
        datetime createdAt
        datetime updatedAt
    }

    STAFF_INVITE {
        uuid id PK
        uuid accountId FK
        string email
        enum role "STAFF | OWNER"
        string token UK "hashed, 7-day expiry"
        datetime expiresAt
        datetime acceptedAt
        datetime createdAt
    }

    CLIENT {
        uuid id PK
        uuid accountId FK
        string firstName
        string lastName
        string email
        string phone
        text notes "allergies, preferences"
        boolean isArchived "soft delete"
        datetime createdAt
        datetime updatedAt
    }

    SERVICE {
        uuid id PK
        uuid accountId FK
        string name
        text description
        int priceCents
        int durationMinutes
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    APPOINTMENT {
        uuid id PK
        uuid accountId FK
        uuid clientId FK
        uuid staffUserId FK "nullable = unassigned"
        datetime startsAt
        datetime endsAt "denormalized from service durations"
        enum status "SCHEDULED | COMPLETED | CANCELLED | NO_SHOW"
        text cancellationReason
        int priceCentsTotal "snapshot at booking time"
        datetime createdAt
        datetime updatedAt
    }

    APPOINTMENT_SERVICE {
        uuid appointmentId PK,FK
        uuid serviceId PK,FK
    }

    PASSWORD_RESET_TOKEN {
        uuid id PK
        uuid staffUserId FK
        string tokenHash UK
        datetime expiresAt "1 hour"
        datetime usedAt
    }
```

---

## 3. Entities in detail

Every table carries `createdAt` / `updatedAt` (`@updatedAt` handled by Prisma) and, except where noted, `accountId` for tenant isolation.

### 3.1 `Account` (the studio — tenancy root)

| Field | Type | Rules |
|---|---|---|
| `id` | `uuid` | PK, `uuid()` |
| `studioName` | `string(120)` | Required; set at sign-up (FR-001) |
| `slug` | `string(140)` | Required, **unique** — future public booking URL |
| `timezone` | `string(64)` | IANA name; drives calendar rendering. Sign-up currently hardcodes `America/Boise` — reading the browser's zone is planned, not done |
| `currency` | `string(3)` | ISO 4217, default `USD` |
| `onboardingComplete` | `boolean` | Default `false`. Nothing in `src/` reads or writes it yet — the first-service hook that was meant to set it is not built |
| `createdAt` / `updatedAt` | `DateTime` | — |

**This is the isolation boundary.** Every query filters by `accountId` taken from the session — never from user input. There is no `lib/queries/` layer: server components call Prisma inline, and route handlers use the `findOwned*` helpers in each route module.

### 3.2 `StaffUser`

| Field | Type | Rules |
|---|---|---|
| `id` | `uuid` | PK |
| `accountId` | `uuid` | FK → `Account.id`, `onDelete: Cascade`, indexed |
| `email` | `string(255)` | **Unique globally** — this is what enforces FR-002 (no duplicate accounts across studios) |
| `passwordHash` | `string(255)` | bcrypt, cost 12; nullable only while an invite is pending |
| `role` | `enum` | `OWNER` \| `STAFF`; first signup of an account is always `OWNER` |
| `firstName` / `lastName` | `string(80)` | Required |
| `phone` | `string(32)` | Optional |
| `isActive` | `boolean` | Default `true`; deactivating blocks sign-in without deleting history |
| `emailVerifiedAt` | `DateTime?` | Set when a password reset link is consumed |
| `lastLoginAt` | `DateTime?` | — |

### 3.3 `StaffInvite`

| Field | Type | Rules |
|---|---|---|
| `id` | `uuid` | PK |
| `accountId` | `uuid` | FK → `Account.id`, Cascade |
| `email` | `string(255)` | Indexed; no unique constraint — re-inviting after expiry is allowed |
| `role` | `enum` | Defaults to `STAFF`; the role the invitee will receive |
| `token` | `string(255)` | Unique, **SHA-256 hashed** at rest (the column holds the digest, never the token); single use |
| `acceptedById` | `uuid?` | FK → `StaffUser.id`, `onDelete: SetNull` |
| `expiresAt` | `DateTime` | `createdAt + 7 days` |
| `acceptedAt` | `DateTime?` | Null while pending; the invite list filters on this |

Backs FR-007. Accepted invites create the `StaffUser` row and set `acceptedAt` and `acceptedById` in one transaction. `acceptedById` is nullable with `SetNull` rather than required, so deleting a staff member later does not cascade-delete the invite record and erase the audit trail of who joined.

### 3.4 `Client`

| Field | Type | Rules |
|---|---|---|
| `id` | `uuid` | PK |
| `accountId` | `uuid` | FK → `Account.id`, Cascade, indexed |
| `firstName` | `string(80)` | **Required** (FR-016) |
| `lastName` | `string(80)` | **Required** |
| `email` | `string(255)?` | Optional; at least one of email/phone is enforced in the Zod schema |
| `phone` | `string(32)?` | Optional |
| `notes` | `text?` | Free-form: allergies, preferences, formula references (FR-012) |
| `isArchived` | `boolean` | Default `false` — soft delete so appointment history stays intact |
| `createdAt` / `updatedAt` | `DateTime` | — |

**Delete rule (FR-015):** `DELETE /api/clients/[id]` never hard-deletes. It counts the client's **upcoming `SCHEDULED`** appointments (`startsAt >= now`). If any exist it returns **`400`** naming how many, and tells the user to cancel them first. Otherwise it sets `isArchived = true` and returns `200` with `meta.archived`. An earlier draft of this document said `409` plus a `?strategy=archive` parameter; neither is true — no such query parameter is read.

### 3.5 `Service`

| Field | Type | Rules |
|---|---|---|
| `id` | `uuid` | PK |
| `accountId` | `uuid` | FK → `Account.id`, Cascade, indexed |
| `name` | `string(120)` | **Required** (FR-010) |
| `description` | `text?` | Optional |
| `priceCents` | `int` | **Required**, `>= 0` |
| `durationMinutes` | `int` | **Required**, `1..600` — drives `Appointment.endsAt` |
| `isActive` | `boolean` | Default `true`; inactive services stay visible on past appointments |
| `createdAt` / `updatedAt` | `DateTime` | — |

**Delete rule (FR-009):** `DELETE /api/services/[id]` counts **all** `AppointmentService` rows for the service — no status or date filter. If the count is above zero it archives instead: `isActive = false`, returned as **`200`** with `meta.archived` and the count in the message. Only an unreferenced service is hard-deleted, also as `200`. An earlier draft said `409` with a list of blocking appointments; the real behaviour is a silent archive that succeeds.

### 3.6 `Appointment`

| Field | Type | Rules |
|---|---|---|
| `id` | `uuid` | PK |
| `accountId` | `uuid` | FK → `Account.id`, Cascade, indexed — denormalized so overlap queries never need a join |
| `clientId` | `uuid` | FK → `Client.id`, `onDelete: Restrict` |
| `staffUserId` | `uuid?` | FK → `StaffUser.id`, `onDelete: SetNull` — null means "unassigned" |
| `startsAt` | `DateTime` | **Required** (FR-022) |
| `endsAt` | `DateTime` | **Required**; computed as the **sum** of the selected services' durations, so three 30-minute services book 90 minutes |
| `status` | `enum` | `SCHEDULED` (default, FR-024) \| `COMPLETED` \| `CANCELLED` \| `NO_SHOW` |
| `cancellationReason` | `text?` | Set when status becomes `CANCELLED` |
| `priceCentsTotal` | `int` | Snapshot of the summed service prices **at booking time**, so later price edits do not rewrite history |
| `createdAt` / `updatedAt` | `DateTime` | — |

**Overlap rule (FR-021) — built.** `src/lib/appointments/scheduling.ts` owns the check, and all three entry points (POST, PATCH, and the status route that reopens a cancelled booking) go through it. A candidate booking clashes with an existing one when `startsAt < other.endsAt && endsAt > other.startsAt`.

Three decisions are deliberate:

- **Half-open intervals.** Back-to-back bookings are legal: 09:00–09:45 followed by 09:45–10:30 does not clash. Only genuinely shared minutes conflict.
- **The comparison is on `staffUserId`, including null.** An unassigned booking (`staffUserId = null`) is treated as its own resource, so it does not block another unassigned booking — a studio can run two receptionists booking simultaneously. Overlap is scoped to the same studio via `accountId`.
- **Only `CANCELLED` is ignored.** `COMPLETED` and `NO_SHOW` still occupy their slot, so a past no-show cannot be double-booked.

**Known limitation.** This is a read-then-write check, so two requests arriving at the same instant can both pass it. The durable fix is a Postgres `EXCLUDE USING gist` constraint on `tstzrange(startsAt, endsAt)`, which needs `CREATE EXTENSION btree_gist` so the `=` on `accountId`/`staffUserId` is indexable. That is a schema migration plus a mapping of `23505` onto the same `409`, and it is deliberately deferred rather than smuggled in here — the `null`-staff case needs a `COALESCE` sentinel column to be expressible as an exclusion constraint at all.

### 3.7 `AppointmentService` (join table)

| Field | Type | Rules |
|---|---|---|
| `appointmentId` | `uuid` | **PK**, FK → `Appointment.id`, Cascade |
| `serviceId` | `uuid` | **PK**, FK → `Service.id`, `onDelete: Restrict` |

Composite primary key makes duplicate selections impossible. This is the many-to-many that lets one appointment cover several services (lash fill + brow tint) and one service appear in many appointments.

### 3.8 `PasswordResetToken`

| Field | Type | Rules |
|---|---|---|
| `id` | `uuid` | PK |
| `staffUserId` | `uuid` | FK → `StaffUser.id`, Cascade, indexed |
| `tokenHash` | `string(255)` | Unique; the raw token exists only in the emailed link |
| `expiresAt` | `DateTime` | `createdAt + 1 hour` |
| `usedAt` | `DateTime?` | Set on consumption; a non-null value rejects reuse |

Backs FR-005 and constitution §III (secure, time-limited links).

---

## 4. Relationship summary

| Relationship | Cardinality | Implementation |
|---|---|---|
| Account → StaffUser | 1:N | `StaffUser.accountId` |
| Account → Client / Service / Appointment | 1:N | `accountId` on each |
| Client → Appointment | 1:N | `Appointment.clientId`, `onDelete: Restrict` |
| StaffUser → Appointment | 1:N | `Appointment.staffUserId`, `onDelete: SetNull` |
| Appointment ↔ Service | N:M | `AppointmentService` join table |
| Account → StaffInvite | 1:N | `StaffInvite.accountId` |
| StaffUser → PasswordResetToken | 1:N | `PasswordResetToken.staffUserId` |

**`onDelete` policy:** identity and configuration cascade (delete the studio → its staff, services, appointments go with it). Records that carry history restrict or null out, so a stray delete can never orphan an appointment or erase a client's history.

---

## 5. Indexes

| Table | Index | Reason |
|---|---|---|
| `StaffUser` | `@@unique([email])` | Sign-in lookup; enforces FR-002 |
| `StaffUser` | `@@index([accountId])` | Tenant scoping on every request |
| `Client` | `@@index([accountId, lastName])` | Client list, alphabetically grouped by studio |
| `Service` | `@@index([accountId, isActive])` | Service picker on the booking form |
| `Appointment` | `@@index([accountId, startsAt])` | Calendar range queries |
| `Appointment` | `@@index([staffUserId, startsAt, endsAt])` | Overlap detection |
| `Appointment` | `@@index([clientId, startsAt])` | Appointment history on a client profile |
| `StaffInvite` | `@@index([accountId, acceptedAt])` | Pending-invitation list |
| `PasswordResetToken` | `@@unique([tokenHash])` | Token lookup |

---

## 6. Tenant isolation rules (non-negotiable)

1. The `accountId` used in every query comes from the Auth.js session, never from the request body or a URL parameter.
2. `proxy.ts` blocks unauthenticated access to `(app)` routes and redirects to `/login`.
3. Every route handler repeats the ownership check and returns `404` (not `403`) for another studio's record, so IDs cannot be probed.
4. `Account` creation and the first `OWNER` `StaffUser` row happen in a single transaction.
5. A superuser/staff impersonation path does not exist in the MVP.

---

## 7. Verification

```bash
npx prisma migrate dev --name init   # create the schema in the local/dev database
npx prisma studio                    # browse seeded rows
npx prisma validate                  # schema sanity check (run locally; CI does not include it)
```

Seed data covers one studio with an owner, a second staff member, **four services, three clients**, and **four appointments** spread across today and the next two weeks — three `SCHEDULED` and one `COMPLETED` — so the dashboard has something real to render on first run. There are no `CANCELLED` or `NO_SHOW` appointments in the seed; an earlier draft of this document claimed there were.
