# TASK-007: Wizard Step 1 — Site Basics

**Story:** US-005
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M1 — Platform Foundation & Onboarding

## Description
Implement Step 1 of the onboarding wizard: collect site name, tagline, logo, and admin email.

## Technical Approach
- Add Step 1 form elements to `OnboardingWizardForm`:
  - `site_name`: textfield, required, max 100 chars
  - `tagline`: textfield, optional, max 255 chars
  - `logo`: managed_file, optional, PNG/JPG/SVG, max 5MB
  - `admin_email`: email, pre-filled from user's email
- Validation: site_name min 2 chars, email format, file type/size
- On "Next": save values to SiteProfile entity, set `onboarding_step = 2`
- Style with Space theme classes/utilities

## Acceptance Criteria
- [ ] All fields render correctly with labels and help text
- [ ] Validation works for required fields and file upload constraints
- [ ] Data saves to SiteProfile entity on "Next"
- [ ] Admin email pre-fills from logged-in user's email
- [ ] Logo upload works with drag-and-drop or file picker

## Dependencies
- TASK-006 (Wizard framework)

## Files/Modules Affected
- `ai_site_builder/src/Form/OnboardingWizardForm.php` (Step 1 method)
