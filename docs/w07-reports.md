# W07 Completion Sprint: Project Closeout Report — GlowBook

This report records the completion sprint (October 10–11, 2026) that closed every remaining open issue (#30, #32, #33, #34) and left the project board at 100% Done. There is no synchronous meeting to report: like Weeks 04–06, the work was completed solo after the teammate's withdrawal (see `docs/w04-reports.md` §1), and the course's Week 07 assignment is the individual Job Ready Interview, submitted separately.

## 1. Sprint Scope and Decisions

Goal: finish the project "as it should be" — no open backlog, no overstated claims, every shipped behavior verified by an automated test.

| Workstream | Issue | Pull request | State |
|---|---|---|---|
| Staff invitations end to end | #30 | #42 | Merged |
| Race-safe overlap (exclusion constraint) | #34 | #43 | Merged |
| Playwright end-to-end suite | #33 | #44 | Merged |
| Week/month calendar + reschedule | #32 | #45 | Merged |
| Closeout docs + board | — | #46 | This report's PR |

Decisions: one feature branch per workstream (merged in dependency order #42 → #44 → #43 → #45, with #43 independent); the e2e suite runs sequentially against a real Postgres service in CI; docs live in the same PRs as their features plus one closeout PR.

## 2. Project Progress

- **Repository:** https://github.com/adab-code/glowbook (`main` at the merge of #45 plus this closeout)
- **Deployment:** https://glowbook-lzts.onrender.com (auto-deploys from `main`)
- **Board:** https://github.com/users/adab-code/projects/2 — every card Done except PR #41, which stays open intentionally as the W06 code-review artifact. Milestones `Week 06` (all closed) and `Week 07` exist.
- **Issues:** #30–#36 all closed. Zero open issues.

### What each PR contains

- **#42 — invitations:** `POST/GET /api/staff/invitations` + `DELETE` revoke (owner-only), single-use token hashed at rest with 7-day TTL, public `/invite?token=…` accept page + `acceptInviteAction` (email/role from the row, same-transaction stamp, direct sign-in), `/team` rebuilt with invite form, copyable link, pending list; STAFF read-only. 4 schema tests.
- **#43 — overlap constraint:** migration `20261011035328` (`btree_gist`, generated `staff_key` sentinel for unassigned, `active_range` empty on cancel, `EXCLUDE USING gist`); `isOverlapViolation` maps P2002/P2034/23505/23P01 + name matches onto the same 409 in all three booking mutations; `assertNoOverlap` stays as the friendly pre-check. 3 unit tests. **Requires one manual step: `npx prisma migrate deploy` against the Render database (free tier has no pre-deploy hook).**
- **#44 — Playwright:** 9 specs (auth, services/clients CRUD, booking + overlap, staff 403, settings refresh, invite join/revoke), sequential Chromium against seeded Postgres, wired into CI with service container + migrate + seed.
- **#45 — calendar:** Day/Week/Month tabs via searchParams with prev/today/next, server-rendered week columns and month grid with day deep-links, Move dialog (PATCH `startsAt`, 409 on the field); `zonedMonthBounds`/`addWallDays`/grouping helpers unit-tested DST-safe; 2 calendar specs (11 e2e total).

Net test counts: **45 Vitest unit tests, 11 Playwright specs**, all green in CI.

## 3. Bugs the E2E Suite Caught (all real, two in production)

1. **Sign-up was broken in production.** `registerSchema` (and the reset/accept schemas) used `.strict()`, but browser form submissions carry transport fields — every sign-up silently failed validation while sign-in (lenient schema) kept working. Fixed by dropping `.strict()` on form-action schemas, mirroring the documented `loginSchema` precedent; regression tests lock it.
2. **Appointments list crashed after every reload.** Route-handler JSON delivers date *strings*, but `formatTime`/`formatDateTime`/`formatDayLabel` only accepted `Date` — any client-side reload threw "Invalid time value" into the error boundary. Fixed by coercing `Date | string` in the formatters, with a locking unit test.
3. **Ranged reads ignored the lower bound.** Two sibling spreads with the same `startsAt` key meant `{...{gte}, ...{lt}}` kept only `lt` — the day view reloaded unfiltered rows after every booking. Fixed by merging both bounds into one object.

## 4. Code Review Report (self-review, consolidated)

No second member exists to review, so each PR was self-reviewed against the same checklist used in W05/W06: handler enforces (never the UI alone), tenancy comes from the session, validation at the boundary, no unexplained `any`, Prettier/ESLint clean, tests prove the claim.

- [#42](https://github.com/adab-code/glowbook/pull/42): invite create/accept/revoke paths, token hashing, single-use stamp, owner-only gates, staff read-only view.
- [#43](https://github.com/adab-code/glowbook/pull/43): migration SQL (extension, generated columns, constraint), violation mapping breadth, friendly pre-check retained.
- [#44](https://github.com/adab-code/glowbook/pull/44): selector robustness (exact names, scoped rows, API-driven setup where UI is ambiguous), sequential workers, seeded-data isolation, CI service wiring.
- [#45](https://github.com/adab-code/glowbook/pull/45): DST-safe bounds, server-first views, Move flow, e2e slot ownership across specs.
- [#46](https://github.com/adab-code/glowbook/pull/46): this closeout — docs accuracy (nothing claimed that isn't shipped), README/API/demo consistency.

CI is green on all six (typecheck, lint, unit, e2e, format, build).

## 5. What Is Not Done

- **Render migration (manual):** run `npx prisma migrate deploy` once against the production database so `appointment_no_overlap` exists in prod. Until then the application-level 409 is the only guard (correct behavior, just not race-proof yet).
- **Backlog (honest, documented in README):** drag-to-reschedule, email delivery for invites/resets, `GET /api/services/:id` and `GET /api/clients/:id` single-read handlers.
- **Render free-tier limits** (30-day database expiry, cold starts) still apply — documented in `README.md`.
