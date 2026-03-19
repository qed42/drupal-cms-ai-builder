# TASK-221: Phase Retry & Re-run

**Story:** US-045
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M7 — AI Content Pipeline

## Description
Allow users to re-run individual pipeline phases. Re-running Research invalidates Plan and Generate. Re-running Plan invalidates Generate. Re-running Generate preserves Research and Plan.

## Technical Approach
- Create `POST /api/pipeline/{siteId}/rerun` endpoint
- Accept `{ phase: "research" | "plan" | "generate" }` body
- Implement invalidation logic:
  - Re-run research: mark downstream content_plans and blueprint as stale
  - Re-run plan: mark blueprint as stale
  - Re-run generate: preserve research brief and content plan
- Store new version in respective table (increment version number)
- Add "Re-run" buttons to the pipeline visibility UI on completed phases
- Show confirmation dialog for research/plan re-runs ("This will regenerate downstream content")

## Acceptance Criteria
- [ ] Re-run API accepts phase parameter and triggers re-execution
- [ ] Downstream outputs correctly invalidated
- [ ] Previous versions retained (not overwritten)
- [ ] UI shows re-run buttons on completed phases
- [ ] Confirmation dialog warns about downstream invalidation

## Dependencies
- TASK-218 (Pipeline Orchestrator)
- TASK-220 (Pipeline Phase Visibility UI)

## Files/Modules Affected
- `platform-app/src/app/api/pipeline/[siteId]/rerun/route.ts` (new)
- `platform-app/src/lib/pipeline/orchestrator.ts` (add re-run support)
- `platform-app/src/components/onboarding/PipelineProgress.tsx` (add re-run buttons)
