# TASK-236: Original Version Preservation

**Story:** US-051
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M8 — Content Review & Editing

## Description
Preserve the original AI-generated blueprint as a separate record when the user makes their first edit. The provisioned site uses the edited version. Both versions are accessible.

## Technical Approach
- On first edit (PATCH /api/blueprint/{id}/edit): check if `Blueprint.originalPayload` is null
  - If null: copy current `payload` to `originalPayload` before applying the edit
  - If already set: just apply the edit
- Also create a `BlueprintVersion` record with label "original" and version 1
- Create a `GET /api/blueprint/{id}/versions` endpoint to list versions
- The provisioned site always uses `Blueprint.payload` (the working/edited version)

## Acceptance Criteria
- [ ] Original blueprint preserved on first edit
- [ ] Subsequent edits don't overwrite the original
- [ ] originalPayload is immutable once set
- [ ] Versions API returns available versions
- [ ] Provisioning uses the edited payload

## Dependencies
- TASK-232 (Inline Section Editor — triggers edits)
- TASK-214 (Pipeline Data Models — BlueprintVersion model)

## Files/Modules Affected
- `platform-app/src/app/api/blueprint/[id]/edit/route.ts` (modify)
- `platform-app/src/app/api/blueprint/[id]/versions/route.ts` (new)
