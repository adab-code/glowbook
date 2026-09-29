# GlowBook — Design System

**Status:** agreed in the Week 03 team meeting · **Last updated:** 2026-09-24
**Companion docs:** [`architecture.md`](./architecture.md) · [`data-model.md`](./data-model.md) · [`glowbook-spec.md`](./glowbook-spec.md)

---

## 1. Brand direction

| | |
|---|---|
| **Name** | GlowBook |
| **Tagline** | *Your studio, beautifully organised.* |
| **Audience** | Solo beauty professionals and small studios — often working alone, often on a phone between appointments |
| **Tone** | Calm, warm, precise. A tool that reduces anxiety about double bookings, not a loud SaaS dashboard |
| **Personality cues** | Soft rounded geometry, generous whitespace, a warm neutral canvas instead of clinical grey, one confident accent colour used sparingly |

Design priorities, in order: **legibility on a phone in a bright room → glanceable schedule → calm empty states → delight**.

---

## 2. Colour palette

### 2.1 Brand — "Glow Rose" (primary actions, active nav, focus)

| Token | Hex | Use |
|---|---|---|
| `brand-50` | `#FDF2F7` | Tinted backgrounds, hover fills on ghost buttons |
| `brand-100` | `#FAE6EF` | Selected row, active chip |
| `brand-200` | `#F4C9DC` | Decorative dividers, chart fills |
| `brand-300` | `#EBA3C1` | Disabled brand text on white |
| `brand-400` | `#DE74A1` | Hover on light surfaces only |
| `brand-500` | `#CE4C81` | Base brand — large shapes, icon fills |
| `brand-600` | `#B4346A` | **Primary button background, links, active nav** (5.84:1 on white) |
| `brand-700` | `#932A57` | Primary hover / pressed (7.75:1 on white) |
| `brand-800` | `#762449` | Primary text on `brand-50` |
| `brand-900` | `#5F213D` | Deep brand text |

### 2.2 Accent — "Studio Gold" (highlights, ratings, "glow" moments)

| Token | Hex | Use |
|---|---|---|
| `accent-100` | `#FAEECF` | Highlight chip background |
| `accent-300` | `#EAC062` | Decorative accents, calendar "now" marker |
| `accent-500` | `#C9861F` | Icon accents on tinted backgrounds |
| `accent-700` | `#855115` | Accent text (6.1:1 on white) |

### 2.3 Neutral — "Warm Stone" (surfaces, text, borders)

| Token | Hex | Use |
|---|---|---|
| `neutral-50` | `#FAF8F7` | Page background (dark mode base) |
| `neutral-100` | `#F3EFEE` | Subtle surface fill, table stripe |
| `neutral-200` | `#E6DEDA` | Borders, dividers, input outlines |
| `neutral-300` | `#D2C7C2` | Strong borders, skeleton base |
| `neutral-400` | `#A99C97` | Placeholder text, icon muted |
| `neutral-500` | `#857874` | Secondary text (4.9:1 on white) |
| `neutral-600` | `#6B605C` | Body secondary text (6.1:1) |
| `neutral-700` | `#574E4B` | Body primary text |
| `neutral-800` | `#3B3533` | Headings |
| `neutral-900` | `#221E1D` | High-emphasis text |
| `neutral-950` | `#14100F` | Light mode page background — warmer than pure white |

### 2.4 Semantic + appointment status

| Token | Text / icon | Background | Used for |
|---|---|---|---|
| `success` | `#2F7D57` | `#E8F5EE` | Validation passed, `COMPLETED` appointments |
| `warning` | `#B45309` | `#FDF3E3` | Unsaved changes, overlap warning, `NO_SHOW` |
| `danger` | `#C0342B` | `#FBEBEA` | Destructive actions, errors, `CANCELLED` |
| `info` | `#2F6F8F` | `#E9F2F7` | Neutral notices, `SCHEDULED` appointments |

Appointment status is **never communicated by colour alone** — `StatusBadge` always renders the text label next to the dot, which also satisfies the accessibility principle in our constitution (§IV).

### 2.5 Tailwind v4 token block

Paste into `src/app/globals.css`. These are the real values in the file today, and the components consume them directly as `brand-*`, `accent-*` and `neutral-*` Tailwind utilities.

**One caveat.** `globals.css` also declares a shadcn-style block of semantic variables — `--background`, `--foreground`, `--card`, `--border`, `--input`, `--ring`, `--muted`, `--muted-foreground` — with a comment saying shadcn components read them. They do not: no component references a single one, and there is no `--primary`, which the shadcn schema expects. They exist so a future `shadcn add` has somewhere to land. Either wire them up or delete them, but do not describe them as in use.

```css
@import "tailwindcss";

@theme inline {
  /* brand */
  --color-brand-50: #fdf2f7;
  --color-brand-100: #fae6ef;
  --color-brand-200: #f4c9dc;
  --color-brand-300: #eba3c1;
  --color-brand-400: #de74a1;
  --color-brand-500: #ce4c81;
  --color-brand-600: #b4346a;
  --color-brand-700: #932a57;
  --color-brand-800: #762449;
  --color-brand-900: #5f213d;

  /* accent */
  --color-accent-100: #faeecf;
  --color-accent-300: #eac062;
  --color-accent-500: #c9861f;
  --color-accent-700: #855115;

  /* neutral (warm stone) */
  --color-neutral-50: #faf8f7;
  --color-neutral-100: #f3efee;
  --color-neutral-200: #e6deda;
  --color-neutral-300: #d2c7c2;
  --color-neutral-400: #a99c97;
  --color-neutral-500: #857874;
  --color-neutral-600: #6b605c;
  --color-neutral-700: #574e4b;
  --color-neutral-800: #3b3533;
  --color-neutral-900: #221e1d;
  --color-neutral-950: #14100f;

  /* semantic */
  --color-success: #2f7d57;
  --color-success-bg: #e8f5ee;
  --color-warning: #b45309;
  --color-warning-bg: #fdf3e3;
  --color-danger: #c0342b;
  --color-danger-bg: #fbebea;
  --color-info: #2f6f8f;
  --color-info-bg: #e9f2f7;

  /* typography */
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-fraunces), ui-serif, Georgia, serif;

  /* radii */
  --radius-card: 1rem;
  --radius-control: 0.5rem;
}
```

Dark mode is class-based (`<html class="dark">`); the dark set is `neutral-950` page background, `neutral-900` surfaces, `neutral-100` text, `brand-300` as the primary accent, and the semantic backgrounds at 20% opacity. Dark mode ships after the Week 04 milestone.

---

## 3. Typography

| Role | Family | Source | Why |
|---|---|---|---|
| Body / UI | **Geist Sans** | `next/font/google` (already installed) | Excellent legibility at 14–16px, variable weight, neutral so it never competes with the brand |
| Display / page titles | **Fraunces** | `next/font/google`, variable, `opsz` axis | A soft, warm serif that signals "boutique studio" instead of "enterprise dashboard". `globals.css` applies `font-display` to every `h1` and `h2` regardless of size, so the "only above 24px" intent below is not enforced — `CardTitle` renders an `h2` at `text-lg` (18px) |
| Times / numbers | Geist with `tabular-nums` | utility class | Calendar times and prices must not shift width as digits change. **Not yet applied** — `tabular-nums` appears nowhere in `src/`, so the rule is stated but not implemented |

### Type scale (mobile → desktop, `clamp()` where marked)

| Token | Size / line height | Family | Weight | Used for |
|---|---|---|---|---|
| `display` | `clamp(2.5rem, 6vw, 3.5rem)` / 1.05 | Fraunces | 600 | Landing hero only |
| `h1` | `clamp(1.75rem, 3vw, 2rem)` / 1.2 | Fraunces | 600 | Page titles |
| `h2` | `1.25rem` / 1.75rem | Geist Sans | 600 | Section headers, card titles |
| `h3` | `1rem` / 1.5rem | Geist Sans | 600 | Grouping headers |
| `body` | `1rem` / 1.5rem | Geist Sans | 400 | Default |
| `body-sm` | `0.875rem` / 1.25rem | Geist Sans | 400 | Secondary text, table cells, helper text |
| `label` | `0.8125rem` / 1rem | Geist Sans | 500 | Form labels, nav items |
| `caption` | `0.75rem` / 1rem | Geist Sans | 500 | Timestamps, metadata |

**Rules:** exactly one `h1` per page; headings never skip a level; body copy is never centred or italic; line length capped with `max-w-prose` on notes and long descriptions; letter-spacing is `normal` except `tracking-wide` on uppercase `caption` labels.

```ts
// src/app/layout.tsx
import { Geist, Geist_Mono, Fraunces } from "next/font/google";

export const fonts = {
  geistSans: Geist({ variable: "--font-geist-sans", subsets: ["latin"] }),
  geistMono: Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] }),
  fraunces: Fraunces({ variable: "--font-fraunces", subsets: ["latin"] }),
};
```

---

## 4. Spacing, layout & breakpoints

### 4.1 Spacing

4px base scale, using Tailwind's default steps. Semantic rules so layouts look the same across members' branches:

| Context | Utility | Value |
|---|---|---|
| Page gutter | `px-4 sm:px-6` | 16 / 24px — the built layout stops at `sm`; the `lg:px-8` step in the table below is not applied |
| Between form fields | `space-y-4` | 16px |
| Between cards in a grid | `gap-6` | 24px |
| Between page sections | `space-y-8` | 32px |
| Page title → content | `mb-6` | 24px |
| Card internal padding | `p-4 sm:p-6` | 16 / 24px |
| Inline icon ↔ label | `gap-2` | 8px |
| Dense calendar blocks | `gap-1 p-2` | 4 / 8px |
| Minimum touch target | `min-h-11 min-w-11` | 44px — non-negotiable on mobile |

### 4.2 Layout

| Pattern | Rule |
|---|---|
| Content width | `px-4 sm:px-6` — the planned `max-w-7xl` cap is **not applied**, so long-form pages run the full width of the content column |
| App shell | Flex row: sidebar `w-60` fixed ≥`md`, header above the content, page scrolls as a whole. There is no independent content scroller, and no `AppShell` component — the shell is inline in `src/app/(app)/layout.tsx` |
| Mobile navigation | **Not built, and the current fallback breaks a MUST.** The plan was a shadcn `Sheet` behind a hamburger below `lg`. What exists instead is a horizontal nav strip with `overflow-x-auto` in the header (`app-header.tsx:54`). Constitution §IV requires every view to work without horizontal scrolling, so this is an open accessibility bug, not a styling preference |
| Forms | One column, but **no `max-w-lg`** — the built forms use `space-y-4` with no width cap; label above input, error below in `text-sm text-danger` |
| Lists vs tables | `DataTable` on ≥`md`; on mobile it renders stacked `Card`s with label/value rows — never a horizontally scrolling table |
| Page structure | `PageHeader` (title + description + primary action) → optional toolbar/filters → content → pagination |
| Density | Comfortable by default; the calendar is the only dense surface |

### 4.3 Breakpoints

Mobile-first. `sm 640` · `md 768` · `lg 1024` (sidebar appears, 2-column grids) · `xl 1280` (3-column grids, calendar week view). **375px is the primary design target**; nothing may require horizontal scrolling at 320px.

### 4.4 Radii, borders, elevation

| Token | Value | Used for |
|---|---|---|
| `--radius-control` | `0.5rem` | Buttons, inputs, selects |
| `--radius-card` | `1rem` | Cards, panels, dialogs |
| `rounded-full` | — | Badges, avatars, status dots |
| Border | `1px solid var(--color-neutral-200)` | Cards, inputs, dividers |
| Elevation | `shadow-xs` rest → `shadow-sm` hover → `shadow-md` popovers/dialogs | No heavy shadows; a "glow" `shadow-brand-200/40` is reserved for the primary CTA hover |

### 4.5 Motion

`150ms` for hover/colour, `200ms` for panel and sheet transitions, `300ms` for page-level fades — all `ease-out`. Every animation is wrapped in `motion-reduce:transition-none`. No parallax, no autoplay, no looping motion.

---

## 5. Component recipes

The four primitives in `src/components/ui/` follow shadcn's *conventions* — `cn()`, `cva` variants, `data-slot` attributes, the same Radix primitives — but they are hand-built and deliberately diverge: `button` uses `primary`/`danger` variants where shadcn uses `default`/`destructive`, and the colours come from this project's warm scale rather than a shadcn base colour. The variants below are GlowBook-specific on purpose, not "layered on" an unmodified shadcn base.

```ts
// button.tsx variants — cva
const buttonVariants = cva(base, {
  variants: {
    variant: {
      primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800",
      secondary: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
      outline: "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50",
      ghost: "text-brand-700 hover:bg-brand-50",
      danger: "bg-danger text-white hover:bg-danger/90",
    },
    size: {
      sm: "h-9 px-3 text-body-sm",
      md: "h-11 px-4 text-body",
      lg: "h-12 px-6 text-body",
      icon: "h-11 w-11",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});
```

| Component | Convention |
|---|---|
| `FormField` | `Label` (label token) → control → `FormMessage` (`text-danger`, `role="alert"`) → optional `FormDescription`. The control's `id` is wired to the label via `htmlFor`/`id` |
| `StatusBadge` | `rounded-full px-2 py-0.5 text-caption` + coloured dot, **sentence case rather than uppercase**. Scheduled `info`, Completed `success`, Cancelled `danger`, No-show `warning` |
| `EmptyState` | Centred `max-w-sm`, `text-brand-500` icon in a `brand-50` circle, one-sentence message, primary CTA, `py-16`. The icon also uses decorative glyphs (`✦ ▤ ◍ ◉ ⚙`) in place of an icon set, since no icon library is installed |
| `ConfirmDialog` | shadcn `AlertDialog`. Destructive confirm button is `variant="danger"` and the copy names the record and the consequence |
| `DataTable` | `min-w-0` columns, `text-body-sm`, row hover `bg-neutral-50`, sticky `Topbar`-level header, mobile fallback to `Card` list |
| `PageSkeleton` | `animate-pulse` blocks matching the final layout's box sizes so nothing shifts on load |
| Focus ring | `focus-visible:ring-2 focus-visible:ring-brand-500` on every interactive element — **`ring-offset-2` is not applied** anywhere, and `globals.css` also sets a global `outline: 2px solid` that competes with it |

---

## 6. Accessibility commitments

1. Body text ≥ 4.5:1 contrast; large text and UI borders ≥ 3:1. `brand-600` and `neutral-600` are the darkest brand/neutral values used for text.
2. Status is never colour-only — every badge has a text label.
3. Every input has a visible `<label>`; placeholders are never the only label.
4. Errors are announced (`role="alert"`) and described through `aria-describedby`.
5. Keyboard: modals trap focus and close on `Escape`; the calendar grid is arrow-key navigable.
6. Semantic landmarks (`header`, `nav`, `main`, `footer`) and one `h1` per page.
7. Touch targets ≥ 44px; the primary booking action sits in the bottom third of the mobile viewport.
8. `prefers-reduced-motion` is respected globally.

---

## 7. Voice & copy

- Sentence case for headings and buttons; no exclamation marks; no emoji in product UI.
- Errors say what happened **and** what to do: "That time overlaps Ana's 2:00 PM appointment. Pick another slot or cancel the existing one."
- Empty states suggest the next action: "No clients yet. Add your first client to start booking."
- Dates as "Tue 24 Sep · 2:00 PM"; money as `$45.00` using the `Account.currency` code.
