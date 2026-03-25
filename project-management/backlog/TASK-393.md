# TASK-393: Pipeline orchestrator uses cached Research preview

**Story:** US-066, US-070
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M20 — AI Transparency

## Description
Modify the pipeline orchestrator to check for a cached Research preview on the OnboardingSession before running the Research phase. If a valid cache exists (hash matches current inputs), skip the AI call and create a ResearchBrief record from the cached data.

## Technical Approach
1. In `platform-app/src/lib/pipeline/orchestrator.ts`, before calling `runResearchPhase()`:
   - Load OnboardingSession for the siteId
   - Compute current input hash via `computeInputHash(onboardingData)`
   - If `session.researchPreview` exists and `session.previewInputHash === currentHash`:
     - Create ResearchBrief record with `model: "cached"`, `provider: "preview-cache"`
     - Skip the AI call
     - Update pipeline phase to `research_complete`
   - Otherwise: run Research phase normally
2. Ensure the cached path still emits the correct pipeline phase transitions

## Acceptance Criteria
- [ ] When a valid cached preview exists, Research phase completes in <1s (no AI call)
- [ ] ResearchBrief record is created from cache with `model: "cached"` marker
- [ ] Pipeline continues normally with Plan phase after cached Research
- [ ] When no cache exists or hash doesn't match, Research phase runs normally
- [ ] Status API still shows correct Research phase summary regardless of cache hit

## Dependencies
- TASK-391 (schema fields)
- TASK-392 (input hash utility)

## Files Affected
- `platform-app/src/lib/pipeline/orchestrator.ts`
