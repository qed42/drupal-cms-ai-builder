# Technical Design: UX Revamp — M18 (US-063)

**Version:** 1.1 (designer refinements incorporated)
**Date:** 2026-03-21
**Platform:** Next.js (platform-app)
**Status:** Draft

---

## Scope

All changes are in the **Next.js platform-app**. No Drupal backend changes. This document maps the architecture from `architecture-ux-revamp-m18.md` to concrete implementation tasks.

---

## 1. Component Architecture

### New Components

| Component | Path | Purpose |
|-----------|------|---------|
| `ProgressStepper` | `src/components/onboarding/ProgressStepper.tsx` | Labeled section progress (Vision → Design → Content → Launch) with dots, connectors, and section labels; replaces `ProgressDots` |
| `AiInsightChip` | `src/components/onboarding/AiInsightChip.tsx` | Subtle one-liner "AI whisper" for early text steps (name, idea, audience) |
| `AiInsightCard` | `src/components/onboarding/AiInsightCard.tsx` | Multi-line "AI analysis" card for design steps with visual content support |
| `PreviewPane` | `src/components/onboarding/PreviewPane.tsx` | Right-side preview container (desktop ≥1024px) |
| `SiteSkeletonPreview` | `src/components/onboarding/SiteSkeletonPreview.tsx` | Contextual branded wireframe with browser chrome, page names, colors, fonts |
| `RecipeCard` | `src/components/onboarding/RecipeCard.tsx` | Pre-generation summary aggregating all choices |
| `SocialProofBanner` | `src/components/onboarding/SocialProofBanner.tsx` | Trust signals on start page |

### Modified Components

| Component | Changes |
|-----------|---------|
| `StepLayout.tsx` | 3-tier layout system (`centered`/`split`/`summary`), accept `layoutMode`, `previewSlot`, `insightSlot` props |
| `ProgressDots.tsx` | Deprecated — replaced by `ProgressStepper` |
| `layout.tsx` (onboarding) | Responsive container for all three layout modes |
| `dashboard/page.tsx` | Collapse subscription into inline SiteCard badge; remove 2/3+1/3 grid split |

### Step Section Mapping (for ProgressStepper)

| Section | Steps |
|---------|-------|
| Vision | start, name, idea, audience |
| Design | pages, design, brand, fonts |
| Content | follow-up, tone |
| Launch | review-settings |

### 3-Tier Layout System (Designer Refinement)

Different steps need different layouts. A uniform split-pane creates empty space on early steps.

| Tier | Layout | Steps | Rationale |
|------|--------|-------|-----------|
| **Centered** | `max-w-xl mx-auto`, single input focus | start, name, idea, audience | Single input per step — tight focus, no wasted space |
| **Split** | `grid-cols-[45fr_55fr]`, preview pane right | pages, design, brand, fonts, follow-up, tone | Enough visual data to populate preview |
| **Summary** | Full-width card layout | review-settings | RecipeCard IS the preview — no split needed |

**Insight placement by tier:**
- Centered → `AiInsightChip` inline below input (one-liner, subtle)
- Split → `AiInsightCard` in left column below inputs (multi-line, richer)
- Summary → No insight card (RecipeCard aggregates everything)

---

## 2. Color System Strategy

### Problem
Tailwind v4 `@theme inline` in `globals.css` doesn't reliably emit custom CSS variables (Sprint 23 failure).

### Research Spike (TASK-339)
Must test two approaches and prove one works:

**Option A — Dual declaration:**
```css
:root {
  --brand-500: #4856FA;
}
@theme inline {
  --color-brand-500: var(--brand-500);
}
```

**Option B — @theme without inline:**
```css
@theme {
  --color-brand-500: #4856FA;
}
```

**Color system structure (from designer review):**
- **Primary brand**: 1 hue, 50-950 scale (e.g., indigo `#4F46E5`)
- **Accent**: 1 complementary hue for CTAs/highlights (e.g., cyan `#06B6D4`)
- **Semantic**: success/warning/error/info (Tailwind built-ins)
- **Neutral**: slate (already working)

**Verification:** Render a full mini style guide page (not just one div) testing brand scale, accent scale, semantic colors, interactive states, and gradients. Inspect computed styles in Chrome/Firefox/Safari.

---

## 3. Dashboard Fix

### Root Cause Analysis
`dashboard/page.tsx` renders `SubscriptionStatus` inside `sites.map()` — one subscription card per site. If a user has multiple sites, they see duplicate subscription cards.

### Fix Approach
**Depends on data model investigation** (subscription may be account-level or site-level):
- If account-level: extract `SubscriptionStatus` above the loop
- If site-level (likely, per current schema): collapse subscription into inline badge inside `SiteCard` (plan name + status), remove the 2/3+1/3 grid split, make `SiteCard` full-width

---

## 4. Data Flow (AI Insights)

No new API endpoints. Insight cards consume existing onboarding session state:

| Step | Insight Source | Display |
|------|---------------|---------|
| name | Industry keyword detection | "Your project name suggests a {industry} website" |
| idea | `/api/ai/analyze` result | "AI detected {industry} focus with {confidence}" |
| audience | Audience analysis | "Targeting {audience} — we'll optimize tone and content" |
| pages | `/api/ai/suggest-pages` | "Recommended {N} pages based on your industry" |
| design | Selected design source | "Your design will use {style} aesthetic" |
| brand | `/api/ai/extract-colors` | "Extracted {N} colors from your brand" |
| fonts | Font selection | "Font pairing: {heading} + {body}" |
| tone | Tone settings | "Content tone: {adjectives}" |

---

## 5. Task Breakdown Summary

| Task | Title | Sprint | Priority | Effort | Dependencies |
|------|-------|--------|----------|--------|--------------|
| TASK-339 | Tailwind v4 color system spike | S25 | P0 | M | None |
| TASK-340 | SaaS onboarding UX research | S25 | P0 | L | None |
| TASK-341 | AI transparency patterns research | S25 | P1 | M | None |
| TASK-342 | Live preview UX research & wireframes | S25 | P1 | M | TASK-340 |
| TASK-343 | Color palette implementation | S26 | P0 | M | TASK-339 |
| TASK-344 | ProgressStepper component | S26 | P0 | S | None |
| TASK-345 | Dashboard subscription card dedup | S26 | P1 | S | None |
| TASK-346 | StepLayout split-pane refactor | S26 | P0 | L | TASK-342 |
| TASK-347 | AiInsightCard component | S27 | P0 | M | TASK-346 |
| TASK-348 | AiInsightCard integration per step | S27 | P0 | L | TASK-347 |
| TASK-349 | RecipeCard pre-generation summary | S27 | P1 | M | TASK-347 |
| TASK-350 | SiteSkeletonPreview component | S28 | P0 | L | TASK-346 |
| TASK-351 | PreviewPane integration with onboarding state | S28 | P0 | L | TASK-350 |
| TASK-352 | SocialProofBanner start page | S29 | P2 | S | None |
| TASK-353 | Animation polish & transitions | S29 | P2 | M | TASK-351 |
| TASK-354 | Cross-browser QA & color verification | S29 | P1 | M | TASK-343, TASK-353 |
