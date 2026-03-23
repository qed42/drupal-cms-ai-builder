# Sprint 33 Output: Header/Footer Canvas & Image Pipeline Fixes

**Milestone:** UX Polish
**Date:** 2026-03-23
**Branch:** `feature/m19-design-system-abstraction`
**Commit:** 72aacea

## Completed Tasks

| ID | Task | Status |
|----|------|--------|
| TASK-386a | Remove path aliases from header/footer canvas_page entities | DONE |
| TASK-386b | Restructure footer with mercury:group wrappers and CTAs | DONE |
| TASK-386c | Fix image import for theme placeholder paths | DONE |
| TASK-386d | Extend provisioning image copy to header/footer + user uploads | DONE |
| TASK-386e | Add ctaPrimary/ctaSecondary to FooterData and wire through pipeline | DONE |

## Key Changes

### Header/Footer No Longer Accessible as Pages (386a)

- **BlueprintImportService.php** — Removed `'path' => ['alias' => '/__header']` and `'/__footer'` from canvas_page entity creation. Header/footer are still canvas_page entities (Canvas requires this) but are no longer routable at public URLs.

### Footer Restructured with Groups and CTAs (386b, 386e)

- **tree-builders.ts** — Footer now uses `mercury:group` wrappers for semantic structure:
  - `footer_first`: Brand group (vertical) — site name + description
  - `footer_utility_first`: Links group (horizontal) — nav links + social links as plain `secondary-inverted` buttons
  - `footer_last`: CTA group (horizontal) — 1 primary CTA + 1 secondary CTA
  - `footer_utility_last`: Legal group (horizontal) — legal links + copyright
- **types.ts** — Added `ctaPrimary` and `ctaSecondary` optional fields to `FooterData`
- **component-tree-builder.ts, generator.ts, generate.ts** — Wired CTA fields through the pipeline, deriving primary from contact page and secondary from about page

### Image Pipeline Fixes (386c, 386d)

- **BlueprintImportService.php** — `createMediaEntityFromImage()` now handles theme-relative paths (`/themes/...`) by copying the file to `public://imported/` before creating the file entity. Previously these paths were used as-is, creating invalid stream wrapper URIs that resulted in broken media entities. Unknown path formats now log a warning and skip instead of creating broken entities.
- **08.5-copy-stock-images.ts** — Rewritten to:
  - Process `blueprint.header.component_tree` and `blueprint.footer.component_tree` (previously only page sections were processed)
  - Copy user upload paths (`/uploads/{userId}/...`) in addition to stock paths (`/uploads/stock/...`)
  - Rewrite `blueprint.brand.logo_url` (plain string, not image object)
  - Extracted `copyAndRewrite()` and `rewriteComponentTree()` helpers to eliminate duplication

## Files Changed

| File | Change |
|------|--------|
| `drupal-site/.../BlueprintImportService.php` | Remove path aliases, fix image resolution for theme paths |
| `packages/ds-mercury/src/tree-builders.ts` | Footer grouped layout with CTAs |
| `packages/ds-types/src/types.ts` | Add CTA fields to FooterData |
| `platform-app/.../component-tree-builder.ts` | Pass CTA fields through |
| `platform-app/.../generator.ts` | Derive footer CTAs from pages |
| `platform-app/.../generate.ts` | Derive footer CTAs from pages |
| `provisioning/.../08.5-copy-stock-images.ts` | Process header/footer trees + user uploads |

## Test Results

- 139/139 tests pass (5 test files — Mercury, CivicTheme, Space DS adapters + contract tests)
- TypeScript compilation clean for provisioning and platform-app
