# TASK-394: Build StrategyPreview panel component

**Story:** US-065
**Priority:** P1
**Estimated Effort:** L
**Milestone:** M20 — AI Transparency

## Description
Build the StrategyPreview component that renders the AI's planned strategy as a collapsible panel on the review-settings page. Uses native `<details>` element for collapse/expand with progressive enhancement.

## Technical Approach
1. Create `platform-app/src/components/onboarding/StrategyPreview.tsx` ("use client")
2. Create `platform-app/src/components/onboarding/StrategyPreviewSkeleton.tsx` (loading state)
3. Create `platform-app/src/hooks/useResearchPreview.ts` — encapsulates fetch + AbortController + loading/error state
4. StrategyPreview renders:
   - `<details>` element with `<summary>` "AI Strategy Preview"
   - Page Strategy section: grid of page cards (slug, sectionCount, keyFeature)
   - Content Approach: tone primary + example sentences
   - SEO Focus: keyword badges
   - Competitive Positioning: 2-3 bullet points
5. Desktop: `<details open>` by default. Mobile: closed by default. Use `window.matchMedia` in a ref callback to set initial `open` attribute.
6. Integrate into review-settings page below the existing input summary

## Component Specification
- Props: `{ siteId: string }`
- Internal state: `useResearchPreview(siteId)` hook
- Three states: loading (skeleton), loaded (content), error (hidden with subtle note)
- Styling: consistent with existing `bg-white/5 border border-white/10 rounded-xl` pattern

## Acceptance Criteria
- [ ] Panel renders below input summary on review-settings page
- [ ] Shows loading skeleton while Research preview runs
- [ ] Renders page strategy, tone, SEO keywords, and positioning on success
- [ ] Collapsed on mobile (<768px), expanded on desktop
- [ ] On failure: shows "Preview unavailable — your site will still generate correctly" note
- [ ] Generate button remains clickable at all times regardless of preview state
- [ ] Aborts fetch on unmount (no memory leak if user navigates away)
- [ ] `aria-busy="true"` during loading, skeleton has `aria-hidden="true"`
- [ ] `<details>` keyboard accessible: Space/Enter toggles expand/collapse

## Dependencies
- TASK-390 (research-preview API)

## Files Affected
- `platform-app/src/components/onboarding/StrategyPreview.tsx` (NEW)
- `platform-app/src/components/onboarding/StrategyPreviewSkeleton.tsx` (NEW)
- `platform-app/src/hooks/useResearchPreview.ts` (NEW)
- `platform-app/src/app/onboarding/review-settings/page.tsx` (add StrategyPreview)
