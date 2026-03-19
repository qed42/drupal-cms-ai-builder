# TASK-203: Enhanced Page Suggestions API

**Story:** US-036
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M6 — Onboarding Enrichment

## Description
Update the AI page suggestion endpoint to receive the full idea text (not just industry) and return page titles with 1-sentence descriptions.

## Technical Approach
- Modify `platform-app/src/app/api/onboarding/suggest-pages/route.ts`
- Update the AI prompt to include the full `idea` text, not just the detected industry
- Change response format from `string[]` to `{ title: string, description: string }[]`
- Update the prompt to generate page descriptions like "Services — Detailed descriptions of your dental procedures with patient benefits"
- Update the pages onboarding step UI to display both title and description

## Acceptance Criteria
- [ ] API returns `{ title, description }[]` instead of just titles
- [ ] AI receives full idea text for better suggestions
- [ ] Pages step UI shows both title and description for each suggestion
- [ ] Descriptions are 1 sentence explaining what the page will contain

## Dependencies
- None (modifies existing endpoint)

## Files/Modules Affected
- `platform-app/src/app/api/onboarding/suggest-pages/route.ts` (modify)
- `platform-app/src/app/onboarding/pages/page.tsx` (modify UI)
- `platform-app/src/lib/ai/prompts/` (modify or add prompt)
