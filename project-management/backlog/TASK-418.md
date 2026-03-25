# TASK-418: Build PageInsightsPanel slide-out component

**Story:** US-069
**Priority:** P2
**Estimated Effort:** M
**Milestone:** M20 — AI Transparency

## Description
Build a slide-out panel that shows page-level quality scores, keyword coverage, word count, internal link count, and an input-to-content mapping for the selected page.

## Technical Approach
1. Create `platform-app/src/app/onboarding/review/components/PageInsightsPanel.tsx` ("use client")
2. Render as `<aside>` with CSS transform transition (translateX: 100% → 0)
3. Sections:
   - Quality score badge (from `reviewScores[pageSlug].score` — 0-100 scale)
   - SEO keyword coverage: "3/3 target keywords present" (derived client-side)
   - Word count: sum of text content across sections (derived client-side)
   - Internal link count: count href props pointing to sibling page slugs (derived client-side)
   - "Your input → This page" mapping: match ContentPlan section briefs to rendered sections
4. Client-side derivation helpers:
   - `countWords(propsJson)`: parse JSON, extract text strings, count words
   - `countInternalLinks(propsJson, allSlugs)`: find href-like props matching page slugs
   - `matchKeywords(pageText, targetKeywords)`: case-insensitive keyword presence check
5. Use `next/dynamic` with `ssr: false` for lazy loading

## Component Specification
```typescript
interface PageInsightsPanelProps {
  page: PageLayout;
  pageSlug: string;
  contentPlan?: ContentPlanPage;
  reviewScore?: ReviewResult;
  allPageSlugs: string[];
  isOpen: boolean;
  onClose: () => void;
}
```

## Acceptance Criteria
- [ ] Panel slides in from right on desktop, full-screen overlay on mobile
- [ ] Shows quality score as a visual badge (color-coded: green ≥0.8, yellow ≥0.6, red <0.6)
- [ ] Shows keyword coverage count (e.g., "3/3 keywords found")
- [ ] Shows word count and internal link count
- [ ] Shows input-to-content mapping with at least 2 entries per page
- [ ] Close button + Escape key closes panel
- [ ] `role="complementary"`, `aria-label="Page insights"`
- [ ] Focus moves to panel on open, returns to trigger on close

## Dependencies
- TASK-414 (insights API + data mapper)

## Files Affected
- `platform-app/src/app/onboarding/review/components/PageInsightsPanel.tsx` (NEW)
- `platform-app/src/app/onboarding/review/page.tsx` (add trigger + panel)
