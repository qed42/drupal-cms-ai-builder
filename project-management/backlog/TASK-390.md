# TASK-390: Create `/api/ai/research-preview` endpoint

**Story:** US-066
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M20 — AI Transparency

## Description
Create a new API route handler that runs the Research phase standalone and returns a human-readable strategy preview. Implements cache-through pattern: checks OnboardingSession for a cached preview before running AI.

## Technical Approach
1. Create `platform-app/src/app/api/ai/research-preview/route.ts` as a GET handler
2. Authenticate request (existing session middleware pattern)
3. Load OnboardingSession for the siteId
4. Compute input hash via `computeInputHash(session.data)` — hash of idea + audience + industry + tone + pages + differentiators + followUpAnswers
5. If `session.previewInputHash === currentHash` and `session.researchPreview` exists, return cached data with `cached: true`
6. Otherwise, call existing `runResearchPhase()` from `platform-app/src/lib/pipeline/phases/research.ts`
7. Transform ResearchBrief into the `ResearchPreview` response shape (project only needed fields, sanitize competitor names)
8. Store result in `OnboardingSession.researchPreview` + `previewInputHash`
9. Return response with 25s server-side timeout

## Component Specification
- Server-only route handler — no client component
- Uses existing `runResearchPhase()` — do NOT duplicate AI logic
- Response validated against `ResearchPreviewSchema` (Zod) from `lib/transparency/types.ts`

## Acceptance Criteria
- [ ] GET `/api/ai/research-preview?siteId=X` returns structured preview data
- [ ] Cached results return in <100ms with `cached: true`
- [ ] Uncached results complete within 20s for typical inputs
- [ ] Response includes: industry, targetAudience (with painPoints), toneGuidance (with examples), seoKeywords, competitivePositioning, pageStrategy
- [ ] No real competitor names in competitivePositioning (use "typical [industry] websites")
- [ ] Returns `{ success: false, error: "..." }` on timeout or AI failure (not a 500)
- [ ] Requires authenticated session

## Dependencies
- TASK-391 (Prisma schema migration for researchPreview fields)
- TASK-392 (input hash utility)

## Files Affected
- `platform-app/src/app/api/ai/research-preview/route.ts` (NEW)
- `platform-app/src/lib/transparency/types.ts` (NEW — shared Zod schemas)
