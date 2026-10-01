# W04 Team: Project & Code Review Report — GlowBook

Week 04 deliverables: team meeting summary, project setup evidence, the bugs found and fixed while building the appointment feature, and the code review status.

**Verification note.** Everything asserted below was checked against the repository or against a real HTTP request with a real signed-in session. Facts that could not be verified from the repo are marked with `«...»` and need a human to fill in before submitting. Test and performance claims are deliberately absent — the assertions described in §2 ran from throwaway scripts outside the repository, which are deleted and untracked, so there is no committed test suite to cite and no honest way to report one.

---

## 1. Team Meeting Summary

**Synchronous meeting — Thursday, Sept 28, 2026 · 20:00 MDT (Microsoft Teams)**

- **Team members present:** Iván Chulde, Aaron Daniel Alfaro Barra
- **Team leader for Week 04:** Aaron Daniel Alfaro Barra

### Major decisions made

1. **The appointment feature is the Week 04 priority.** It was the only item left unstarted from the Week 04 milestone, and it blocks the dashboard's status updates. Scope agreed: create a booking, see the day, reschedule, cancel, and close out. A week or month grid is explicitly out of scope — the data side accepts arbitrary date windows, so the grid is additive later.
2. **The API derives what the client should not send.** The booking form sends client, services, start time, and staff. `endsAt` and `priceCentsTotal` are recomputed server-side on every write, and both schemas are `.strict()` so neither can be forged by adding a field to the request. A 45-minute service cannot be booked as 15 minutes, and the total cannot be understated.
3. **Overlap is scoped to the staff member, not the studio.** Two receptionists booking at the same moment must not block each other. An unassigned booking (`staffUserId = null`) is treated as its own resource, so it does not block another unassigned booking. Back-to-back bookings are allowed — the intervals are half-open, so 09:00–09:45 followed by 09:45–10:30 is not a conflict. Only genuinely shared minutes clash.
4. **Cancellation requires a reason, and the record is kept.** A cancelled appointment is never deleted; it stays in the client's history beside the reason. Only `COMPLETED` and `NO_SHOW` are closed for good. Deleting or editing a cancelled appointment returns `409` pointing at the status route, so history cannot be quietly rewritten.
5. **Documentation is corrected when the code disagrees with it, in both directions.** Three claims in the Week 03 docs were wrong about our own schema and were fixed rather than left standing: the timestamp columns were described as naive `timestamp(3)` when they have been `timestamptz(3)` since the first migration; the account timezone field was described as "planned, not done" when it was already implemented; and the `StaffInvite` table was missing its `acceptedById` column. We also corrected the opposite direction — a Week 04 claim that the overlap rule was still unbuilt is now marked built, with the race condition documented rather than glossed over.
6. **Async cadence continues:** a short progress-and-blockers message in Teams by 5:00pm MDT each working day, blockers flagged immediately rather than at the next meeting, and the board updated before end of day.

### Responsibilities assigned

| Team member | Week 04 responsibility |
|---|---|
| **Aaron Daniel Alfaro Barra** (Week 04 lead) | Appointment API and overlap detection, the timezone conversion layer, seed hardening, the seven defects in §3, documentation corrections |
| **Iván Chulde** | Design system and shadcn/ui setup, app shell, service and client CRUD, dashboard and calendar UI |

Shared: the booking flow is co-owned — the API, validation, and overlap rule by Aaron, the booking and status UI by Iván.

---

## 2. Project Setup

- **Team public GitHub repository:** https://github.com/adab-code/glowbook
- **GitHub Project Board:** https://github.com/users/adab-code/projects/2
- **Week 04 milestone:** issues #1–#5 closed; #6 (appointment calendar) built this week; #8 (deployment) still open.

### What this week's pull request contains

Branch `feat/appointments-booking` into `main`, **open and not merged**: «PR URL».

- **Three appointment route handlers** — `GET`/`POST /api/appointments`, `GET`/`PATCH`/`DELETE /api/appointments/[id]`, `PATCH /api/appointments/[id]/status` — plus a shared `src/lib/appointments/scheduling.ts` that owns the overlap rule so the create, edit, and reopen paths cannot drift apart.
- **Four new feature components** — booking form, day view, inline status actions, and the dashboard's upcoming list — plus three route boundaries (`error`, `loading`, `not-found`).
- **A timezone conversion layer** (`src/lib/utils/datetime.ts`) that turns a studio's wall-clock day and week boundaries into absolute instants before any query runs.
- **Seven defect fixes**, described in §3.

Net: 336 insertions and 142 deletions across 14 existing files, plus 1,698 lines across 13 new source files.

### Evidence that the API actually works

Typechecking and linting pass clean, and a production build succeeds. Neither would have caught the majority of the bugs in §3 — most of them only appear under a real request.

The endpoints were exercised over HTTP against a running production build with a genuine signed-in session, **48 assertions, all passing**: authentication required; `endsAt` derived from the summed durations and `priceCentsTotal` snapshotted from the summed prices; overlapping bookings rejected with `409` naming `startsAt`; back-to-back bookings accepted and a one-minute-earlier slot rejected; free-text dates, a client-supplied `endsAt`, an empty service list, and a non-UUID client id all rejected; `to <= from` and an out-of-range `limit` rejected; rescheduling recomputes `endsAt` and returns `409` onto an occupied slot; `CANCELLED` without a reason rejected; cancelling frees the slot; reopening a completed booking clears the stale reason; deleting a completed or cancelled appointment refused with `409`; an unknown id returns `404` with no leaked detail; the Week 03 client-edit defect confirmed fixed end to end; and both teammate-review findings from last week held as regressions — a blank service price rejected instead of stored as `$0.00`, and clearing a client's last contact method rejected instead of leaving them unreachable.

Two behaviours the test run pinned down and that the docs now record:

- The client contact guard validates the **patch payload**, not the stored row. Clearing `email` while a stored phone remains is rejected, because the schema cannot see the database. The edit form always submits both fields together, so a user never hits this, but the API is stricter than the requirement demands and is documented as such.
- Cancelled appointments refuse `DELETE` by design, which means a cleanup script cannot remove them through the API. Test cleanup has to reopen them to `SCHEDULED` first.

---

## 3. Bugs Found and Fixed This Week

Every one of these was found by reading or by exercising the code, and every fix is in this pull request.

1. **Every client edit returned `400`.** `client-form.tsx` sent the record's own `id` back to `PATCH /api/clients/[id]`, and `clientPatchSchema` is `.strict()`, so Zod rejected the whole request with `Unrecognized key: "id"`. The types were correct on both sides, so neither `tsc` nor ESLint could see it. It only appeared under a real request with a real session. The fix strips `id` before serialising — the path already carries it.
2. **A client could lose every contact detail.** The patch schema short-circuited on `email === undefined`, so `{ email: "" }` skipped the check and cleared the last phone number a client had. The guard now runs whenever the patch touches contact fields at all, and `{ email: "", phone: "" }` is rejected.
3. **Blank prices saved as `$0.00`.** `z.coerce.number()` turns `null` into `0` and `""` into `0`, so a mistyped or cleared price became a free service rather than a validation error. Prices are now a strict `z.number()` with an integer bound.
4. **`z.coerce.boolean()` treated `"false"` as `true`.** `Boolean("false")` is `true`, so an archived or inactive flag could not be set through a form value. Replaced with an explicit parser that accepts real booleans and the strings `"true"`/`"false"`/`"1"`/`"0"`.
5. **Password-reset tokens were written to the production log.** The development log line printed the reset URL, token included. Render aggregates logs and retains them for weeks, which turns a one-hour credential into a long-lived one. It now prints only when `NODE_ENV !== "production"`.
6. **The login redirect was an open redirect.** The guard rejected `https://evil.com` and `//evil.com`, but browsers normalise `\` to `/`, so `/\evil.com` parsed as a different origin and passed. The check now compares origins with the URL parser and refuses control characters.
7. **A session without `accountId` queried with `where: { accountId: undefined }`,** which Prisma drops from the query entirely — turning a tenancy filter into no filter at all. `requireUser()` now requires both `id` and `accountId`, so a stale token is rejected instead of silently reading every studio's rows.

Two dashboard defects were fixed alongside these, because they were the same class of bug and the dashboard is where they are visible: it used the **server's** day rather than the studio's (wrong for a Boise studio for seven hours a day), and its "next appointments" count came from the truncated row list rather than a real `count()`, so it reported how many it happened to display instead of how many existed.

---

## 4. Architecture & Design Notes

Recorded so a reviewer can check the reasoning rather than take it on trust.

### The timezone layer

Every timestamp column is `timestamptz(3)`, so stored instants were never ambiguous — the Week 03 docs' claim that they were naive was wrong. What was missing was the conversion layer: something that answers "what does today mean for a studio in `America/Boise`". `src/lib/utils/datetime.ts` resolves a wall-clock date and time in an IANA zone to an absolute instant, and derives day and week bounds from it. That is what makes a daylight-saving transition safe: a booking keeps its real instant, and the day is still rendered the way the studio experienced it. The dashboard's week is Monday-to-Sunday in the studio's zone, which is not the same as the server's week outside business hours.

### The overlap rule

`assertNoOverlap()` rejects a candidate when `startsAt < other.endsAt && endsAt > other.startsAt`, scoped to the same studio and the same `staffUserId`, ignoring only `CANCELLED`. `COMPLETED` and `NO_SHOW` still occupy their slot, so a past no-show cannot be double-booked.

**This is a read-then-write check and is not race-proof.** Two requests arriving at the same instant can both pass it and both insert. The durable fix is a PostgreSQL `EXCLUDE USING gist` constraint over `tstzrange(startsAt, endsAt)`, which needs `btree_gist` so the equality on `accountId`/`staffUserId` is indexable, plus a `COALESCE` sentinel column to make the `null`-staff case expressible as a constraint at all. We deferred it rather than half-implementing it, and `docs/data-model.md` says so plainly rather than describing the rule as airtight.

### Tenant isolation

Every query filters `accountId` from the session, never from the request body, query string, or route parameter, and another studio's record returns `404` rather than `403` so ids cannot be probed. This is now enforced at the session boundary as well as per query, which is defect 7 above.

### Money and derived fields

Money is integer cents throughout. `endsAt` and `priceCentsTotal` are snapshots: later price edits do not rewrite history, and later service edits do not move a booked slot.

---

## 5. W04 Team: Code Review Report

**Performed this week**, on the teammate's Week 03 meeting planner — the same pull request reviewed in Week 03, reviewed a second time and a second deeper.

- **Repository reviewed:** https://github.com/ivanchulde/sacrament-meetings
- **Pull request reviewed:** https://github.com/ivanchulde/sacrament-meetings/pull/1
- **Review submitted:** https://github.com/ivanchulde/sacrament-meetings/pull/1#pullrequestreview-5379916250 (`COMMENTED`, 2026-10-01)
- **Prior review, for contrast:** #pullrequestreview-5311406374 (2026-09-24)

The Week 03 review was a single approving summary with one recommendation. This one is five inline comments, each verified against the running deployment rather than the source alone, and every one of them found something the first pass had missed.

### What the review found

| # | Location | Finding |
|---|---|---|
| 1 | `app/api/meetings/[id]/route.ts:17,26` | Praised the `400` / `404` split. Verified live: `/api/meetings/abc` returns `{"error":"ID de reunión inválido"}` with `400`, no `500`, no HTML. |
| 2 | `app/globals.css` | `@media print` sets `a { display: none }`, which hides **every** link, not just navigation. It works today because the only linked content is the "back" button, but it silently kills the prev/next links the moment `Pagination` is added — the one case where a printed page needs them. |
| 3 | `app/page.tsx` | `throw` where `notFound()` belongs. Verified `/meetings/999`, `/meetings/abc`, `/meetings/-1` and `/meetings/1.5` all return **HTTP 200** with a generic error page. An invalid id becomes a `500` wearing a `200`, invisible to monitoring and to any client that checks status. |
| 4 | `app/meetings/page.tsx:10` | The worst find. The route is **prerendered at build time** (`X-Nextjs-Prerender: 1`, `X-Vercel-Cache: HIT`), and `redirect()` was evaluated once — on Sunday 2026-09-20 — then frozen into the RSC payload as `NEXT_REDIRECT;replace;/meetings/1;307;`. The route still points at the September 20th meeting. The same line also computes the week wrong: `getDay()` returns `0` on Sundays, so the start-of-week offset walks backwards on every non-Sunday day. |
| 5 | `app/meetings/loading.tsx` | Praised: `role="status"` together with `aria-live="polite"` is the correct pairing, and it is a common mistake to set one without the other. |

The pattern across findings 2–4 is the one worth carrying forward: every one of them is invisible when you only read the source. The API was correct while the page built on top of it returned `200` for garbage; the print stylesheet looked deliberate; and the stale redirect is *convincing* on screen, because it renders a real meeting. All three were only caught by fetching the deployed URL and reading status headers.

These findings are recorded as review comments on the pull request. They are not yet fixed: the teammate's branch is still open, and this week's remaining capacity went into GlowBook's own appointments work. Findings 2–4 are all small and self-contained, so they are a reasonable starting point for the teammate's next pull request.

---

## 6. What Is Not Done

Stated plainly, because a report that lists only what works is not useful to a reviewer.

- **Deployment** — blocked on issue #8. No Render deployment was started, so there is no live link to submit.
- **The teammate's review findings are unfixed.** §5 lists five findings against `ivanchulde/sacrament-meetings#1`. Three are behavioural bugs in production right now: the print stylesheet hides pagination links, `/meetings/<bad-id>` returns `200` instead of `404`, and the current-meeting redirect is frozen at build time to the September 20th meeting. None are mine to land — the repository belongs to the teammate.
- **Cross-member pull request review** — the teammate still holds read-only access, so every pull request to date, including this one, was authored and merged by the same person. The Week 03 report named this as the first item to fix and it is still open. Granting write access and landing one genuinely reviewed pull request is what closes it.
- **Week and month grid calendar (FR-018).** The API already accepts arbitrary `from`/`to` windows, so the data side is ready; the grid UI is not built. The day view and list satisfy the requirement in part, not in full.
- **Staff-member filter on the appointment list (FR-023).** The query schema accepts `status` but not `staffUserId`. Booking and reassignment both support staff; filtering the list by them does not.
- **Rescheduling has no UI.** `PATCH /api/appointments/[id]` supports it and it is tested, but the day view offers status changes and deletion only. FR-019 is met by the API, not by the interface.
- **No committed test suite.** The 48 assertions described in §2 ran from temporary scripts that were deleted afterwards. They are real and reproducible, but they are not a regression suite, and the overlap race in §4 would not be caught by one.
- **Three screenshots are not in the repository** — `screenProj_run.png`, `glowBook_PDesing.png` and `glowBook_PDataDesing.png` exist in the working tree under `docs/images/`. They were checked by a human and are fine, but they are deliberately left out of this pull request: they are cited nowhere, and a screenshot nobody points at documents nothing. They earn their place once they carry a caption and a reference from the relevant report section.