# TASK-214: Pipeline Data Models (Prisma Migration)

**Story:** US-044
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M7 — AI Content Pipeline

## Description
Add Prisma models for ResearchBrief, ContentPlan, and BlueprintVersion. Add pipelinePhase and pipelineError fields to the Site model. Add originalPayload to Blueprint model.

## Technical Approach
- Add `ResearchBrief` model: id, siteId, version, content (Json), model, provider, durationMs, createdAt
- Add `ContentPlan` model: id, siteId, researchBriefId, version, content (Json), model, provider, durationMs, createdAt
- Add `BlueprintVersion` model: id, blueprintId, version, label, payload (Json), createdAt
- Add to Site: `pipelinePhase String?`, `pipelineError String?`
- Add to Blueprint: `originalPayload Json?`
- Add relations: Site → ResearchBrief[], Site → ContentPlan[], Blueprint → BlueprintVersion[]
- Run `npx prisma db push` to apply

## Acceptance Criteria
- [ ] All three new models created in schema.prisma
- [ ] Site model has pipelinePhase and pipelineError fields
- [ ] Blueprint model has originalPayload field
- [ ] Unique constraints: [siteId, version] on ResearchBrief and ContentPlan, [blueprintId, version] on BlueprintVersion
- [ ] Migration applies without errors

## Dependencies
- None (foundation task)

## Files/Modules Affected
- `platform-app/prisma/schema.prisma` (modify)
