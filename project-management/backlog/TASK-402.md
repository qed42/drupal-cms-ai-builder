# TASK-402: Integrate InferenceCard on Audience step

**Story:** US-064
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M20 — AI Transparency

## Description
Wire the InferenceCard into the Audience step. After the suggest-audiences API returns, show an inference card with the primary audience label and inferred pain points.

## Technical Approach
1. Read `platform-app/src/app/onboarding/audience/page.tsx`
2. After suggest-audiences API returns, construct items:
   - `{ label: "Primary audience", value: data.suggestions[0], type: "text" }`
   - `{ label: "Pain points identified", value: data.painPoints, type: "list" }` (if non-empty)
3. Pass to StepLayout's `insightSlot`
4. Explanation: "These pain points will drive your homepage messaging and CTA language."

## Acceptance Criteria
- [ ] Inference card appears after audience suggestions load
- [ ] Shows primary audience label and 2-3 pain points
- [ ] "Edit" focuses the audience input field
- [ ] No additional API call
- [ ] Graceful when painPoints is empty (card still shows audience label)

## Dependencies
- TASK-398 (InferenceCard component)
- TASK-400 (enriched suggest-audiences API with painPoints)

## Files Affected
- `platform-app/src/app/onboarding/audience/page.tsx`
