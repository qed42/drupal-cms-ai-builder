# TASK-218a: Research→Plan Mini-Orchestrator

**Story:** US-039, US-040
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M7 — AI Content Pipeline
**Sprint:** 11

## Description
Create a lightweight pipeline orchestrator that chains Research → Plan sequentially, manages phase status on the Site model, and integrates with the onboarding submission flow. This is the foundation for the full orchestrator (TASK-218) which will add the Generate phase in Sprint 12.

## Technical Approach
- Create `platform-app/src/lib/pipeline/orchestrator.ts`
- Export `runPipeline(siteId: string, onboardingData: OnboardingData): Promise<void>`
- Sequence: update Site.pipelinePhase to "research" → call research phase → update to "plan" → call plan phase → update to "plan_complete"
- On error: set Site.pipelinePhase to `${phase}_failed`, store error in Site.pipelineError
- Wire into onboarding submission: after the final wizard step (tone), trigger `runPipeline()` instead of (or alongside) `generateBlueprint()`
- Preserve `generateBlueprint()` as v1 fallback — use an environment variable or feature flag to control which path runs
- Store timing metadata (startedAt, completedAt) for each phase

## Acceptance Criteria
- [ ] `runPipeline(siteId, onboardingData)` runs Research then Plan sequentially
- [ ] Site.pipelinePhase updates at each transition (research → plan → plan_complete)
- [ ] Errors stop the pipeline and record the error on Site.pipelineError
- [ ] Orchestrator is wired into the onboarding submission flow
- [ ] v1 `generateBlueprint()` still works for backward compatibility
- [ ] Phase timing is recorded for performance monitoring

## Dependencies
- TASK-215 (Research Phase)
- TASK-216 (Plan Phase)
- TASK-214 (Pipeline Data Models) — already complete in Sprint 09

## Files/Modules Affected
- `platform-app/src/lib/pipeline/orchestrator.ts` (new)
- `platform-app/src/app/onboarding/tone/page.tsx` or submission handler (modify — wire orchestrator)

## Notes
- Sprint 12 TASK-218 will extend this orchestrator to add the Generate phase and full error recovery
- Keep the orchestrator interface extensible: design so adding a third phase is a minimal change
