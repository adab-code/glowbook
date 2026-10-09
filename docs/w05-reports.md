# W05 Team: Project & Code Review Report — GlowBook

Week 05 deliverables: the team meeting summary, project progress (repository, Project Board, and the week's pull request), one challenge / success / insight from the sprint, and the code-review status. This week's theme is **authentication + discoverability metadata + sprint triage**, delivered as a single reviewable pull request.

**Verification note.** Everything asserted below was checked against the repository, against `git` and the GitHub CLI/API, or against a real HTTP request to a running production build. Performance and test-coverage claims are deliberately absent — there is still no committed test suite to cite.

---

## 1. Team Meeting Summary

**Synchronous meeting — Friday, October 9, 2026**

- **Team members present:** Aaron Daniel Alfaro Barra (lead)
- **Team leader for Week 05:** Aaron Daniel Alfaro Barra

### Team status — context for this report

My teammate, Iván Chulde, withdrew from the course partway through the project and took no part in the Week 05 sprint. The Week 04 report recorded the same situation; it still holds here. Two consequences carry into this report: the Week 05 work was completed solo, and the cross-review requirement cannot be satisfied by a second team member. To keep the review requirement meaningful, I submitted a self-review on my own pull request rather than leaving it unreviewed (see §4).

### Major decisions made

1. **Week 05 scope is authentication, discoverability metadata, and sprint triage.** The authentication slice was already merged earlier; this week's new work is the metadata layer plus the honest triage of everything left undone.
2. **Metadata is layered, not sprinkled.** Site-wide `metadataBase`, `applicationName`, Open Graph and Twitter defaults live in the root layout; each of the 12 pages sets its own `title`/`description`; only `clients/[id]` uses `generateMetadata`, because its title depends on data and must stay scoped to the session's `accountId`.
3. **Private routes are explicitly non-indexable.** The `(app)` group sets `robots: noindex, nofollow`, so crawled HTML can never expose studio data through a meta description — a privacy decision, not just an SEO one.
4. **The Open Graph image is generated in code.** `src/app/opengraph-image.tsx` renders a 1200×630 PNG with Next.js `ImageResponse`, so the social card cannot drift from the app the way a checked-in PNG would.
5. **Unfinished work is triaged, not half-built.** Everything out of W05 scope became a tracked carryover issue (#30–#36) with acceptance criteria, instead of being partially implemented to look complete.
6. **Async cadence continues:** blockers are flagged immediately rather than at the next meeting, and the board is updated before end of day.

### Responsibilities assigned

| Area | Owner |
|---|---|
| Discoverability metadata, Open Graph image, `noindex` on private routes | Aaron |
| Sprint triage (carryover issues #30–#36), docs sync, self-review | Aaron |

---

## 2. Project Progress

- **Team public GitHub repository:** https://github.com/adab-code/glowbook
- **GitHub Project Board:** https://github.com/users/adab-code/projects/2
- **Board status this week:** the W04 issues (#1–#7) and the deployment issue (#8) are **Done**; the seven carryover items (#30–#36) are **Todo** and assigned; the Week 05 pull request card is **Done**. Nothing is left in progress.

### What this week's pull request contains

Branch `feat/w05-deliverable` into `main`: https://github.com/adab-code/glowbook/pull/38. Merged as `f77a0d76`.

- **Discoverability metadata** — `metadataBase` (from `NEXT_PUBLIC_SITE_URL`), `applicationName`, Open Graph and Twitter card defaults in `src/app/layout.tsx`; per-page `title`/`description` across the app; `generateMetadata` on `clients/[id]` scoped to `accountId`; `robots: noindex, nofollow` on the `(app)` group.
- **A code-generated Open Graph image** — `src/app/opengraph-image.tsx` (1200×630 via `ImageResponse`) plus its alt text file.
- **The auth snapshot** — Auth.js v5 Credentials, the `proxy.ts` gate, and the authoritative `requireUser()` / `requireOwner()` guards (already on `main` from earlier merges; this branch keeps the Week 05 snapshot reviewable).
- **Docs sync (`docs/w05`)** — the README's API table now lists the appointments handlers as implemented, the route boundaries are documented, a Demo credentials section was added, and `NEXT_PUBLIC_SITE_URL` is documented in `.env.example`.

Net: 240 insertions and 26 deletions across 17 files.

### Verification

Typechecking, linting, Prettier, and a production build all pass clean (18 routes), and the metadata was confirmed over HTTP against a running production build: `<title>Sign in · GlowBook</title>`, `og:image` / `og:title` / `og:site_name` and `twitter:card` present, `/dashboard` → `307 /login?from=/dashboard`, `/` → `307 /login`, `/api/services` → `401` JSON envelope, and `/opengraph-image` → `200 image/png`. The production database on Render was migrated (2/2) and seeded, and the two demo accounts were verified against their bcrypt hashes.

---

## 3. Challenge, Success, and Insight

- **Challenge.** The teammate withdrew, so the entire Week 05 scope — and the review that normally comes from a second member — fell to one person. On top of that, the README described work as pending that the code had already shipped (appointments, error/loading boundaries), so the docs had to be corrected rather than merely extended.
- **Success.** The auth slice is now multi-studio end to end — every query derives `accountId` from the session — and the discoverability layer (Open Graph image, per-page metadata, `noindex` on private routes) is verified in a production build. The full client → route handler → database loop works against a seeded production database.
- **Insight.** Taking `accountId` from the session *everywhere*, never from the request body, query string, or route parameter, is what actually prevents data leaking between studios. It is easy to satisfy per query and still miss one; centralising it in `requireUser()` turns a hundred small decisions into a single invariant.

---

## 4. W05 Team: Code Review Report

Given my teammate's withdrawal, there was no second member to review this pull request, so I performed a self-review on it and recorded it on the PR itself.

- **Repository reviewed:** https://github.com/adab-code/glowbook (my own)
- **Pull request reviewed:** https://github.com/adab-code/glowbook/pull/38
- **Review submitted:** https://github.com/adab-code/glowbook/pull/38 (one review summary)

The review leaves three inline notes — the `noindex` protection on the `(app)` group, the Open Graph image using Georgia rather than the app's display face (Fraunces), and `generateMetadata` on `clients/[id]` calling `requireUser()` a second time per request. None are blocking; the first two are cosmetic, and the third is acceptable because the route is `noindex` and dynamically rendered. Per the W04 report, the cross-member review requirement cannot be satisfied for any week after the teammate's withdrawal.

---

## 5. What Is Not Done

Stated plainly, because a report that lists only what works is not useful to a reviewer.

- **Carryover issues #30–#36** are open and assigned for Week 06, each with acceptance criteria: team invitations UI (#30), editable studio settings (#31), weekly/monthly calendar and reschedule UI (#32), automated test suite (#33), race-safe overlap via `EXCLUDE USING gist` (#34), horizontal-scrolling mobile nav fix (#35), and `requireOwner()` enforcement on staff-management endpoints (#36). None are implemented in this deliverable — they are triaged, not silently dropped.
- **`NEXT_PUBLIC_SITE_URL`** must be set in the hosted Render environment for the Open Graph image to resolve to the deploy rather than `localhost`. It is documented here and in `.env.example`; setting it is an environment action, not a code change.
- **No committed test suite.** The verification in §2 ran from throwaway commands and real HTTP requests; it is reproducible but not a regression suite. Issue #33 covers the durable fix.
- **The overlap check is still application-level** (`assertNoOverlap`), not a Postgres exclusion constraint, so it is not race-proof. Documented in `docs/data-model.md` and tracked as #34.
