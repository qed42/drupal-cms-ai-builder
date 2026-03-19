# TASK-219: Pipeline Phase Status API

**Story:** US-042
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M7 — AI Content Pipeline

## Description
Enhance the existing provision/status API to include pipeline phase information (research, plan, generate) with status, timing, and summaries.

## Technical Approach
- Modify `platform-app/src/app/api/provision/status/route.ts`
- Add `pipeline` field to response with per-phase status:
  ```json
  { "research": { "status": "complete", "durationMs": 8200, "summary": "..." },
    "plan": { "status": "in_progress", "startedAt": "...", "elapsed": 4500 },
    "generate": { "status": "pending" } }
  ```
- Query research_briefs and content_plans tables for completion data
- Use Site.pipelinePhase for current active phase
- Generate user-friendly summaries from stored research brief / content plan content

## Acceptance Criteria
- [ ] Status API returns pipeline phase information
- [ ] Each phase has: status (pending/in_progress/complete/failed), durationMs, summary
- [ ] Summary for research includes key findings
- [ ] Summary for plan includes page outline overview
- [ ] Generate phase shows per-page progress

## Dependencies
- TASK-218 (Pipeline Orchestrator)
- TASK-214 (Pipeline Data Models)

## Files/Modules Affected
- `platform-app/src/app/api/provision/status/route.ts` (modify)
