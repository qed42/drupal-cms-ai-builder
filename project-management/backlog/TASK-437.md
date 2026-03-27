# TASK-437: Register "Images" Onboarding Step

**Story:** US-081
**Effort:** XS
**Milestone:** M22 — User-Uploaded Images

## Description
Add the new "images" step to `onboarding-steps.ts` between `fonts` (step 9) and `follow-up` (step 10). Update section assignment and step labels.

## Implementation Details
- Add step entry: `{ id: "images", label: "Your Photos", section: "Brand & Style" }`
- Insert after `fonts`, before `follow-up`
- Update step ordering — follow-up and subsequent steps shift by 1
- Conversational label style consistent with Sprint 39 Archie branding
- Verify `onboarding-steps.ts` `as const` assertion still works after insertion

## Acceptance Criteria
- [ ] "images" step appears in the stepper after fonts
- [ ] Step label shows "Your Photos" in the sidebar/stepper
- [ ] Section assignment is "Brand & Style"
- [ ] Step ordering is correct (no gaps, follow-up shifts properly)
- [ ] TypeScript compiles with no errors

## Dependencies
- None

## Files
- `platform-app/src/lib/onboarding-steps.ts` (edit)
