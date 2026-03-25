# TASK-407: Enrich status API with rich phase summaries

**Story:** US-067
**Priority:** P2
**Estimated Effort:** M
**Milestone:** M20 — AI Transparency

## Description
Modify the `/api/provision/status` route to build rich, input-aware phase summaries from existing ResearchBrief, ContentPlan, and Blueprint data instead of returning generic counts.

## Technical Approach
1. Read `platform-app/src/app/api/provision/status/route.ts`
2. For completed phases, query the relevant DB records and call summary template functions:
   - research_complete → load ResearchBrief → `buildResearchSummary(brief.content)`
   - plan_complete → load ContentPlan → `buildPlanSummary(plan.content, session.data.pages)`
   - generate in-progress → parse `pipelinePhase` for currentPage/total → `buildGenerateProgressSummary()`
   - enhance_complete → existing summary is fine
3. Add `currentPage`, `pageProgress`, and `activeKeywords` to generate phase status
4. Parse `generate:2/6:Services` format (existing) and enrich with ContentPlan keywords for active page

## Acceptance Criteria
- [ ] Research summary includes industry name, audience, pain point count, compliance notes
- [ ] Plan summary includes page count, section count, and proactively-added pages
- [ ] Generate in-progress shows currentPage name, pageProgress "3/6", and target keywords
- [ ] Performance: additional DB queries add <50ms to status response (queries are indexed by siteId)
- [ ] Falls back to existing generic summaries if ResearchBrief/ContentPlan records not found

## Dependencies
- TASK-405 (summary template functions)

## Files Affected
- `platform-app/src/app/api/provision/status/route.ts`
