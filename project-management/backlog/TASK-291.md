# TASK-291: Add SEO Quality Checks to Review Agent

**Priority:** P1
**Effort:** Medium (M)
**Requirement:** REQ-content-depth-and-review-agent — Feature 2 (Quality Review Agent)

## Description

Extend the review agent with SEO quality checks that validate meta tags, keyword usage, and content structure for search engine optimization.

## Acceptance Criteria

- [ ] SEO checks added to `review.ts`:
  - Meta title length: 50-60 chars, includes at least one target keyword
  - Meta description length: 150-160 chars, includes at least one target keyword
  - Hero section contains a clear heading (H1-equivalent — non-empty `title` prop)
  - Target keywords appear in at least 2 section props naturally
  - CTA sections contain internal link references (e.g., "/contact", "/services")
  - Image-capable sections have non-empty descriptive prop values
- [ ] SEO checks require `targetKeywords` from the content plan page as input
- [ ] Returns per-check results integrated into the existing review result structure
- [ ] Unit tests for each SEO check

## Technical Notes

- Extends `reviewPage()` in `platform-app/src/lib/pipeline/phases/review.ts`
- Needs `ContentPlanPage.targetKeywords` passed to the review function
- Keyword matching should be case-insensitive, partial-match (e.g., "dental implants" matches "our dental implant services")

## Dependencies

- TASK-290 (review agent structure must exist first)
