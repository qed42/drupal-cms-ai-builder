# TASK-405: Create summary template functions for pipeline phases

**Story:** US-067
**Priority:** P2
**Estimated Effort:** M
**Milestone:** M20 — AI Transparency

## Description
Create template functions that build human-readable, input-aware summaries from pipeline phase outputs. These are string interpolation functions (NOT AI calls) used by the status API.

## Technical Approach
1. Create `platform-app/src/lib/transparency/summary-templates.ts`
2. Implement:
   - `buildResearchSummary(brief: ResearchBriefContent): string` — e.g., "Identified your practice as family dentistry targeting families with children. Found 3 key customer needs. Noted HIPAA compliance considerations."
   - `buildPlanSummary(plan: ContentPlanContent, onboardingPages?: string[]): string` — e.g., "Organized 6 pages with 28 content sections. Added FAQ page — dental practices see higher engagement with FAQ content."
   - `buildGenerateProgressSummary(currentPage: string, pageIndex: number, totalPages: number, keywords?: string[]): string` — e.g., "Writing Services page (3 of 6). Targeting 'cosmetic dentistry portland'."
   - `buildCompletionSummary(pageCount: number, wordCount: number, imageCount: number, keywordCount: number): string`
   - `buildImpactBullets(brief, plan, onboardingData): string[]` — 3-5 bullets for dashboard
3. Each function handles missing/null fields gracefully

## Acceptance Criteria
- [ ] All functions produce grammatically correct, specific summaries
- [ ] Summaries reference user inputs (industry, audience, tone) not generic labels
- [ ] Plan summary detects proactively-added pages (pages in plan but not in onboarding data)
- [ ] Impact bullets include: tone, compliance (if any), proactive pages (if any), SEO keyword count
- [ ] Unit tests for each function with mock data covering edge cases (empty arrays, missing fields)

## Dependencies
- None

## Files Affected
- `platform-app/src/lib/transparency/summary-templates.ts` (NEW)
