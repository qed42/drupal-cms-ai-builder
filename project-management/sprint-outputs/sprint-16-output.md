# Sprint 16 QA Report

**Date:** 2026-03-19
**Status:** Pass — 0 bugs found, 1 regression fixed

## Test Results
| Task | Tests Written | Passed | Failed |
|------|--------------|--------|--------|
| TASK-285 (Stock Images Fix) | 1 | 1 | 0 |
| TASK-250/251 (Step Timing & Progress UI) | 5 | 5 | 0 |
| TASK-252 (Per-Site DB Users) | 5 | 5 | 0 |
| TASK-253 (Failure Detail & Resume) | 4 | 4 | 0 |
| TASK-282 (Layout Wrapper Rules) | 7 | 7 | 0 |
| TASK-284 (Auth Fix — drush uli) | 3 | 3 | 0 |
| Cross-cutting (Type Safety) | 1 | 1 | 0 |
| **Total** | **26** | **26** | **0** |

## Regression Check
- Sprint 14 test suite: 44/44 passed (1 test updated for TASK-282 builder rewrite)
- Sprint 16 test suite: 26/26 passed
- TypeScript compilation: clean (provisioning package: 0 errors; platform-app: only pre-existing vitest type import warnings)

## Regression Fixed During QA
| File | Issue | Fix |
|------|-------|-----|
| `tests/sprint-14-unit.test.ts:184` | Expected `component-tree-builder.ts` to reference `component-validator`, which was removed in TASK-282 rewrite | Updated test to verify `space-container` wrapping (new behavior) |

## Bugs Filed
None.

## Deliverables Summary

### TASK-285: Stock Image Rendering (P0 Bug)
- **Root cause:** Step ordering — `importBlueprint` ran before `copyStockImages`, so Drupal imported blueprints with unreachable `/uploads/stock/` paths
- **Fix:** Reordered provisioning steps: copy images + apply brand now execute before blueprint import
- **Verification:** Test confirms step order in source

### TASK-250/251: Provisioning Step Progress
- 12 user-friendly labels (no technical jargon)
- Per-step progress callbacks via `sendProgressCallback()`
- Per-step timing tracked and logged
- Status API maps provisioning to 70-99% range
- Progress page shows step counter with progress bar

### TASK-252: Per-Site MariaDB Users
- Dedicated user per site with 43-char random password
- Parameterized password query (SQL injection safe)
- CREATE USER IF NOT EXISTS for retry safety
- FLUSH PRIVILEGES after grants
- Rollback drops both database and user

### TASK-282: Layout Wrapper Rules
- Text-media, team sections, accordions wrapped in `space-container` with `boxed-width`
- 14 full-width components (11 heroes + 3 CTAs) skip container
- Anti-monotony: consecutive duplicate component IDs auto-substituted
- Container uses correct version hash from canvas catalog

### TASK-284: Auth — One-Time Login
- Replaced JWT `createAutoLoginToken` with `drush user:login` via docker exec
- URL base rewritten from drush output to actual site URL
- Redirects to `/canvas` after authentication
- Visit Site button present for live sites

## Outstanding DoD Items (Need DDEV Validation)
- [ ] Works in DDEV local dev environment (provisioning end-to-end)
- [ ] Generated Canvas trees render correctly in Drupal with proper containment

## Notes
- Stretch tasks (TASK-237, TASK-239, TASK-221) remain not started — deferred to Sprint 17+
- TASK-283 backlog item served as reference material and was successfully merged into TASK-251
- The 2 outstanding DoD items require a live DDEV environment for integration testing
