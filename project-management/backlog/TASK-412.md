# TASK-412: Store content briefs and target keywords in section metadata

**Story:** US-070
**Priority:** P2
**Estimated Effort:** S
**Milestone:** M20 — AI Transparency

## Description
During the Generate phase, when sections are created from ContentPlan data, attach the originating content brief and target keywords to each section's `_meta` field.

## Technical Approach
1. Read `platform-app/src/lib/pipeline/phases/generate.ts`
2. When the generate phase creates sections for a page, the ContentPlan provides `sections[i].contentBrief` and per-page `targetKeywords`
3. After section generation, map ContentPlan sections to generated sections by index (they correspond 1:1 since the plan drives generation)
4. Set `section._meta.contentBrief = planSection.contentBrief` and `section._meta.targetKeywords = page.targetKeywords`
5. Handle cases where generated section count differs from plan (extra sections get no brief; missing sections are skipped)

## Acceptance Criteria
- [ ] Each generated section has `_meta.contentBrief` from ContentPlan (when available)
- [ ] Each generated section has `_meta.targetKeywords` from ContentPlan page (when available)
- [ ] Missing/extra sections are handled gracefully (no crashes)
- [ ] Blueprint payload stores _meta fields alongside existing section data

## Dependencies
- None

## Files Affected
- `platform-app/src/lib/pipeline/phases/generate.ts`
