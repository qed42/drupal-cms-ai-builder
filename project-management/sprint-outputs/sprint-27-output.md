# Sprint 27 Output: UX Revamp — Foundation

**Completed:** 2026-03-21
**All 4 tasks DONE**

## TASK-343: Color Palette (Proven Approach)

- Cleaned `globals.css`: removed spike comments, Option A test color (`--test-a`), and `:root` test vars
- Finalized indigo brand (50–950) and cyan accent (50–950) palettes using `@theme inline` direct hex (Option C — proven in S26)
- Deleted `/color-spike` test page and directory
- All existing `brand-*` and `accent-*` class references unchanged — no regressions

**Files changed:**
- `platform-app/src/app/globals.css` — cleaned and finalized
- `platform-app/src/app/color-spike/page.tsx` — deleted

## TASK-344: ProgressStepper Component

- Added `STEP_SECTIONS` mapping (Vision/Design/Content/Launch) to `onboarding-steps.ts`
- Added `getSectionForStep()` utility function
- Created `ProgressStepper.tsx` with:
  - **Desktop (≥768px):** 4 labeled sections with dots, connector lines, and step fraction below active dot
  - **Mobile (<768px):** Single-line section name + progress bar
  - Three visual states: completed (filled brand-500), active (ring + pulse), upcoming (dimmed)
- Replaced `ProgressDots` usage in `StepLayout`, `start/page.tsx`, and `review-settings/page.tsx`
- `ProgressDots.tsx` retained but deprecated (no longer imported)

**Files changed:**
- `platform-app/src/lib/onboarding-steps.ts` — added sections config
- `platform-app/src/components/onboarding/ProgressStepper.tsx` — new
- `platform-app/src/app/onboarding/start/page.tsx` — switched to ProgressStepper
- `platform-app/src/app/onboarding/review-settings/page.tsx` — switched to ProgressStepper

## TASK-345: Dashboard Subscription Card Dedup

- **Data model:** Subscription is site-level (1:1 via `siteId` in Prisma schema)
- Removed `grid-cols-3` split from dashboard — `SiteCard` now renders full-width
- Added `subscription` prop to `SiteCard` with inline plan badge (e.g., "Free Trial", "Pro Plan")
- Removed `SubscriptionStatus` import from dashboard page
- `SubscriptionStatus.tsx` component retained (unused, no code imports it)

**Files changed:**
- `platform-app/src/app/dashboard/page.tsx` — removed grid split, pass subscription inline
- `platform-app/src/components/dashboard/SiteCard.tsx` — added plan badge

## TASK-346: StepLayout 3-Tier Layout Refactor

- Added 3 layout modes via `layoutMode` prop:
  - **`centered`** (default): `max-w-xl mx-auto` centered, inline insight chip — matches existing look
  - **`split`**: `grid-cols-[45fr_55fr]` on desktop (≥1024px), left form + right preview, mobile stacks single-column with preview hidden
  - **`summary`**: full-width `max-w-4xl` card layout for review step
- Added `previewSlot` and `insightSlot` optional props
- Auto-detection: `previewSlot` present → split; otherwise → centered; explicit `layoutMode` overrides
- Integrated `ProgressStepper` (replaces `ProgressDots`) in all 3 modes
- Form submission preserved in all modes

**Files changed:**
- `platform-app/src/components/onboarding/StepLayout.tsx` — full rewrite with 3-tier system
