# TASK-012: Wizard Step 5 — Dynamic Industry Questions

**Story:** US-009
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M1 — Platform Foundation & Onboarding

## Description
Implement Step 5: display AI-generated industry questions and collect answers. Show "Generate My Website" button.

## Technical Approach
- On step load: AJAX call to invoke IndustryAnalyzerAgent in question-generation mode
- Show loading spinner while AI generates questions
- Render questions dynamically based on structured schema from agent:
  - `boolean` → toggle/checkbox
  - `text` → textfield
  - `select` → select list with options
  - `multiselect` → checkboxes
- On "Generate My Website": save answers to SiteProfile `industry_answers` field (serialized map), set `onboarding_step = 5` (complete), redirect to generation progress page
- Handle agent errors: show friendly message with "Retry" button

## Acceptance Criteria
- [ ] Loading state shown while questions generate
- [ ] Questions render with appropriate input types
- [ ] All answers saved to SiteProfile
- [ ] "Generate My Website" button triggers generation pipeline
- [ ] Error state handles AI failures gracefully
- [ ] Questions appear within 5 seconds

## Dependencies
- TASK-006 (Wizard framework)
- TASK-011 (Industry Analyzer Agent)

## Files/Modules Affected
- `ai_site_builder/src/Form/OnboardingWizardForm.php` (Step 5 method)
- `ai_site_builder/src/Controller/OnboardingController.php` (AJAX endpoint for questions)
