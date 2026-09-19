# GlowBook Constitution

## Core Principles

### I. User-First MVP Slices

Every feature ships as the smallest independently useful slice the user can touch and get value from (booking a real appointment, saving a real client). No slice may depend on a feature that does not yet exist; each P1 slice MUST be testable, deployable, and demonstrable on its own. Clear purpose is required — no organizational-only features.

### II. Data Integrity & Validation (NON-NEGOTIABLE)

Every write MUST validate required fields before saving and show clear validation errors. Deletions that would orphan or damage related records (a client or service referenced by appointments, a staff member with scheduled shifts) MUST warn the user and require explicit confirmation before proceeding. Overlapping non-cancelled appointments MUST be detected and warned before a booking is confirmed.

### III. Security & Privacy by Default

Authentication is required to access any studio data, and every studio's records MUST be isolated from every other studio (tenant isolation). Password resets MUST use secure, time-limited links. The system MUST NOT expose account existence or other account details beyond a generic message on failed authentication.

### IV. Responsive & Accessible UX

Every view MUST work on mobile and desktop without horizontal scrolling or layout breakage. UI MUST use semantic HTML, sufficient color contrast, and clear empty states instead of blank lists. Accessibility fixes are bug fixes, not nice-to-haves.

### V. Testable & Maintainable

The app MUST use strict TypeScript with typed props, state, and API responses; reusable components shared across pages; and a defined design system (palette, type scale, component library). Consistent formatting is required. New functionality MUST remain consistent with the existing style and structure.

## Technical Constraints

- Framework: Next.js using the App Router, with React and TypeScript, styled with Tailwind CSS.
- Database: MongoDB, PostgreSQL (Supabase), or another managed platform decided by the team; schema covers Account (Studio), Staff User, Client, Service, and Appointment.
- Authentication: Auth.js v5 (NextAuth.js) or Clerk, per the course default.
- Hosting: Vercel or similar; environment variables for DB credentials and auth secrets.
- API: Route handlers under `app/api/`; a client→server→database round trip is required (course requirement).

## Development Workflow

- All work is tracked on the GitHub Project Board (To Do → In Progress → Review → Done).
- Use feature branches and pull requests; each PR MUST be reviewed by at least one other member within 24 hours.
- Each issue represents small, ideally 4–8 hour work; one primary owner per issue.
- Weekly synchronous team meetings: review sprint goals, blockers, and next steps; rotate meeting leadership.
- Before marking Done, work MUST pass build/lint and the reviewing teammate's check.

## Governance

This constitution supersedes ad-hoc practices and informal conventions. Amendments require documentation of the change, team agreement in a weekly meeting, and a migration plan when behavior changes. Complexity MUST be justified against an actual user need (YAGNI). All PRs and reviews verify compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-09-17 | **Last Amended**: 2026-09-19