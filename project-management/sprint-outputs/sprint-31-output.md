# Sprint 31 Output: Design System Decoupling — Final Integration

**Milestone:** M19 — Design System Abstraction
**Date:** 2026-03-22
**Branch:** `feature/m19-design-system-abstraction`

## Completed Tasks

| ID | Task | Status |
|----|------|--------|
| TASK-382 | Remove all direct Space DS references from non-adapter code | DONE |
| TASK-383 | Adapter contract test suite (108 tests, 3 adapters) | DONE |
| TASK-374 | Mercury E2E pipeline test | DONE |
| TASK-380 | CivicTheme E2E pipeline test | DONE |

## Bugs Found & Fixed

| ID | Bug | Severity | Status |
|----|-----|----------|--------|
| BUG-S31-001 | Theme selection not wired — `getDefaultAdapter()` hardcoded to space_ds | P0 | FIXED |
| BUG-S31-002 | Module-level adapter calls locked to Space DS at import time | P0 | FIXED |
| BUG-S31-003 | CivicTheme install fails — missing PSR-4 autoload in composer.json | P0 | FIXED |
| BUG-S31-004 | Provisioning step label hardcoded to "Install Space DS theme" | P2 | FIXED |

## Key Changes

### TASK-382: Space DS Reference Cleanup
- 20 files in platform-app/src/ migrated from hardcoded `space_ds:` to adapter calls
- Deleted `space-component-manifest.json` (data now in adapter package)
- Files changed: generator.ts, image-intent.ts, PagePreview.tsx, page-design-rules.ts, page-layout.ts, page-generation.ts, review.ts, add-page/route.ts, component-validator.ts

### BUG-S31-001 & 002: Theme Selection Plumbing
- Added `setActiveAdapter()` to registry, `designSystemId` to OnboardingData
- Both v1 generator and v2 orchestrator activate the user-chosen adapter
- Provisioning receives `--theme` CLI arg and installs correct Drupal theme
- COMPOSITION_PATTERNS, PAGE_DESIGN_RULES, componentManifest converted to lazy Proxy/function patterns

### BUG-S31-003: CivicTheme Drupal Install
- Added PSR-4 autoload to CivicTheme's composer.json
- Added `layout_discovery` to prerequisite modules alongside `layout_builder`

## Test Results
- 139 adapter tests passing (3 contract + 2 E2E pipeline suites)
- TypeScript compiles cleanly
- Zero `space_ds:` literals in platform-app/src/

## Commits
1. `0b8729e` — refactor(M19): Complete design system decoupling
2. `82e41d9` — fix(M19): CivicTheme provisioning fixes

## Carry-forward
- CivicTheme install needs verification with fresh onboarding (autoloader may need regeneration per-site)
- Mercury theme not yet in drupal-site composer.json
