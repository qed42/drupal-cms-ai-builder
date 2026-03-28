# TASK-504: Branch Generate Phase on Generation Mode

**Story:** Code Components Initiative
**Priority:** P0
**Effort:** L
**Milestone:** M26 — Code Component Generation

## Description

Branch the Generate phase in the pipeline orchestrator based on `generationMode`. When mode is `code_components`, call the Designer Agent per section and produce Code Component config entities instead of SDC component trees.

## Technical Approach

- Add mode check in `orchestrator.ts` before Generate phase
- Create `runCodeComponentGenerate()` parallel to existing `runGeneratePhase()`
- For each page in ContentPlan:
  - For each section: call Designer Agent → validate → wrap as config YAML
  - Generate header/footer as Code Components
- Assemble blueprint payload with Code Component configs and tree nodes
- Emit same progress messages (compatible with ActivityLog)
- Store Code Component config YAMLs in blueprint payload under `_codeComponents[]`

## Acceptance Criteria

- [ ] SDC mode works identically to before (no regression)
- [ ] Code component mode generates JSX components for all planned sections
- [ ] Blueprint payload contains Code Component config YAMLs
- [ ] Canvas tree nodes use `js.[machineName]` component_id format
- [ ] Progress messages emitted per page (compatible with ActivityLog)
- [ ] Error handling with contextual messages on failure

## Dependencies
- TASK-500, TASK-501, TASK-503

## Files to Modify

- `platform-app/src/lib/pipeline/orchestrator.ts`
- `platform-app/src/lib/pipeline/phases/generate.ts` (or new parallel file)
