# TASK-219a: Pipeline Phase Status API (Research + Plan)

**Story:** US-042
**Priority:** P0
**Estimated Effort:** S
**Milestone:** M7 — AI Content Pipeline
**Sprint:** 11

## Description
Extend the existing provision/status API to include pipeline phase information for Research and Plan phases. The Generate phase will be added in Sprint 12 when TASK-217 and TASK-218 are complete.

## Technical Approach
- Modify `platform-app/src/app/api/provision/status/route.ts`
- Add `pipeline` field to response:
  ```json
  {
    "pipeline": {
      "research": {
        "status": "complete",
        "durationMs": 8200,
        "summary": "Identified 12 industry terms, 3 compliance flags, 5 content themes"
      },
      "plan": {
        "status": "in_progress",
        "startedAt": "2026-03-19T12:00:00Z",
        "elapsed": 4500
      },
      "generate": {
        "status": "pending"
      }
    }
  }
  ```
- Query `research_briefs` and `content_plans` tables for stored phase data
- Use `Site.pipelinePhase` to determine current active phase
- Generate user-friendly summaries: research → key finding count; plan → page count + section overview

## Acceptance Criteria
- [ ] Status API returns `pipeline` object with per-phase status
- [ ] Each phase reports: status (pending/in_progress/complete/failed), durationMs, summary
- [ ] Research summary includes key findings count from the brief
- [ ] Plan summary includes page count and outline overview
- [ ] Generate phase returns `{ status: "pending" }` as placeholder
- [ ] Failed phases include error message

## Dependencies
- TASK-218a (Mini-Orchestrator — manages the phase transitions this API reports on)
- TASK-214 (Pipeline Data Models) — already complete in Sprint 09

## Files/Modules Affected
- `platform-app/src/app/api/provision/status/route.ts` (modify)
