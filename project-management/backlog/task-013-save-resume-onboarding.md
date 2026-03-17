# TASK-013: Save & Resume Onboarding

**Story:** US-011
**Priority:** P2
**Estimated Effort:** S
**Milestone:** M1 — Platform Foundation & Onboarding

## Description
Detect incomplete onboarding on login and redirect user to their last completed step.

## Technical Approach
- `EventSubscriber` on user login event
- Check if user's SiteProfile has `status == 'onboarding'`
- If yes, redirect to `/onboarding/step/{onboarding_step}`
- Each wizard step already saves data on "Next" (built into TASK-006/007/008/009/010)
- Add "Continue Setup" banner/CTA on the user dashboard (if one exists)

## Acceptance Criteria
- [ ] User who completed Step 3 and returns sees Step 4 with previous data intact
- [ ] Login redirects to wizard for incomplete onboarding
- [ ] All previously entered data is pre-filled

## Dependencies
- TASK-006 through TASK-012 (Wizard steps must save state)

## Files/Modules Affected
- `ai_site_builder/src/EventSubscriber/OnboardingRedirectSubscriber.php`
