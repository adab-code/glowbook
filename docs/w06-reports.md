# W06 Team: Project & Code Review Report — GlowBook

Week 06 deliverables: the team meeting summary, project progress (repository, Project Board, and the week's pull request), one challenge / success / insight from the sprint, and the code-review status. This week's theme is **access control + profile management + a first test suite**, delivered as a single reviewable pull request.

**Verification note.** Everything asserted below was checked against the repository, against `git` and the GitHub CLI/API, or against a real CI run. No claim here is taken on trust. Playwright end-to-end coverage is deliberately absent: only the unit half of the test suite exists (see §5).

---

## 1. Team Meeting Summary

**Synchronous meeting — Friday, October 9, 2026 · 20:00 MDT (Microsoft Teams)**

- **Team members present:** Aaron Daniel Alfaro Barra (lead)
- **Team leader for Week 06:** Aaron Daniel Alfaro Barra

### Team status — context for this report

My teammate, Iván Chulde, withdrew from the course partway through the project and took no part in the Week 06 sprint. The Week 04 and Week 05 reports recorded the same situation; it still holds here. Two consequences carry into this report: the Week 06 work was completed solo, and the cross-review requirement cannot be satisfied by a second team member. As in Week 05, a self-review was submitted on the pull request instead (see §4).

### Meeting summary

The session reviewed the Week 06 scope against the carryover triaged in Week 05 (issues #30–#36) and walked through the working branch live:

1. **Permissions demo.** The three destructive DELETE handlers return `403` for a STAFF session (verified with the seeded `staff@glowbook.dev` account), while GET/PATCH flows are unchanged; the Archive/Delete buttons are hidden for staff in all four managers.
2. **Settings demo.** The owner edits studio name, timezone, and currency on `/settings`; the sidebar branding and dashboard day bounds update without a sign-out via the session-refresh path. The page stays read-only for STAFF.
3. **Tests.** `npm run test` run live: 30/30 passing, including the DST day-bound pins and the W03/W04 regression locks; the new CI step runs the same suite on the pull request.
4. **Mobile nav.** The disclosure menu opened/closed with the button, marked the current page, and showed no horizontal scrolling at 360px width.
5. **Board review.** #31, #35, #36 accepted as Done (pending merge); #33 left In Progress (Playwright half outstanding); #30, #32, #34 confirmed as the Week 07 backlog; the `Week 06` milestone created and all seven issues assigned to it.
6. **Blockers.** None on the code. The standing constraint — no second member for cross-review after the teammate's withdrawal — is handled with a recorded self-review, as in Week 05.

### Major decisions made

1. **Week 06 scope is the three rubric-adjacent gaps plus test foundations.** Editable settings (profile management), OWNER/STAFF enforcement (code quality / security), the mobile nav fix (responsive), and a Vitest unit suite (the first committed tests). Invitations, the calendar grid, the overlap constraint, and Playwright stay in the Week 07 backlog.
2. **The permission matrix is STAFF-operates, OWNER-destroys.** Staff members keep full day-to-day CRUD and status changes; the three destructive DELETEs, `PATCH /api/account`, and future invites are owner-only with `403` for staff. The route handler enforces; the UI only mirrors.
3. **Session claims refresh without a sign-out.** The settings form calls `useSession().update()`, which re-runs the Auth.js `jwt` callback with `trigger === "update"` and re-issues the cookie from the database row.
4. **Unit tests cover pure modules only.** Anything importing `src/lib/db.ts` throws at import time without `DATABASE_URL`, so database-backed helpers stay out of `vitest run` by design (documented in `vitest.config.ts`).
5. **The mobile nav is a disclosure, not a strip.** The scrollable row is replaced by a button + panel with `aria-expanded`/`aria-current`, closing on link activation.

### Responsibilities assigned

| Area | Owner |
|---|---|
| Permission matrix + `requireOwner()` on destructive endpoints + `canDelete` UI | Aaron |
| `PATCH /api/account` + SettingsForm + session refresh | Aaron |
| Vitest suite (datetime, schemas, tokens, format) + CI step | Aaron |
| MobileNav + shared `nav-items` module | Aaron |
| Self-review, board, milestone, this report | Aaron |

---

## 2. Project Progress

- **Team public GitHub repository:** https://github.com/adab-code/glowbook
- **GitHub Project Board:** https://github.com/users/adab-code/projects/2
- **Week 06 milestone:** created (`Week 06`); issues #30–#36 assigned to it. Board status: #31, #35, #36 **Done** (implemented in the Week 06 PR); #33 **In Progress** (unit half done, e2e pending); #30, #32, #34 **Todo** for Week 07. Nothing is left unassigned.
- **Deployment:** https://glowbook-lzts.onrender.com (verified `HTTP 200` on `/login` during this sprint; the Week 06 code deploys on merge).

### What this week's pull request contains

Branch `feat/w06-settings-access-tests` into `main`: https://github.com/adab-code/glowbook/pull/40. **Open for review — not merged.** Head commit `a6a3a53`.

- **Access control** — `requireOwner()` on `DELETE /api/services/:id`, `DELETE /api/clients/:id`, `DELETE /api/appointments/:id` (403 for STAFF); `canDelete` prop hides the Archive/Delete controls for staff on all four managers (clients, services, day view, dashboard list); matrix documented in `docs/glowbook-spec.md` and `.github/copilot-instructions.md`.
- **Editable settings** — `settingsSchema` (IANA-validated timezone, uppercased 3-letter currency), `PATCH /api/account` (owner-only, returns display fields only), `SettingsForm` with a timezone datalist, session refresh via `useSession().update()`; `/settings` stays read-only for STAFF.
- **Unit test suite** — 30 tests across 4 files (day/week bounds incl. 23h spring-forward and 25h fall-back days, datetime-local roundtrip, price/boolean/contact-guard regressions from W03–W04, token properties, money/time formatting), wired as a CI step.
- **Mobile nav** — `MobileNav` disclosure menu replacing the scroll strip; `NAV_ITEMS` unified in one module (previously duplicated).
- **Hygiene** — `forgotPasswordSchema` now validates the reset flow instead of sitting unused; `shortId` kept and covered by a test.

Net: +1,869 / −104 across 34 files (the bulk is `package-lock.json` from adding Vitest).

### Verification

CI on the pull request is green: https://github.com/adab-code/glowbook/actions/runs/38095416155 — typecheck, lint, the new unit-test step (30/30), format check, and a production build (23 routes, including the new `/api/account`). Locally: `npm run typecheck`, `npm run lint`, `npm run test` (30 passed), `npm run format:check`, and `npm run build` all pass on the branch head.

---

## 3. Challenge, Success, and Insight

- **Challenge.** Vitest 5 refused to install against the project's pinned `@types/node@20` (peer conflict), so the suite runs on Vitest 3 — same runner, compatible peer range, no `--legacy-peer-deps` in the lockfile. Dependency fit mattered more than version novelty.
- **Success.** For the first time there are committed tests, and they already pay rent: the DST day-bound tests pin the exact behaviour two previous reports only described, and the schema tests lock in the W03/W04 bug fixes as regressions.
- **Insight.** Storing display fields (studio name, timezone, currency) in the JWT made settings edits silently stale until the next sign-in. The `update()` trigger turns the token from a snapshot into a refreshable view — one callback, no extra queries on normal requests.

---

## 4. W06 Team: Code Review Report

Given my teammate's withdrawal, there was no second member to review this pull request, so I performed a self-review on it and recorded it on the PR itself.

- **Repository reviewed:** https://github.com/adab-code/glowbook (my own)
- **Pull request reviewed:** https://github.com/adab-code/glowbook/pull/40
- **Review submitted:** https://github.com/adab-code/glowbook/pull/40 (one `COMMENTED` review summary)

The review verifies the four workstreams against the code: owner-only deletes with 403s, the settings PATCH + session-refresh path, the 30 unit tests and their deliberate DB-free boundary, and the disclosure-menu nav. Two non-blocking notes are recorded there: the Postgres exclusion constraint remains the durable overlap answer, and Playwright e2e is the open half of #33. CI is green; the PR stays open per team process.

---

## 5. What Is Not Done

Stated plainly, because a report that lists only what works is not useful to a reviewer.

- **Carryover for Week 07:** team invitations UI (#30), weekly/monthly calendar and reschedule UI (#32), Playwright end-to-end suite (second half of #33), race-safe overlap via `EXCLUDE USING gist` (#34). None are implemented in this deliverable.
- **The PR is unmerged.** #36, #31, and #35 close on merge; the merge happens after the review, so the issues are Done on the board but still open on GitHub until then.
- **`NEXT_PUBLIC_SITE_URL`** must be confirmed in the hosted Render environment so the Open Graph image resolves to the deploy rather than `localhost` (carried over from the W05 report; an environment action, not a code change).
- **Render free-tier limits still apply** (30-day database expiry, ~1-minute cold starts), documented in `README.md`; the grader-facing note is unchanged.
