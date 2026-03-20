# TASK-320: Update legacy test files for v2 component IDs

**Story:** Space DS v2 Migration
**Priority:** P1
**Estimated Effort:** M
**Milestone:** Space DS v2 Migration

## Description

16 unit tests across 6 test files fail because they reference deleted v1 components (space-hero-banner-style-01, space-text-media-*, etc.) or removed behavior (brand-tokens.css, SKIP_CONTAINER, anti-monotony). Update these tests to validate v2 behavior.

## Failing Tests

| File | Failures | Fix Approach |
|------|----------|-------------|
| sprint-14-qa.test.ts | 5 | Update manifest count to 31, replace style-01 tests with style-02 |
| sprint-14-unit.test.ts | 2 | Update prompt reference tests for v2 component list |
| sprint-14.1-unit.test.ts | 1 | Update image validation test for v2 manifest |
| sprint-15-qa.test.ts | 3 | Remove brand-tokens.css tests, add space_ds.settings tests |
| sprint-16-qa.test.ts | 4 | Replace SKIP_CONTAINER/anti-monotony tests with slot-based composition tests |
| sprint-12-unit.test.ts | 1 | Update prompt builder test for v2 component list |

## Acceptance Criteria

- [ ] All 16 failing tests updated or replaced with v2 equivalents
- [ ] Zero test failures in unit test suite
- [ ] Tests validate actual v2 behavior, not just pass trivially

## Dependencies
- Sprint 20 (all tasks complete)

## Files/Modules Affected
- `platform-app/tests/sprint-12-unit.test.ts`
- `platform-app/tests/sprint-14-qa.test.ts`
- `platform-app/tests/sprint-14-unit.test.ts`
- `platform-app/tests/sprint-14.1-unit.test.ts`
- `platform-app/tests/sprint-15-qa.test.ts`
- `platform-app/tests/sprint-16-qa.test.ts`
