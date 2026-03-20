# TASK-292: Add GEO Quality Checks to Review Agent

**Priority:** P2
**Effort:** Small (S)
**Requirement:** REQ-content-depth-and-review-agent — Feature 2 (Quality Review Agent)

## Description

Extend the review agent with GEO (Generative Engine Optimization) checks that ensure content is structured for AI knowledge graph consumption.

## Acceptance Criteria

- [ ] GEO checks added to `review.ts`:
  - Entity clarity: business name and industry appear explicitly in page content
  - Structured claims: at least 1 specific stat/metric per content page (detect numbers + context patterns)
  - FAQ presence: at least one page in the full site includes an accordion/FAQ section
  - Authoritative language: content uses first-person plural ("we", "our") and active voice
  - Semantic completeness: service sections include what/who/why structure
- [ ] GEO checks are softer (warnings, not failures) — they inform but don't block
- [ ] Returns per-check results integrated into the review result structure
- [ ] Unit tests for each GEO check

## Technical Notes

- Extends `reviewPage()` in `platform-app/src/lib/pipeline/phases/review.ts`
- GEO checks are advisory — they produce warnings in the review output but `passed` can still be true
- FAQ presence check needs awareness of all pages, not just the current one — pass site-level context

## Dependencies

- TASK-290 (review agent structure must exist first)
