# Sprint 15 Output: UX Overhaul Phase 1 — Identity & Trust

**Milestone:** M11 — Product Identity & UX Quality
**Date:** 2026-03-19
**Status:** Complete

## Tasks Delivered

| ID | Task | Status | Key Changes |
|----|------|--------|-------------|
| TASK-281 | Fix brand-tokens.css deleted by cache flush | Done | CSS moved to `public://brand/`, logo path fix in provisioning |
| TASK-271 | Product Brand Identity | Done | Teal palette, Inter font, SVG favicon, brand.ts constants |
| TASK-272 | Auth Screen Redesign | Done | Split layout with value proposition, logo on auth pages |
| TASK-273 | Onboarding Visual Overhaul | Done | Step-specific icons, labeled progress, compelling start hero |
| TASK-274 | Pre-Generation Review Step | Done | New `/onboarding/review-settings` page with settings summary |
| TASK-275 | Generation Progress UX | Done | User-friendly labels, completion summary with page count |
| TASK-276 | Dashboard Redesign | Done | Product logo nav, site avatar, overflow menu for dev actions |

## New Files Created

- `platform-app/src/lib/brand.ts` — Product brand constants (name, tagline, colors)
- `platform-app/public/favicon.svg` — SVG favicon with brand color
- `platform-app/src/components/onboarding/StepIcon.tsx` — Step-specific icons for 11 onboarding steps
- `platform-app/src/app/onboarding/review-settings/page.tsx` — Pre-generation review step

## Files Modified

### TASK-281 (Bug Fix)
- `drupal-site/.../BrandTokenService.php` — CSS output URI: `public://css/` → `public://brand/`; logo handles `public://` stream wrapper
- `drupal-site/.../ai_site_builder.module` — `hook_page_attachments()` CSS path updated
- `provisioning/src/steps/09-apply-brand.ts` — Copies logo to Drupal files dir, rewrites path to `public://`

### TASK-271 (Brand Identity)
- `platform-app/src/app/globals.css` — Brand color tokens (teal-50 to teal-950), Inter font
- `platform-app/src/app/layout.tsx` — Inter + JetBrains Mono fonts, updated metadata, favicon
- `platform-app/src/app/dashboard/layout.tsx` — Product name "Space AI"
- **27 files** — Bulk replacement: `indigo-*` → `brand-*`, `purple-*` → `brand-*`, gradient hex → neutral slate

### TASK-272 (Auth Redesign)
- `platform-app/src/app/(auth)/layout.tsx` — Split layout with left value prop panel
- `platform-app/src/app/(auth)/login/page.tsx` — Logo, refined copy, slate-950 background
- `platform-app/src/app/(auth)/register/page.tsx` — Logo, "Get Started Free" CTA, value messaging

### TASK-273 (Onboarding Overhaul)
- `platform-app/src/components/onboarding/StepLayout.tsx` — Uses StepIcon instead of pulsing bars
- `platform-app/src/components/onboarding/ProgressDots.tsx` — Step label + number + segmented bar
- `platform-app/src/app/onboarding/start/page.tsx` — Hero with product logo, teal CTA, value prop
- `platform-app/src/app/onboarding/layout.tsx` — Removed pulse animation
- `platform-app/src/lib/onboarding-steps.ts` — Added review-settings step (11 total)

### TASK-274 (Review Step)
- `platform-app/src/app/onboarding/tone/page.tsx` — Navigates to review-settings instead of generating

### TASK-275 (Progress UX)
- `platform-app/src/components/onboarding/PipelineProgress.tsx` — User-friendly phase labels
- `platform-app/src/app/onboarding/progress/page.tsx` — Completion summary, "Review Your Website" CTA

### TASK-276 (Dashboard Redesign)
- `platform-app/src/app/dashboard/layout.tsx` — Product logo, nav links, wider layout
- `platform-app/src/components/dashboard/SiteCard.tsx` — Site avatar, color bar, "Visit Site" for live, overflow menu

## Brand Identity Summary

| Element | Before | After |
|---------|--------|-------|
| Primary color | Indigo (#6366f1) | Teal (#14b8a6) |
| Background | `#0a0a2e` navy/purple | `#0f172a` neutral slate |
| Font | Geist (Next.js default) | Inter + JetBrains Mono |
| Product name | "Drupal CMS" / none | "Space AI" |
| Favicon | Next.js default | Custom SVG (teal logo mark) |
| Auth layout | Centered card on gradient | Split layout with value prop |
| Step visuals | Generic pulsing bars | Step-specific colored icons |
| Progress | Dots only | "Step 3 of 11 — Your Audience" |
| Pipeline labels | "Research → Plan → Generate" | "Analyzing your business → Designing your pages → Writing your content" |

## Test Results

| Suite | Tests | Passed | Failed |
|-------|-------|--------|--------|
| Sprint 14.1 | 16 | 16 | 0 |
| Sprint 14 QA | 36 | 36 | 0 |
| Sprint 14 Unit | 44 | 44 | 0 |
| Sprint 13 QA | 44 | 44 | 0 |
| Sprint 13 Unit | 36 | 36 | 0 |
| Sprint 12 | 8 | 8 | 0 |
| Sprint 11 | 14 | 14 | 0 |
| Sprint 10 | 18 | 18 | 0 |
| **Total** | **216** | **216** | **0** |

TypeScript: **PASS** (0 errors, excluding pre-existing vitest type declarations)

Note: Older test suites (sprint-05, task-100 series) check for replaced brand tokens (`Geist`, `indigo-*`) and fail as expected.
