# TASK-289: Increase Token Budget for Content-Heavy Pages

**Priority:** P1
**Effort:** Small (S)
**Requirement:** REQ-content-depth-and-review-agent — Feature 1 (Content Depth Enforcement)

## Description

The generate phase uses a fixed `maxTokens: 4000` for all pages. Pages with 5+ sections (Home, Services, Landing) may get truncated before all sections are generated. Scale token budget based on planned section count.

## Acceptance Criteria

- [ ] `maxTokens` in the generate phase scales with planned section count: base 4000 + 500 per section above 3 (e.g., 5 sections = 5000, 7 sections = 6000)
- [ ] Cap at 8000 to prevent excessive cost
- [ ] Token budget calculation is logged: `[generate] Page "Home" (5 sections): maxTokens=5000`

## Technical Notes

- File to modify: `platform-app/src/lib/pipeline/phases/generate.ts` — the `generateValidatedJSON` call options
- Simple arithmetic change in the generate loop where `planPage.sections.length` is available

## Dependencies

- None — independent of other tasks
