# TASK-491: Page-Level Insights Panel in Review Editor

**Story:** US-069
**Priority:** P2
**Effort:** M
**Milestone:** M20 — AI Transparency

## Description

Add a slide-out insights panel to the review editor that shows quality metrics, SEO coverage, and input-to-content mapping for each page. Data comes from existing pipeline metadata (`_review`, `ResearchBrief`, `ContentPlan`).

## Acceptance Criteria

- [ ] Page info icon ("i") visible next to each page title in review editor
- [ ] Clicking icon opens slide-out panel on desktop, full-screen overlay on mobile
- [ ] Panel shows: quality score (from `_review.score`), SEO keyword coverage (X/Y present), word count, internal link count
- [ ] "Your input → This page" section shows 3+ mappings (e.g., "cosmetic procedures" → Cosmetic Dentistry section)
- [ ] Data comes from existing stored pipeline metadata — no additional AI calls
- [ ] Panel closes on outside click or Escape key
- [ ] Panel content renders gracefully when partial data is available (missing _review, etc.)

## Technical Notes

- Quality scores: `blueprint.payload._review[pageSlug].review.score` and `.checks[]`
- Word count / link count: derive client-side from blueprint page data
- Input-to-content mapping: needs a lightweight mapping constructed during Generate phase — record which user inputs (services, differentiators, followUpAnswers) influenced each section
- Target keywords per page from ContentPlan (already stored in blueprint)

## Files to Create/Modify

- `platform-app/src/components/review/PageInsightsPanel.tsx` (new)
- `platform-app/src/app/onboarding/review/page.tsx` (add info icon + panel trigger)
- `platform-app/src/lib/pipeline/orchestrator.ts` (add input-mapping metadata during generate)
