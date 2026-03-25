# TASK-403: Integrate InferenceCard on Tone step

**Story:** US-064
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M20 — AI Transparency

## Description
Wire the InferenceCard into the Tone step. When the user selects a tone, show an inference card with tone characteristics and example sentences from the existing tone-samples.ts data (no API call needed).

## Technical Approach
1. Read `platform-app/src/app/onboarding/tone/page.tsx` and `platform-app/src/lib/onboarding/tone-samples.ts`
2. When user selects a tone, look up the tone sample data
3. Construct items:
   - `{ label: "Tone", value: sample.label, type: "text" }`
   - `{ label: "Characteristics", value: sample.description, type: "text" }`
   - `{ label: "Example sentences", value: sample.examples, type: "list" }`
4. Explanation: "This tone will be used across all your website content."
5. Show card immediately on selection (no async operation)

## Acceptance Criteria
- [ ] Inference card appears immediately when user selects a tone
- [ ] Shows tone label, description, and 1-2 example sentences
- [ ] Zero API calls — all data from local tone-samples.ts
- [ ] Card updates if user changes tone selection
- [ ] "Edit" resets the selection (or scrolls to tone picker)

## Dependencies
- TASK-398 (InferenceCard component)

## Files Affected
- `platform-app/src/app/onboarding/tone/page.tsx`
