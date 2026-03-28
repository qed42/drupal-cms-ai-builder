# TASK-490: Input-Aware Narrative Messages & Completion Summary

**Story:** US-067
**Priority:** P2
**Effort:** S
**Milestone:** M20 — AI Transparency

## Description

Close the gap between US-093 (Archie's Workshop — delivered in Sprint 51) and US-067's remaining acceptance criteria. Sprint 51 added phase messages and artifacts, but they are generic. This task makes them input-aware and adds a completion summary.

## Acceptance Criteria

- [ ] Research phase messages reference specific user inputs (e.g., "Identified your practice as **family dentistry** with **pediatric** focus" instead of "Analyzing industry")
- [ ] Plan phase messages connect to user inputs (e.g., "Added FAQ page — common for dental practices" not just "Planning 6 pages")
- [ ] Generate phase messages reference tone (e.g., "Writing Services page in your **warm, reassuring** tone")
- [ ] Error/retry events emit contextual messages (e.g., "Content for About page didn't meet quality bar — regenerating with more detail")
- [ ] On pipeline completion, a final summary message is emitted: "Generated X pages with Y sections of content, Z images placed, optimized for N keywords"
- [ ] Summary data is derived from structured pipeline data (ResearchBrief, ContentPlan, page counts) — no additional AI call
- [ ] All new messages appear in both ActivityLog and are stored in `pipelineMessages`

## Technical Notes

- Modify `emitMessage()` calls in `orchestrator.ts` to interpolate from ResearchBrief and ContentPlan data
- Add a `emitCompletionSummary()` call at the end of the enhance phase that counts pages, sections, images, and keywords
- Error/retry: wrap existing retry logic with `emitMessage()` calls that include the page name and reason

## Files to Modify

- `platform-app/src/lib/pipeline/orchestrator.ts` — enrich existing emitMessage calls
