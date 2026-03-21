# TASK-380: CivicTheme Adapter E2E Pipeline Test

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M19 — Design System Decoupling
**Phase:** 6 — CivicTheme Adapter

## Description
End-to-end validation: generate a complete site using the CivicTheme adapter, import into Drupal with CivicTheme installed, verify SCSS build runs, and verify components render correctly.

## Technical Approach
1. Register CivicTheme adapter in platform-app
2. Create test onboarding session with `designSystemId: "civictheme"`
3. Run full AI generation pipeline → blueprint JSON
4. Validate blueprint:
   - All component IDs start with `sdc.civictheme.`
   - All referenced components exist in CivicTheme manifest
   - Verify pre-composed organisms used where expected (promo, callout, etc.)
5. Install CivicTheme + starter kit sub-theme in Drupal
6. Import blueprint
7. Apply brand:
   - Verify `_variables.base.scss` written correctly
   - Verify `npm install && npm run build` completes successfully
   - Verify compiled CSS contains brand color variables
8. Verify rendering:
   - Header with navigation
   - Footer with columns
   - Hero sections (banner/campaign)
   - Content sections with various organisms
   - Brand colors applied
   - Light/dark theme sections
9. Playwright tests for visual regression

## Acceptance Criteria
- [ ] Full pipeline completes without errors using CivicTheme adapter
- [ ] SCSS build step runs successfully
- [ ] Brand colors present in compiled CSS
- [ ] Drupal site renders all page sections correctly
- [ ] Playwright tests pass for at least home, about, services pages

## Dependencies
- TASK-376 (section builder)
- TASK-377 (tree builders)
- TASK-378 (prompt fragments)
- TASK-379 (brand tokens)

## Files/Modules Affected
- Test files in `platform-app/` and `provisioning/`
- Playwright test specs
