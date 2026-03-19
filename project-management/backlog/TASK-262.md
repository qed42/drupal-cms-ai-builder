# TASK-262: Playwright E2E Test Framework

**Story:** US-058
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M10 — Quality Framework

## Description
Set up the Playwright test framework and create automated E2E tests for at least 5 synthetic test cases, validating the full onboarding-to-review flow.

## Technical Approach
- Extend existing `platform-app/tests/` Playwright setup
- Create test helper: `platform-app/tests/helpers/onboarding-flow.ts`
  - Reusable function to complete onboarding wizard with given inputs
  - Wait for pipeline phases to complete (with timeout)
  - Navigate to review page
- Create test suite: `platform-app/tests/content-generation/`
  - One test file per industry (at least 5): healthcare, legal, restaurant, SaaS, real estate
  - Each test: complete onboarding → verify 3 phases complete → verify review page content
- Content validations:
  - Total word count >= 2,000
  - Per-page word count >= 200
  - Industry keywords present (from test case fixtures)
  - No placeholder text (regex: /lorem ipsum|\\[placeholder\\]|TBD/i)
- 10-minute timeout per test case
- CI configuration for running tests

## Acceptance Criteria
- [ ] 5+ E2E tests covering different industries
- [ ] Tests verify onboarding completes without errors
- [ ] Tests verify all 3 pipeline phases complete
- [ ] Tests verify word count thresholds (2,000 total, 200 per page)
- [ ] Tests verify industry keyword presence
- [ ] Tests verify no placeholder/lorem ipsum text
- [ ] Tests have 10-minute timeout

## Dependencies
- TASK-260 (Synthetic Test Case Definitions)
- TASK-220 (Pipeline Phase Visibility UI — tests need to wait for phases)
- TASK-231 (Review Page — tests verify review page content)

## Files/Modules Affected
- `platform-app/tests/helpers/onboarding-flow.ts` (new)
- `platform-app/tests/content-generation/*.spec.ts` (new, 5+ files)
- `platform-app/playwright.config.ts` (modify — add timeout)
