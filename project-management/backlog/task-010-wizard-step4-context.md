# TASK-010: Wizard Step 4 — Business Context

**Story:** US-008
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M1 — Platform Foundation & Onboarding

## Description
Implement Step 4: collect services offered, target audience, competitors, and key CTAs.

## Technical Approach
- Services: textarea with instructions to enter one per line, or a tag-input style field via Alpine.js
- Target audience: textarea, max 500 chars, with character counter
- Competitors: up to 3 text inputs (name or URL)
- CTAs: up to 5 text inputs with placeholder examples ("Book Now", "Get a Quote", "Contact Us")
- Validation: services field required (at least one); others optional
- Save to SiteProfile: services, target_audience, competitors, ctas

## Acceptance Criteria
- [ ] Services field accepts multi-line or tag input
- [ ] At least one service required to proceed
- [ ] Target audience has character counter
- [ ] CTA inputs show placeholder examples
- [ ] Data saved to SiteProfile entity

## Dependencies
- TASK-006 (Wizard framework)

## Files/Modules Affected
- `ai_site_builder/src/Form/OnboardingWizardForm.php` (Step 4 method)
