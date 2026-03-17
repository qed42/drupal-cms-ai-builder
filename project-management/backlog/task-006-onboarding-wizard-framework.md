# TASK-006: Onboarding Wizard Framework (Multi-Step Form)

**Story:** US-005, US-007 (progress indicator)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M1 — Platform Foundation & Onboarding

## Description
Build the multi-step onboarding wizard framework using Drupal Form API. This creates the shell — individual step content is added in subsequent tasks.

## Technical Approach
- Create `OnboardingWizardForm` extending `FormBase` with step management
- Use `$form_state->set('step', $step)` for step tracking
- Implement step navigation: "Back" and "Next" buttons with AJAX
- Create `OnboardingController` to render the wizard page
- Route: `/onboarding` and `/onboarding/step/{step}` (AJAX endpoint)
- Create `onboarding-wizard.html.twig` template with progress indicator
- Add Alpine.js library for client-side interactivity (step transitions, animations)
- Progress indicator: visual step bar showing "Step X of 5" with completed/current/upcoming states
- Each step saves data to SiteProfile entity on "Next" click
- Redirect to `/onboarding` if user has incomplete onboarding on login

## Acceptance Criteria
- [ ] Wizard renders at `/onboarding` with step indicator
- [ ] Steps navigate forward/back without page reload (AJAX)
- [ ] Data persists between steps (stored on SiteProfile entity)
- [ ] Progress indicator shows current step accurately
- [ ] Returning user sees their current step (not restarted)
- [ ] Non-authenticated users redirected to registration

## Dependencies
- TASK-002 (SiteProfile entity)
- TASK-004 (User registration — redirects here)

## Files/Modules Affected
- `ai_site_builder/src/Form/OnboardingWizardForm.php`
- `ai_site_builder/src/Controller/OnboardingController.php`
- `ai_site_builder/templates/onboarding-wizard.html.twig`
- `ai_site_builder/ai_site_builder.routing.yml`
- `ai_site_builder/ai_site_builder.libraries.yml` (Alpine.js)
