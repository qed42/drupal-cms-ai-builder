# TASK-201: Follow-up Questions Onboarding Step

**Story:** US-033
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M6 — Onboarding Enrichment

## Description
Add a new onboarding step after fonts that presents industry-specific follow-up questions. The step renders questions dynamically from the industry questions config based on the detected industry.

## Technical Approach
- Create new route: `platform-app/src/app/onboarding/follow-up/page.tsx`
- Read detected industry from onboarding session data
- Call `getQuestionsForIndustry()` to get relevant questions
- Render dynamic form with text inputs, select dropdowns, or multi-select based on question type
- Save answers to `OnboardingSession.data.followUpAnswers` as `Record<string, string>`
- Update onboarding flow navigation (fonts → follow-up → next step)

## Acceptance Criteria
- [ ] Follow-up questions page renders correctly for healthcare, legal, and restaurant industries
- [ ] Fallback questions render for unknown industries
- [ ] Answers are saved to onboarding session
- [ ] Navigation flows correctly: fonts → follow-up → tone

## Dependencies
- TASK-200 (Industry Questions Configuration)

## Files/Modules Affected
- `platform-app/src/app/onboarding/follow-up/page.tsx` (new)
- `platform-app/src/app/onboarding/fonts/page.tsx` (update navigation)
