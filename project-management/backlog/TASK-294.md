# TASK-294: Metrics Logging for Content Depth & Review Scores

**Priority:** P2
**Effort:** Small (S)
**Requirement:** REQ-content-depth-and-review-agent — Features 1 & 2

## Description

Add structured logging across the pipeline so we can monitor content depth compliance and review quality trends over time.

## Acceptance Criteria

- [ ] Plan phase logs per-page: `[plan] Page "{title}" ({pageType}): {actualSections}/{minSections} sections — {PASS|FAIL}`
- [ ] Generate phase logs per-page: `[generate] Page "{title}": {actualSections}/{plannedSections} sections, maxTokens={budget}`
- [ ] Review phase logs per-page: `[review] Page "{title}": depth={score}, seo={score}, geo={score}, overall={PASS|FAIL}`
- [ ] Review results object saved to blueprint record metadata (JSON field)
- [ ] If blueprint DB schema doesn't have a metadata field, add one (nullable JSON)

## Technical Notes

- Files to modify: `phases/plan.ts`, `phases/generate.ts`, `phases/review.ts`
- Use `console.log` with structured prefix `[plan]`, `[generate]`, `[review]` for grep-ability
- Blueprint metadata can be stored in the existing `payload` JSON or a new `metadata` field

## Dependencies

- TASK-293 (review integration must be wired up to produce scores)
