# W02 Team: Project & Code Review Reports — GlowBook

> _Submission prepared to match the Canvas Submission Instructions for W02 Team: Project & Code Review Reports._

---

## 1. Team Meeting Summary

**Synchronous meeting — Sept 17, 2026 · 20:00 (Microsoft Teams)**

- **Team members present:** Iván Chulde, Aaron Alfaro Alfaro Barra
- **Team leader:** Aaron Alfaro (this week)

**Selected proposal — GlowBook:** A booking and client management web application for independent beauty professionals and small studios (lash technicians, hairstylists, nail artists). It replaces WhatsApp/DM juggling and paper notebooks with a single place to schedule appointments, keep client history and notes, and manage the services the studio offers.

**Why it was chosen:** It solves a real, well-scoped problem with a clear target audience, and its core workflows (sign up/in/out, CRUD for clients, services, and appointments, plus a daily dashboard) naturally satisfy the course's technical requirements — Next.js App Router, authentication, two+ data models with CRUD, three+ views, a client→server→database API cycle, and a deployable MVP — without over-expanding into accounting, marketing, or enterprise CRM territory.

---

## 2. Project Setup

- **Team public GitHub repository (initial project files):** `<https://github.com/<owner>/glowbook>` _(fill with the real URL after creating/pushing the repo)_
- **GitHub Project Board (with issues):** `<https://github.com/<owner>/glowbook/projects/1>` _(fill after creating the board)_

### Issues tracked on the board

| # | Issue (title) | Priority | Label | Assignee |
|---|---|---|---|---|
| 1 | Scaffold Next.js project with App Router, TypeScript and Tailwind | P1 | frontend | Aaron |
| 2 | Implement authentication: sign up, sign in, sign out and password reset (FR-001..FR-005) | P1 | backend | Iván |
| 3 | Design database schema and seed data: Account, Staff, Client, Service, Appointment | P1 | backend | Iván |
| 4 | Service catalog CRUD with validation and delete confirmation (FR-008..FR-010) | P1 | backend | Aaron |
| 5 | Client profiles CRUD with notes and appointment history (FR-011..FR-016) | P1 | backend | Aaron |
| 6 | Appointment calendar: create, view, edit, cancel and overlap warning (FR-017..FR-024) | P1 | backend | Iván |
| 7 | Daily dashboard with today's and upcoming appointments (FR-025..FR-027) | P2 | frontend | Aaron |
| 8 | Deploy application to Vercel with environment variables configured | P1 | infra | Iván |

---

## 3. Project Specification Document

- **Specification document (saved in the repository):** `<https://github.com/<owner>/glowbook/blob/main/docs/glowbook-spec.md>` _(fill with the real URL)_

**Reflection on building the specification with Spec-Kit AI:** Using the Spec-Kit AI tool from a short project description worked very well for speed and structure — it produced a complete draft (overview, user stories, acceptance scenarios, functional requirements, and API endpoints) in minutes. The main challenge was generic output: priorities and edge cases needed human judgment. To ensure the document accurately reflected our team's project, we reviewed every user story and requirement in our synchronous meeting and adjusted the scope, priorities, and API design before committing the final version to the repository.

---

## 4. W02 Team: Code Review Report

### GitHub Issue Evidence

- **Repository reviewed (teammate's Week 01):** https://github.com/ivanchulde/wdd430-portfolio
- **Substantive issue created:** https://github.com/ivanchulde/wdd430-portfolio/issues/1
- **Label:** `should-fix`
- It includes the problem (root layout has no `metadata`, so the site has no `<title>`/meta description), the impact (Lighthouse SEO **80** and Accessibility **95**; poor screen-reader and search experience), and a suggested fix (export a `Metadata` object in `app/layout.tsx`).

### Rendered Site Review Report

**Rendered site URL:** https://wdd430-portfolio-aniv1.vercel.app _(link from the team membership document). Note: the domain returns a 302 redirect to the Vercel login page (protected deployment), so the review was performed by running the same code (`npm run build` + `npm start`) and auditing the site locally._

Report (mobile):
- **Minimum requirements:** Meets the Week 01 assignment — Next.js App Router with `app/page.tsx` and `app/about/page.tsx`, root `layout.tsx`, reusable components, strict TypeScript, proper `.gitignore`, and `/api/hello` route.
- **Responsive behavior:** No horizontal scrolling or layout issues on mobile; the container-based layout adapts to small screens.
- **Links:** `/` and `/about` both return 200 and load correct content; "View Project" links point to GitHub and open in a new tab.
- **`/api/hello`:** Returns the expected JSON response: `{"message":"Hello from Next.js API!"}`.
- **Lighthouse (mobile):** Performance **99**, Accessibility **95**, Best Practices **100**, SEO **80** (FCP 0.8 s, LCP 1.9 s, TBT 80 ms, CLS 0).
- **CSS Overview:** No contrast errors (the `color-contrast` audit passes) and no significant unused CSS (final CSS ~3.4 KB, purged by Tailwind; `unused-css-rules` passes).
- **Project strength:** Clean, well-typed component separation (Header, Footer, ProjectList, ProjectCard, SkillCard) with a strict TypeScript setup — an easy-to-maintain base to build on for the team project.
- **Actionable improvement:** Add a `Metadata` export in the root layout with a title and meta description — it directly fixes the two failing Lighthouse audits (SEO 80 and Accessibility 95).