# TASK-375: Create @ai-builder/ds-civictheme Package — Manifest & Role Map

**Story:** Design System Abstraction (M19)
**Priority:** P1
**Estimated Effort:** L
**Milestone:** M19 — Design System Decoupling
**Phase:** 6 — CivicTheme Adapter

## Description
Create the `packages/ds-civictheme/` workspace package with CivicTheme's component manifest and role mapping. CivicTheme has 60+ components organized in Atomic Design (atoms, molecules, organisms). The SDC format is available since v1.11.0.

## Technical Approach
1. Create `packages/ds-civictheme/` with `package.json` (`@ai-builder/ds-civictheme`)
2. Extract manifest from CivicTheme's SDC components:
   - Clone/download CivicTheme from `https://www.drupal.org/project/civictheme`
   - Parse `components/sdc/` directory for `*.component.yml` files
   - Build `manifest.json` with props, slots, groups
3. Create `src/role-map.ts`:
   - container → [] (CivicTheme organisms handle their own wrappers)
   - heading → `civictheme:heading`
   - text → `civictheme:paragraph`
   - button → `civictheme:button`
   - link → `civictheme:content-link`
   - hero → `civictheme:banner`, `civictheme:campaign`
   - cta-banner → `civictheme:callout`
   - card → `civictheme:navigation-card`, `civictheme:promo-card`, `civictheme:event-card`, `civictheme:publication-card`, `civictheme:service-card`, `civictheme:subject-card`
   - header → `civictheme:header`
   - footer → `civictheme:footer`
   - slider → `civictheme:slider`, `civictheme:carousel`
   - testimonial-card → `civictheme:snippet`
   - pricing-card → `civictheme:price-card`
   - (See architecture doc Section 8 for full mapping)
4. Create `src/labels.ts`, `src/versions.ts`, `src/image-mappings.ts`, `src/prop-overrides.ts`
5. Note: `container` role maps to empty — CivicTheme's section builder will handle wrapping differently

## Acceptance Criteria
- [ ] `packages/ds-civictheme/` exists with valid `package.json`
- [ ] Manifest contains all relevant CivicTheme SDC components
- [ ] All required roles resolve (except `container` which returns empty — handled by section builder)
- [ ] `supportsRole()` correctly reports unsupported roles (user-card, stats-kpi, contact-card)
- [ ] TypeScript compiles

## Dependencies
- TASK-355 (@ai-builder/ds-types)

## Files/Modules Affected
- `packages/ds-civictheme/` (new)
