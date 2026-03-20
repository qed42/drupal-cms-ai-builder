# TASK-293: Integrate Review Agent into Generate Loop with Retry

**Priority:** P0
**Effort:** Medium (M)
**Requirement:** REQ-content-depth-and-review-agent — Feature 2 (Quality Review Agent)

## Description

Wire the review agent into the page generation loop. After each page is generated and prop-validated, run the review agent. If the page fails review, regenerate it with feedback from the review results appended to the prompt. Maximum 2 retries per page.

## Acceptance Criteria

- [ ] After prop validation succeeds in the generate loop, `reviewPage()` is called on the generated page
- [ ] If review fails, the page is regenerated with feedback: specific failed checks + concrete instructions
- [ ] Feedback is formatted as: "CONTENT REVIEW FAILED: [check name] — [message]. Fix: [instruction]"
- [ ] Maximum 2 review-driven retries per page (separate from the existing prop validation retries)
- [ ] If all retries fail, use the attempt with the highest review score (graceful degradation)
- [ ] Review results are stored in blueprint metadata for monitoring
- [ ] Total retry overhead < 15 seconds for pages that pass first attempt, ~5-8 seconds per retry
- [ ] Logging: `[review] Page "Home" — PASS (score: 0.92)` or `[review] Page "Home" — FAIL (score: 0.54, retrying...)`

## Technical Notes

- File to modify: `platform-app/src/lib/pipeline/phases/generate.ts`
- The review runs AFTER prop validation (existing retry loop), creating a two-stage validation:
  1. Prop validation + retry (existing)
  2. Content review + retry (new)
- Keep the two retry loops separate to avoid exponential retry explosion
- Store review scores in the blueprint `metadata` field (or extend the schema)

## Dependencies

- TASK-290 (review agent must exist)
- TASK-291 (SEO checks should be included in the integration)
- TASK-292 (GEO checks should be included, but as warnings only)
