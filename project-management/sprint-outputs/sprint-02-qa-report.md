# Sprint 02 QA Report

**Date:** 2026-03-17
**Status:** Pass — 0 bugs found

## Test Results

| Task | Tests Written | Passed | Failed |
|------|--------------|--------|--------|
| TASK-005: Trial Activation | 4 | 4 | 0 |
| TASK-006: Wizard Framework | 7 | 7 | 0 |
| TASK-007: Step 1 — Site Basics | 5 | 5 | 0 |
| TASK-008: Step 2 — Industry | 5 | 5 | 0 |
| TASK-009: Step 3 — Brand | 5 | 5 | 0 |
| TASK-010: Step 4 — Business | 3 | 3 | 0 |
| Full Walkthrough (DoD) | 1 | 1 | 0 |
| **Total** | **30** | **30** | **0** |

### Sprint 01 Regression

| Suite | Tests | Passed | Failed |
|-------|-------|--------|--------|
| Sprint 01 (all tasks) | 25 | 25 | 0 |

**Total across all sprints: 55 tests, 55 passed, 0 failed.**

## Test Coverage by Acceptance Criteria

### TASK-005: Trial Activation Service
- [x] Trial starts automatically on registration (trial_start/trial_end set, 14-day gap)
- [x] `isActive()` returns true for users within trial period
- [x] `isActive()` returns false after trial_end
- [x] `getRemainingDays()` returns correct count (14 for new users)
- [x] Trial dates stored on SiteProfile entity

### TASK-006: Onboarding Wizard Framework
- [x] Wizard renders at `/onboarding` with step indicator
- [x] Steps navigate forward/back without page reload (AJAX)
- [x] Data persists between steps (stored on SiteProfile entity)
- [x] Progress indicator shows current step accurately ("Step X of 5")
- [x] Returning user sees their current step (not restarted)
- [x] Non-authenticated users get 403

### TASK-007: Wizard Step 1 — Site Basics
- [x] All fields render correctly with labels (site_name, tagline, logo, admin_email)
- [x] Validation: site name min 2 chars, empty name blocked
- [x] Data saves to SiteProfile entity on "Next"
- [x] Admin email pre-fills from logged-in user's email

### TASK-008: Wizard Step 2 — Industry Selection
- [x] All 6 industries display as selectable radio options
- [x] Single selection only — clicking one deselects the previous
- [x] "Other" reveals free-text textarea
- [x] Validation prevents proceeding without selection
- [x] Selected industry saved to SiteProfile entity

### TASK-009: Wizard Step 3 — Brand Input
- [x] Color pickers render with industry-aware defaults (Healthcare palette verified)
- [x] Font selector shows 8 font pairings (default: Montserrat / Open Sans)
- [x] Reference URL validation rejects invalid URLs
- [x] Skipping all fields proceeds with defaults
- [x] Data saved to SiteProfile entity (colors, fonts, URLs)

### TASK-010: Wizard Step 4 — Business Context
- [x] Services textarea renders with placeholder
- [x] CTA inputs show placeholder examples (Book Now, Get a Quote)
- [x] At least one service required to proceed
- [x] Data saved to SiteProfile entity (services, audience, competitors, CTAs)

## Sprint Definition of Done Verification

- [x] User registers → lands on onboarding wizard
- [x] Steps 1–4 collect and save all data to SiteProfile
- [x] Step navigation works (Next/Back) with AJAX transitions
- [x] Progress indicator shows "Step X of 5"
- [x] Trial activates automatically on registration (14-day)
- [x] Color picker, font selector functional
- [x] Playwright: complete Steps 1–4 end-to-end test
- [x] No regressions in Sprint 01 tests (25/25 passing)

## Test Files

| File | Tests |
|------|-------|
| `tests/e2e/sprint-02-trial-activation.spec.ts` | 4 |
| `tests/e2e/sprint-02-wizard-framework.spec.ts` | 7 |
| `tests/e2e/sprint-02-wizard-steps.spec.ts` | 19 |

## Notes

- **Drupal AJAX ID suffixes**: Element IDs change after AJAX form rebuilds (e.g., `#edit-site-name` becomes `#edit-site-name--2`). All tests after the first AJAX navigation use `name` attribute selectors instead of IDs for reliability.
- **Parallel worker race condition**: Running tests with multiple Playwright workers can cause Drush php:eval to fail if it executes before the Drupal transaction commits. Tests should run with `--workers=1` for full determinism.
- **Sprint 01 test updates**: 2 Sprint 01 tests were updated to match the new wizard form (replaced placeholder "Onboarding Status" assertions with wizard wrapper/email field assertions).

## Bugs Filed

None — all tests pass.
