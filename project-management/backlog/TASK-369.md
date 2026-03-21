# TASK-369: Create @ai-builder/ds-mercury Package — Manifest & Role Map

**Story:** Design System Abstraction (M19)
**Priority:** P1
**Estimated Effort:** L
**Milestone:** M19 — Design System Decoupling
**Phase:** 5 — Mercury Adapter

## Description
Create the `packages/ds-mercury/` workspace package with Mercury theme's component manifest and role mapping. This requires extracting component definitions from Mercury's SDC `*.component.yml` files and mapping them to the universal ComponentRole system.

## Technical Approach
1. Create `packages/ds-mercury/` with `package.json` (`@ai-builder/ds-mercury`)
2. Extract manifest from Mercury theme's SDC components (22 components):
   - Clone/download Mercury from `https://git.drupalcode.org/project/mercury`
   - Parse all `*.component.yml` files to build `manifest.json`
   - Capture props (JSON Schema), slots, groups for each component
3. Create `src/role-map.ts` — map ComponentRoles to `mercury:*` IDs:
   - container → `mercury:section`
   - heading → `mercury:heading`
   - hero → `mercury:hero-billboard`, `mercury:hero-side-by-side`, `mercury:hero-blog`
   - card → `mercury:card`, `mercury:card-icon`, `mercury:card-logo`, `mercury:card-pricing`
   - header → `mercury:navbar`
   - footer → `mercury:footer`
   - (See architecture doc Section 8 for full mapping)
4. Create `src/labels.ts` — human-readable labels for all 22 components
5. Create `src/versions.ts` — Canvas component version hashes (from Drupal discovery or placeholder)
6. Create `src/image-mappings.ts` — map Mercury components to image prop expectations
7. Create `src/prop-overrides.ts` — default prop values for Mercury components
8. Create `src/index.ts` — scaffold adapter (methods not yet implemented can throw "not implemented")

## Acceptance Criteria
- [ ] `packages/ds-mercury/` exists with valid `package.json`
- [ ] Manifest contains all 22 Mercury components with accurate props and slots
- [ ] All required roles resolve to valid Mercury component IDs
- [ ] `supportsRole()` returns false for unsupported roles (section-heading, slider, etc.)
- [ ] TypeScript compiles with no errors

## Dependencies
- TASK-355 (@ai-builder/ds-types)

## Files/Modules Affected
- `packages/ds-mercury/` (new)
