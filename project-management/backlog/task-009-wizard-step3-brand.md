# TASK-009: Wizard Step 3 — Brand Input

**Story:** US-007
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M1 — Platform Foundation & Onboarding

## Description
Implement Step 3: color palette picker, font selection, reference URLs, and brand guidelines upload.

## Technical Approach
- Color picker: three inputs (primary, secondary, accent) using a JS color picker library (e.g., vanilla-picker or similar lightweight lib) integrated via Alpine.js
- Provide industry-aware default palettes (e.g., blue/teal for Healthcare, green for Real Estate)
- Font selector: curated list of 8-10 Google Font pairings (heading + body), rendered as previews
- Reference URLs: up to 3 URL inputs with URL validation
- Brand guidelines: managed_file upload, PDF/PNG/JPG, max 10MB
- All fields optional — sensible defaults applied if skipped
- Save to SiteProfile: color_primary, color_secondary, color_accent, font_heading, font_body, reference_urls, brand_guidelines

## Acceptance Criteria
- [ ] Color pickers show selected color and allow free hex input
- [ ] Default color palette pre-selected based on industry
- [ ] Font selector shows preview of font pairing
- [ ] Reference URL fields validate URL format
- [ ] Brand guidelines upload works
- [ ] Skipping all fields proceeds with defaults
- [ ] Data saved to SiteProfile entity

## Dependencies
- TASK-006 (Wizard framework)
- TASK-008 (Industry — for default palette selection)

## Files/Modules Affected
- `ai_site_builder/src/Form/OnboardingWizardForm.php` (Step 3 method)
- `ai_site_builder/ai_site_builder.libraries.yml` (color picker library)
