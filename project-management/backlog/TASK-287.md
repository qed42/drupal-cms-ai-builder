# TASK-287: Strengthen Plan Prompt with Hard Section Count Constraints

**Priority:** P0
**Effort:** Small (S)
**Requirement:** REQ-content-depth-and-review-agent — Feature 1 (Content Depth Enforcement)

## Description

Change the plan phase prompt from treating page design rules as "guidelines" to hard constraints. The AI currently ignores section count minimums because the prompt uses soft language ("use 4-7 sections"). Replace with explicit mandatory language and inject per-page-type minimum section counts as non-negotiable requirements.

## Acceptance Criteria

- [ ] `buildPlanPrompt()` in `plan.ts` uses language like "you MUST produce at least N sections" instead of guideline-style phrasing
- [ ] `formatRulesForPlan()` in `page-design-rules.ts` outputs minimum section counts as hard requirements, not suggestions
- [ ] Plan prompt includes a constraint block that lists each page with its minimum section count and required section types
- [ ] Prompt explicitly states: "Pages with fewer sections than the minimum will be rejected and regenerated"

## Technical Notes

- Files to modify: `platform-app/src/lib/ai/prompts/plan.ts`, `platform-app/src/lib/ai/page-design-rules.ts`
- This is a prompt-only change — no pipeline logic changes needed
- Test by generating a plan for a restaurant site and verifying Home gets 5+ sections, Services gets 4+

## Dependencies

- None — can start immediately
