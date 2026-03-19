# TASK-265: Before/After Comparison Artifacts

**Story:** US-060
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M10 — Quality Framework

## Description
Generate structured comparison artifacts showing v1 vs v2 pipeline output for each test case, with metrics per evaluation criterion.

## Technical Approach
- Create a test script: `platform-app/tests/scripts/generate-comparison.ts`
- For each test case:
  - Run v1 pipeline (existing `generateBlueprint()`)
  - Run v2 pipeline (new `runContentPipeline()`)
  - Score both with the auto-scorer
  - Generate markdown comparison: word count delta, new sections, improved specificity, SEO improvements
- Output to `project-management/sprint-outputs/content-generation-v2-comparison.md`
- Include summary table and per-test-case detail

## Acceptance Criteria
- [ ] Comparison artifacts generated for at least 5 test cases
- [ ] Each comparison shows: v1 metrics, v2 metrics, delta
- [ ] Word count improvement documented per page
- [ ] Rubric score improvement documented per dimension
- [ ] Output saved as sprint documentation

## Dependencies
- TASK-263 (Content Evaluation Rubric)
- TASK-260 (Synthetic Test Case Definitions)

## Files/Modules Affected
- `platform-app/tests/scripts/generate-comparison.ts` (new)
- `project-management/sprint-outputs/content-generation-v2-comparison.md` (new)
