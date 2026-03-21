# TASK-374: Mercury Adapter E2E Pipeline Test

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M19 — Design System Decoupling
**Phase:** 5 — Mercury Adapter

## Description
End-to-end validation: generate a complete site using the Mercury adapter, import the blueprint into Drupal with Mercury theme, and verify components render correctly.

## Technical Approach
1. Register Mercury adapter alongside Space DS in platform-app
2. Create test onboarding session with `designSystemId: "mercury"`
3. Run full AI generation pipeline → blueprint JSON
4. Validate blueprint:
   - All component IDs start with `sdc.mercury.`
   - All referenced components exist in Mercury manifest
   - All slots are valid for their parent components
   - Version hashes match Mercury component versions
5. Import blueprint into Drupal with Mercury theme installed
6. Verify:
   - Header renders with logo, navigation, CTAs
   - Footer renders with branding, links, copyright
   - Hero sections render correctly
   - Content sections with various patterns render
   - Brand colors applied from theme.css
7. Playwright test: capture screenshots of key pages for visual regression

## Acceptance Criteria
- [ ] Full pipeline completes without errors using Mercury adapter
- [ ] Blueprint JSON contains only valid Mercury component references
- [ ] Drupal site renders all page sections correctly
- [ ] Brand colors visible in rendered output
- [ ] Header/footer functional (navigation works, links clickable)
- [ ] Playwright tests pass for at least home, about, services pages

## Dependencies
- TASK-370 (section builder)
- TASK-371 (tree builders)
- TASK-372 (prompt fragments)
- TASK-373 (brand tokens)

## Files/Modules Affected
- Test files in `platform-app/` and `provisioning/`
- Playwright test specs
