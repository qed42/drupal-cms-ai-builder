# TASK-218: Pipeline Orchestrator

**Story:** US-039, US-040, US-041
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M7 — AI Content Pipeline

## Description
Create the pipeline orchestrator that runs Research → Plan → Generate sequentially, manages phase status, handles errors, and replaces the current `generateBlueprint()` function for new sites.

## Technical Approach
- Create `platform-app/src/lib/pipeline/orchestrator.ts`
- `runContentPipeline(siteId, onboardingData)`: runs 3 phases sequentially
- Update `Site.pipelinePhase` and `Site.pipelineError` as phases progress
- On phase failure: update status, don't proceed to next phase
- After Generate completes: transition site status to "review" (not "provisioning")
- Preserve existing `generateBlueprint()` in `generator.ts` for backward compatibility
- Wire new pipeline into the onboarding submission flow (replace direct `generateBlueprint` call)
- Store final blueprint in same format as v1 for provisioning compatibility

## Acceptance Criteria
- [ ] Pipeline runs Research → Plan → Generate sequentially
- [ ] Site.pipelinePhase updates at each transition
- [ ] Errors stop the pipeline and record the error
- [ ] Site transitions to "review" status after generation (not "provisioning")
- [ ] v1 `generateBlueprint()` still works for backward compatibility
- [ ] Blueprint format is compatible with existing provisioning engine

## Dependencies
- TASK-215 (Research Phase)
- TASK-216 (Plan Phase)
- TASK-217 (Per-Page Generation)
- TASK-214 (Pipeline Data Models)

## Files/Modules Affected
- `platform-app/src/lib/pipeline/orchestrator.ts` (new)
- `platform-app/src/lib/blueprint/generator.ts` (modify — wire to new pipeline)
- `platform-app/src/app/api/onboarding/` (modify submission handler)
