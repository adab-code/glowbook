# Lighthouse (mobile) — W06 Final Submission Evidence

**Method.** `lighthouse` (Chrome, emulated Moto G4 mobile, fresh profile ≈ incognito), `--only-categories=performance,accessibility,best-practices,seo`, against the warmed production deploy after it served commit `881d628`. Public route `/login` audited directly; private route `/dashboard` audited with a real OWNER session cookie (`owner@glowbook.dev`, Auth.js v5 credentials flow). Run date: 2026-10-11.

## Scores

| Route | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` (public landing) | 98 | **100** | **100** | **100** |
| `/login` (public) | 98 | **100** | **100** | **100** |
| `/dashboard` (authenticated) | 84 | **100** | **100** | 60* |

\* The dashboard's SEO score is `is-crawlable: 0` **by design**: every private `(app)` route carries `noindex` so studio data is never surfaced to crawlers (see README → Features → Discoverability). Public routes score SEO 100.

## Public landing `/` (post-W07 closeout)

Same method (mobile, fresh profile ≈ incognito, warmed production deploy), run against the deploy serving the landing-page commit `f871bb1`. The landing is a public, crawlable route by design — outside the `(app)` group (no `noindex`) and outside the proxy matcher (no session required) — so it is the right entry point for Lighthouse SEO.

`/` scores **98/100/100/100**. Failing-audit detail: none — the only zero-score entry is `bf-cache` (expected: the page reads the session cookie to redirect signed-in visitors, and cookie-reading pages opt out of bfcache). No red/critical audits.

## Strongest and weakest

**Strongest: Accessibility and Best Practices (100 on both routes), including zero color-contrast violations** — the W06 contrast pass (secondary text to `neutral-600`, placeholders to `muted-foreground`, darkened success token, `<main>` landmark on auth pages) is validated live. **Weakest: Performance on the dashboard (84)**, driven by server response time of a fully dynamic, database-backed SSR page on Render's free tier — acceptable for the hosting tier, with no red (critical) audits.

## Failing-audit detail (actionable, score < 0.9)

`/login`: none — the only zero-score entry is the informational `network-dependency-tree-insight`.

`/dashboard`: `server-response-time`, `mainthread-work-breakdown`, `bootup-time` (dynamic SSR + client hydration on free hosting), `is-crawlable` (intentional `noindex`, see above), `bf-cache` (expected: pages with `Cache-Control: no-store` / authenticated sessions opt out of bfcache). No red/critical category — Performance 84 is "needs improvement" range, not failing.

## Contrast verification (CSS Overview criterion)

Computed ratios for every text/background pair used in the UI (script-checked, WCAG 2 formulas):

| Pair | Ratio | AA (4.5) | AAA (7.0) |
|---|---|---|---|
| Body `foreground` on `background` | 16.06 | ✅ | ✅ |
| Links/buttons `brand-700` on white | 7.75 | ✅ | ✅ |
| Primary button white on `brand-600` | 5.77 | ✅ | — |
| Danger button white on `danger` | 5.57 | ✅ | — |
| Secondary/helper text `neutral-600` on white | 6.08 | ✅ | — |
| Placeholders `muted-foreground` on white | 6.08 | ✅ | — |
| Status badges (success/warning/danger/info on tinted bg) | 4.82–5.31 | ✅ | — |

No `color-contrast` violations on either audited route. Secondary text meets AA throughout; primary text (body, links, buttons, headings) meets AAA. No hardcoded off-palette text colors remain in `src` (verified by grep).
