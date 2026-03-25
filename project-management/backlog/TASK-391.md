# TASK-391: Add researchPreview fields to OnboardingSession model

**Story:** US-066
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M20 — AI Transparency

## Description
Add two nullable fields to the OnboardingSession Prisma model for caching the Research preview result and its input hash.

## Technical Approach
1. Add to `platform-app/prisma/schema.prisma`:
   ```prisma
   model OnboardingSession {
     // ... existing fields ...
     researchPreview  Json?     @map("research_preview")
     previewInputHash String?   @map("preview_input_hash")
   }
   ```
2. Run `npx prisma migrate dev --name add-research-preview-cache`
3. Update the `/api/onboarding/save` endpoint to invalidate the cache when preview-relevant inputs change (idea, audience, industry, tone, pages, differentiators, followUpAnswers)

## Acceptance Criteria
- [ ] Migration applies cleanly (no data loss — fields are nullable)
- [ ] OnboardingSession records can store and retrieve JSON researchPreview data
- [ ] Saving onboarding data that changes preview-relevant fields nulls out researchPreview and previewInputHash
- [ ] Saving data that changes only non-preview fields (name, colors, fonts, design_source) does NOT invalidate the cache

## Dependencies
- None

## Files Affected
- `platform-app/prisma/schema.prisma`
- `platform-app/prisma/migrations/` (auto-generated)
- `platform-app/src/app/api/onboarding/save/route.ts` (add invalidation logic)
