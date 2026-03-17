# TASK-008: Wizard Step 2 — Industry Selection

**Story:** US-006
**Priority:** P0
**Estimated Effort:** S
**Milestone:** M1 — Platform Foundation & Onboarding

## Description
Implement Step 2: industry selection from predefined categories with a free-text fallback for "Other."

## Technical Approach
- Load industry taxonomy terms and render as visual cards/buttons (not a dropdown)
- Each industry card: icon/illustration + label + brief description
- On selecting "Other": show a textarea for free-text description via Alpine.js conditional
- Validation: one industry must be selected; if "Other", free-text is required
- Save selected industry term reference + industry_other text to SiteProfile

## Acceptance Criteria
- [ ] All 6 industries display as selectable cards
- [ ] Single selection only — clicking one deselects the previous
- [ ] "Other" reveals free-text input
- [ ] Validation prevents proceeding without selection
- [ ] Selected industry saved to SiteProfile entity

## Dependencies
- TASK-003 (Industry taxonomy)
- TASK-006 (Wizard framework)

## Files/Modules Affected
- `ai_site_builder/src/Form/OnboardingWizardForm.php` (Step 2 method)
