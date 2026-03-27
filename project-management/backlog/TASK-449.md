# TASK-449: Switch 6 Existing Steps to Split Layout Mode

**Story:** US-090
**Effort:** S
**Milestone:** M20 — AI Transparency

## Description
Update the 6 onboarding step pages that already have InferenceCards to use `layoutMode="split"`. Each page needs a one-line prop addition plus a state change to support compact variant on confirmation.

## Implementation Details
Steps to update:
1. `idea/page.tsx` — Add `layoutMode="split"`, manage confirmed→compact state
2. `audience/page.tsx` — Add `layoutMode="split"`, manage confirmed→compact state
3. `pages/page.tsx` — Add `layoutMode="split"`, manage confirmed→compact state
4. `brand/page.tsx` — Add `layoutMode="split"`, manage confirmed→compact state
5. `fonts/page.tsx` — Add `layoutMode="split"`, manage confirmed→compact state
6. `tone/page.tsx` — Add `layoutMode="split"`, manage confirmed→compact state

For each page:
- Add `layoutMode="split"` prop to `<StepLayout>`
- Change `onConfirm` handler: instead of `setShowInference(false)`, set a `confirmed` state and pass `variant={confirmed ? "compact" : "full"}` to InferenceCard
- Ensure `insightSlot` is always rendered when data exists (even after confirmation)

## Acceptance Criteria
- [ ] All 6 steps render in split layout on desktop (≥1024px)
- [ ] All 6 steps collapse to single column on mobile (<1024px)
- [ ] "Looks right" collapses card to compact variant (doesn't hide it)
- [ ] "Edit" button on InferenceCard still refocuses the input field
- [ ] No regressions in form submission or navigation

## Dependencies
- TASK-446 (StepLayout split mode refactor)
- TASK-447 (ArchiePanel component)
- TASK-448 (InferenceCard compact variant)

## Files
- `platform-app/src/app/onboarding/idea/page.tsx` (edit)
- `platform-app/src/app/onboarding/audience/page.tsx` (edit)
- `platform-app/src/app/onboarding/pages/page.tsx` (edit)
- `platform-app/src/app/onboarding/brand/page.tsx` (edit)
- `platform-app/src/app/onboarding/fonts/page.tsx` (edit)
- `platform-app/src/app/onboarding/tone/page.tsx` (edit)
