# TASK-217: Per-Page Content Generation

**Story:** US-041
**Priority:** P0
**Estimated Effort:** XL
**Milestone:** M7 — AI Content Pipeline

## Description
Implement the Generate phase that produces full-length content for each page individually, using the research brief and content plan as context. This is the most complex pipeline phase.

## Technical Approach
- Create `platform-app/src/lib/pipeline/phases/generate.ts`
- For each page in the content plan, make a separate AI call:
  - Build per-page prompt with: research brief, content plan, page outline, site context (tone, brand)
  - Call `generateValidatedJSON<EnhancedPageLayout>(provider, prompt, pageSchema)`
  - Update pipeline status with current page name ("Generating Home page...")
- Assemble results into BlueprintBundle format
- Content depth targets per PRD: services 150-300 words, about 300-500 words, bios 100-150 words, FAQ answers 100-200 words
- Sequential generation (not parallel) per ADR-006
- Build component trees using existing `buildComponentTree()` function
- Target: < 20s per page, < 120s total for 6 pages (NFR-03)

## Acceptance Criteria
- [ ] Each page generated in a separate AI call
- [ ] Generated content meets word count targets (service descriptions 150+ words)
- [ ] Component trees built correctly for Canvas import
- [ ] Pipeline status updates with per-page progress
- [ ] Total generation < 120s for a 6-page site
- [ ] CTAs are contextual (not generic "Get started")

## Dependencies
- TASK-216 (Plan Phase)
- TASK-213 (Structured Output Validation)

## Files/Modules Affected
- `platform-app/src/lib/pipeline/phases/generate.ts` (new)
- `platform-app/src/lib/ai/prompts/page-generation.ts` (new)
- `platform-app/src/lib/blueprint/types.ts` (extend PageLayout)
