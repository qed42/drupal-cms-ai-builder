# TASK-290: Build Quality Review Agent — Content Depth Checks

**Priority:** P0
**Effort:** Medium (M)
**Requirement:** REQ-content-depth-and-review-agent — Feature 2 (Quality Review Agent)

## Description

Create a deterministic (no AI calls) review function that evaluates each generated page against content depth rules. This is the core of the quality review agent.

## Acceptance Criteria

- [ ] New file `platform-app/src/lib/pipeline/phases/review.ts` with `reviewPage()` function
- [ ] Checks implemented:
  - Section count meets page-type minimum from `PAGE_DESIGN_RULES`
  - Each section meets its `wordCountRange` minimum (estimated from props text length)
  - Total page word count meets threshold (Home >= 400, Services >= 350, About >= 350)
  - No generic placeholder text detected ("Lorem ipsum", "Your business here", "Learn more")
  - No two consecutive sections use the same `component_id`
  - All `required: true` section types from the page-type rule are present
- [ ] Returns structured result: `{ passed: boolean; score: number; checks: Array<{ name: string; passed: boolean; message: string }> }`
- [ ] Generates actionable feedback strings for failed checks (used as retry prompt input)
- [ ] Unit tests covering pass and fail scenarios for each check

## Technical Notes

- Pure function — no AI calls, no database access
- Import types from `page-design-rules.ts` and `types.ts`
- Word count estimation: count words in all string values of the section's `props` object
- Placeholder detection: regex match against a known list of generic phrases

## Dependencies

- None — can start immediately (uses existing types)
