# TASK-218b: Extend Orchestrator with Generate Phase

**Story:** US-039, US-040, US-041
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M7 — AI Content Pipeline
**Sprint:** 12

## Description
Extend the Sprint 11 mini-orchestrator (`orchestrator.ts`) to add the Generate phase, producing a full Research → Plan → Generate pipeline. Remove the v1 `generateBlueprint()` fallback from the submission flow. After generation completes, transition the site to "review" status.

## Technical Approach
- Modify `platform-app/src/lib/pipeline/orchestrator.ts`:
  - Add `generate`, `generate_complete`, `generate_failed` to `PipelinePhase` type
  - Import and call `runGeneratePhase()` from TASK-217 after plan completes
  - After generate: assemble final `BlueprintBundle`, save to Blueprint record, set site status to "review"
  - Return `PipelineResult` with all three phase IDs
- Modify `platform-app/src/app/api/provision/generate-blueprint/route.ts`:
  - Remove `runV2Pipeline()` wrapper that calls `generateBlueprint()` after pipeline
  - `runPipeline()` now produces the final blueprint directly
  - Keep `CONTENT_PIPELINE_V2` toggle — when false, use v1 `generateBlueprint()`
- Update status API progress mapping to handle generate phase (already has placeholder from Sprint 11)

## Acceptance Criteria
- [ ] Pipeline runs Research → Plan → Generate sequentially
- [ ] PipelinePhase type includes generate/generate_complete/generate_failed
- [ ] Site transitions to "review" status after generation
- [ ] v1 generateBlueprint() still works when CONTENT_PIPELINE_V2=false
- [ ] Blueprint format compatible with existing provisioning engine
- [ ] Pipeline error handling covers Generate phase failures
- [ ] Generate phase updates status with per-page progress

## Dependencies
- TASK-218a (Sprint 11 — mini-orchestrator baseline)
- TASK-217 (Per-Page Content Generation — this sprint)

## Files/Modules Affected
- `platform-app/src/lib/pipeline/orchestrator.ts` (modify)
- `platform-app/src/app/api/provision/generate-blueprint/route.ts` (modify)
- `platform-app/src/app/api/provision/status/route.ts` (minor update — generate phase status)
