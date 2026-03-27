# Sprint 49: UX Modernization — Step Consolidation Part 2

**Milestone:** M25 — Onboarding UX Modernization
**Duration:** 2 days
**Predecessor:** Sprint 48 (Step Consolidation Part 1 — TODO)
**Architecture:** `architecture-onboarding-ux-modernization.md` (ADR-1)

## Sprint Goal

Complete the step consolidation by building the composite `brand` page (merging brand + fonts with tabs) and updating the entire step configuration, routing, and ProgressStepper for the final 8-step flow.

## Tasks

| ID | Task | Effort | Depends On | Status |
|----|------|--------|------------|--------|
| TASK-480 | Composite step — Brand page (brand + fonts, tabbed) | L | TASK-474, TASK-475 | TODO |
| TASK-481 | Update step config, routing & ProgressStepper for 8-step flow | L | TASK-478, TASK-479, TASK-480 | TODO |

## Execution Order

```
Wave 1: TASK-480
  - Build the tabbed brand page (Colors + Typography tabs)
  - Requires shadcn Tabs component (install first)
  - Independent of TASK-478/479 pages

Wave 2: TASK-481
  - MUST run after all 3 composite pages (TASK-478, 479, 480) are complete
  - Updates the central step config, redirects, progress stepper
  - Full regression test of the complete 8-step flow
```

## Page Architecture

### TASK-480: `/onboarding/brand`
```
┌──────────────────────────────┬─────────────────────────┐
│                              │                         │
│  [Colors]  [Typography]      │     ArchiePanel         │
│  ─────────────────────────   │                         │
│                              │  Colors tab:            │
│  Tab: Colors                 │    extracted palette     │
│  ┌────────────────────────┐  │  Typography tab:        │
│  │ Upload: Logo            │  │    font pair usage     │
│  │ Upload: Brand Kit       │  │                         │
│  │                          │  │  Combined summary      │
│  │ Extracted Colors:        │  │  when both have data   │
│  │ [●] [●] [●] [●] [+]    │  │                         │
│  └────────────────────────┘  │                         │
│                              │                         │
│  Tab: Typography             │                         │
│  ┌────────────────────────┐  │                         │
│  │ Font Previews (4 tiles) │  │                         │
│  │ Heading: [selector]     │  │                         │
│  │ Body:    [selector]     │  │                         │
│  │ Custom Upload: [zone]   │  │                         │
│  └────────────────────────┘  │                         │
│                              │                         │
│        [Continue →]          │                         │
└──────────────────────────────┴─────────────────────────┘
```

### TASK-481: Step Config Change
```
BEFORE (13 steps, 4 sections):
  Your Business:  start, theme, name, idea, audience
  Site Structure: pages, design, brand, fonts
  Brand & Style:  images, follow-up, tone
  Review & Build: review-settings

AFTER (8 steps, 4 sections):
  Your Business:  start, describe
  Design:         style, brand
  Content:        pages, images, details
  Launch:         review-settings
```

## Dependencies & Risks

- **shadcn Tabs component** — TASK-480 requires installing Tabs (`npx shadcn@latest add tabs`). Must style for dark theme and brand colors.
- **Font loading in tab** — Google Fonts stylesheet must persist across tab switches (don't re-fetch on tab change).
- **Redirect coverage** — TASK-481 sets up 8 redirect routes. Must test each with query params preserved (especially `?siteId=`).
- **Resume session mapping** — TASK-481 must handle existing sessions saved with old step slugs. The resume API needs a mapping: `name|idea|audience` → `describe`, `theme|design|tone` → `style`, `fonts` → `brand`, `follow-up` → `details`.
- **ProgressStepper redesign** — With 8 steps (not 13), dots are now spacious enough to show step labels on desktop. This is a visual improvement that comes for free.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| L | 2 | TASK-480, TASK-481 |
| **Total** | **2 tasks** | |

## Definition of Done

- [ ] `/onboarding/brand` has Colors and Typography tabs
- [ ] Tab state persists across switches (no data loss)
- [ ] shadcn Tabs component installed and dark-styled
- [ ] `onboarding-steps.ts` defines 8 steps in 4 sections
- [ ] All 8 redirect routes work (old slug → new slug, preserving query params)
- [ ] ProgressStepper renders 8 steps with labels on desktop
- [ ] Mobile progress bar shows "Step X of 8"
- [ ] Session resume maps old slugs to new ones
- [ ] Start page CTA navigates to `/onboarding/describe`
- [ ] Full flow regression: start → describe → style → brand → pages → images → details → review-settings
