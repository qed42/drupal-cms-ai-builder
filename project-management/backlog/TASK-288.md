# TASK-288: Plan-Level Section Count Validation with Retry

**Priority:** P0
**Effort:** Medium (M)
**Requirement:** REQ-content-depth-and-review-agent — Feature 1 (Content Depth Enforcement)

## Description

After the plan phase generates a `ContentPlan`, validate that each page's `sections` array meets the minimum count defined in `PAGE_DESIGN_RULES`. If any page falls short, retry plan generation with explicit feedback about which pages need more sections. Maximum 1 retry.

## Acceptance Criteria

- [ ] New validation function `validatePlanDepth(plan: ContentPlan): { valid: boolean; feedback: string[] }` created
- [ ] Validation checks each page's section count against `PAGE_DESIGN_RULES[classifyPageType(slug, title)].sectionCountRange[0]`
- [ ] If validation fails, plan phase retries with feedback appended: "Page X has N sections but requires at least M. Add sections of type: [required types missing]."
- [ ] Maximum 1 retry attempt — if second plan still fails, use it anyway (graceful degradation)
- [ ] Validation logs: `[plan] Page "Home" section count: 3/5 — FAIL` for monitoring

## Technical Notes

- Files to modify: `platform-app/src/lib/pipeline/phases/plan.ts`
- New file: validation logic can live in `plan.ts` or a shared validator
- Import `classifyPageType`, `getRule` from `page-design-rules.ts`
- The retry appends feedback to the existing prompt, similar to prop validation retry pattern in `generate.ts`

## Dependencies

- TASK-287 (stronger prompt language improves first-pass success rate)
