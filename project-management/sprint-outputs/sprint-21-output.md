# Sprint 21 QA Report

**Date:** 2026-03-20
**Status:** Pass — 0 bugs found. E2E pipeline verification (TASK-321) deferred to manual testing.

## Sprint Summary

Sprint 21 completed the Space DS v2 migration by fixing required-prop validation failures, cleaning up legacy tests, and adding header/footer generation to the provisioning pipeline.

## Test Results

| Task | Tests | Passed | Failed | Notes |
|------|-------|--------|--------|-------|
| TASK-322 (Required Props) | Code review + manifest verification | Pass | 0 | Dynamic defaults map covers all 13 components with required props |
| TASK-320 (Test Cleanup) | 421 unit tests | 421 | 0 | 16 v1 failures fixed across 6 test files |
| TASK-317 (Header/Footer) | Code review + TS compilation | Pass | 0 | New buildHeaderTree/buildFooterTree + Drupal importHeaderFooter |
| TASK-321 (E2E Verification) | — | — | — | Requires live provisioning; deferred to manual testing |

## TypeScript Compilation

**Source files:** 0 errors
**Test files:** Only pre-existing `vitest` module resolution (tsconfig issue, not a regression)

## Commits

| Commit | Task | Description |
|--------|------|-------------|
| `d706908` | TASK-322 | Dynamic required prop defaults from manifest |
| `207219f` | TASK-320 | Updated 16 legacy tests for v2 component model |
| `db337ed` | TASK-317 | Header/footer generation pipeline (TS + PHP) |

## Task Details

### TASK-322: Required Props Audit & Fix
- [x] Every required prop for all 31 components has a default in manifest
- [x] `createItem()` auto-injects defaults via `MANIFEST_REQUIRED_DEFAULTS` map
- [x] Manifest required flags verified against .component.yml source files
- [x] Dynamic approach is drift-proof — updates automatically when manifest changes
- **Note:** Existing stale blueprints still need fresh generation to benefit

### TASK-320: Legacy Test Cleanup
- [x] 0 unit test failures (was 16)
- [x] Tests validate v2 behavior:
  - Manifest count 84→31
  - Hero-01→Hero-02 component IDs
  - SKIP_CONTAINER→FULL_WIDTH_ORGANISMS
  - brand-tokens.css→space_ds.settings config
  - Anti-monotony tests replaced with slot-based composition tests

### TASK-317: Header/Footer Generation
- [x] `buildHeaderTree()` generates space-header with logo, nav links, CTA button
- [x] `buildFooterTree()` generates space-footer with brand props, legal links
- [x] Blueprint schema includes `header` and `footer` with component_tree
- [x] Content generation prompt extended for footer_description, disclaimer, cta_text
- [x] BlueprintImportService creates canvas_page entities for header/footer
- [x] Header/footer page IDs stored in `ai_site_builder.layout` config
- **Pending:** Mobile hamburger menu behavior depends on Space DS theme CSS (not code-level)

### TASK-321: E2E Pipeline Verification
- **Status:** Deferred to manual testing
- **Reason:** Requires live DDEV environment with full onboarding→provisioning→Drupal pipeline
- **Pre-conditions:** Generate FRESH blueprint (do not reuse stale v1 blueprints)
- **Test plan:**
  1. Run full onboarding (name, idea, audience, tone, pages)
  2. Verify blueprint JSON contains header/footer with component_tree
  3. Run provisioning → verify Drupal site created
  4. Verify v2 component trees render correctly in Canvas
  5. Verify brand colors via --sds-* CSS variables
  6. Verify header/footer render on all pages

## Bugs Filed

None.

## Notes

- Sprint 20+21 together deliver the complete Space DS v2 pipeline migration
- The 18 test file "failures" are pre-existing vitest/Playwright module resolution issues (not assertion failures)
- TASK-321 E2E verification should be the first task in the next working session with a running DDEV environment
