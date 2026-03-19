# TASK-264: Content Uniqueness Validator

**Story:** US-060
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M10 — Quality Framework

## Description
Create an automated check that verifies generated content across different test cases is sufficiently unique (< 20% shared content between any two sites).

## Technical Approach
- Create `platform-app/tests/helpers/uniqueness-validator.ts`
- Tokenize content into sentences
- Compute sentence-level n-gram sets per site
- Calculate Jaccard similarity between all site pairs
- Flag if any pair shares > 20% content (excluding common industry terminology)
- Maintain a stop-list of common phrases to exclude ("Contact us today", "Learn more", etc.)
- Integrate into Playwright test suite as a cross-test validation

## Acceptance Criteria
- [ ] Jaccard similarity calculated on sentence-level n-grams
- [ ] No two test case outputs share > 20% content verbatim
- [ ] Common phrases excluded from similarity calculation
- [ ] Clear report output showing similarity scores per pair

## Dependencies
- TASK-262 (Playwright E2E Tests — provides generated content to compare)

## Files/Modules Affected
- `platform-app/tests/helpers/uniqueness-validator.ts` (new)
