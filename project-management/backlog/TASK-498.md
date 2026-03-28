# TASK-498: Persistent Header on Onboarding Pages

**Story:** US-096
**Effort:** S
**Milestone:** M20 — AI Transparency

## Description
Add the app header (logo, navigation, user menu) to all onboarding pages so users never feel disconnected from the main app.

## Technical Approach
- Add the shared header component to `app/onboarding/layout.tsx`
- Ensure spacing doesn't conflict with ProgressStepper or StepLayout
- Verify header appears on: step pages, progress, review, review-settings
- Check that pages with their own headers don't get duplicates

## Acceptance Criteria
- [ ] Header visible on all onboarding step pages
- [ ] Header visible on progress, review, and review-settings pages
- [ ] No duplicate headers on any page
- [ ] Consistent styling with dashboard header

## Files
- `platform-app/src/app/onboarding/layout.tsx`
- Possibly `platform-app/src/components/layout/Header.tsx` or similar
