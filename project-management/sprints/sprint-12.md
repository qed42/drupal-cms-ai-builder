# Sprint 12: Content Pipeline — Generate Phase & Full Orchestrator

**Milestone:** M7 — AI Content Pipeline
**Duration:** 1 week
**Prerequisites:** Sprint 11 (Research + Plan phases, mini-orchestrator, status API) ✅

## Sprint Goal
Complete the full Research → Plan → Generate pipeline by implementing per-page content generation, extending the orchestrator with the Generate phase, and replacing the single-spinner progress UI with a step-by-step pipeline visibility component.

## Tasks
| ID | Task | Story | Effort | Assignee Persona | Status |
|----|------|-------|--------|-------------------|--------|
| TASK-217 | Per-Page Content Generation | US-041 | XL | /dev | Done |
| TASK-218b | Extend Orchestrator with Generate Phase | US-039/040/041 | M | /dev | Done |
| TASK-220 | Pipeline Phase Visibility UI | US-042 | L | /dev | Done |

## Task Details

### TASK-217: Per-Page Content Generation (XL)
**Files:** `platform-app/src/lib/pipeline/phases/generate.ts` (new), `platform-app/src/lib/ai/prompts/page-generation.ts` (new)

Implement the Generate phase that iterates over each page in the ContentPlan, makes a per-page AI call using the research brief + plan context, and produces full-length content with component trees. This is the heaviest task in the sprint.

**Key implementation notes:**
- Build per-page prompt with: research brief, content plan page outline (incl. `estimatedWordCount`), site tone/brand context
- Call `generateValidatedJSON()` per page with the existing `PageLayoutSchema` (from `schemas.ts`)
- After AI returns page layout, call `buildComponentTree()` to produce Canvas component trees
- Sequential generation (not parallel) per ADR-006 — update status with current page name
- Content depth targets: services 150-300 words, about 300-500 words, bios 100-150 words, FAQ 100-200 words
- Assemble all generated pages + research brief metadata into a `BlueprintBundle`

**Acceptance Criteria:**
- [ ] Each page generated in a separate AI call using plan outline as input
- [ ] Generated content meets word count targets (per `estimatedWordCount` from plan)
- [ ] Component trees built correctly for Canvas import via `buildComponentTree()`
- [ ] Pipeline status updates with per-page progress ("Generating Home page...")
- [ ] Total generation < 120 seconds for a 6-page site (NFR-03)
- [ ] CTAs are contextual, specific to the business (not generic "Get started")
- [ ] Blueprint output format is compatible with existing provisioning engine

### TASK-218b: Extend Orchestrator with Generate Phase (M)
**Files:** `platform-app/src/lib/pipeline/orchestrator.ts` (modify), `platform-app/src/app/api/provision/generate-blueprint/route.ts` (modify)
**Depends on:** TASK-217

Sprint 11's TASK-218a created the mini-orchestrator (`orchestrator.ts`) that chains Research → Plan. This task extends it to add the Generate phase and removes the v1 `generateBlueprint()` fallback.

**Key changes from TASK-218a baseline:**
- Add `generate` and `generate_complete` to `PipelinePhase` type
- Add Generate phase call after Plan completes in `runPipeline()`
- After Generate completes: transition site status to `"review"` (not `"provisioning"`)
- Store final blueprint in DB (same format as v1 for provisioning compatibility)
- In `generate-blueprint/route.ts`: remove the `runV2Pipeline()` fallback to `generateBlueprint()` — the full pipeline now replaces it
- Keep `CONTENT_PIPELINE_V2` env toggle for safety — when `false`, fall back to v1

**Acceptance Criteria:**
- [ ] Pipeline runs Research → Plan → Generate sequentially
- [ ] `PipelinePhase` type includes generate/generate_complete/generate_failed
- [ ] Site transitions to `"review"` status after generation (not `"provisioning"`)
- [ ] v1 `generateBlueprint()` still works when `CONTENT_PIPELINE_V2=false`
- [ ] Blueprint format is compatible with existing provisioning engine
- [ ] Pipeline error handling covers Generate phase failures

### TASK-220: Pipeline Phase Visibility UI (L)
**Files:** `platform-app/src/components/onboarding/PipelineProgress.tsx` (new), `platform-app/src/app/onboarding/progress/page.tsx` (modify)
**Depends on:** TASK-218b (needs full pipeline phase data from status API)

Replace the current single-spinner progress page with a step-by-step UI showing Research → Plan → Generate phases with real-time status, timing, and expandable summaries.

**Key implementation notes:**
- The status API (TASK-219a, Sprint 11) already returns the `pipeline` object with per-phase status, durationMs, and summaries
- Poll `/api/provision/status` every 2 seconds (existing `pollStatus` logic)
- Three-phase display: Research → Plan → Generate
- Each phase shows: status icon (spinner/checkmark/error), elapsed time, expandable summary
- Generate phase shows per-page progress within it
- On all phases complete: redirect to `/onboarding/review` (new route, Sprint 13 will implement — for now redirect to `/dashboard`)
- Replace `GenerationProgress` component with the new `PipelineProgress`
- ARIA live regions for screen reader accessibility (NFR-18)

**Acceptance Criteria:**
- [ ] Progress page shows 3 phases with individual status indicators
- [ ] Real-time updates via polling (2-second interval)
- [ ] Expandable summaries for completed phases
- [ ] Per-page progress visible during Generate phase
- [ ] Elapsed time displayed per phase
- [ ] Error state per phase with retry capability
- [ ] ARIA live regions for screen reader updates (NFR-18)
- [ ] Redirects to dashboard when generation completes (review page comes in Sprint 13)

## Execution Order

```
TASK-217 (Per-Page Generation) — core generate phase logic + prompts
    ↓
TASK-218b (Extend Orchestrator) — wires generate into pipeline, removes v1 fallback
    ↓
TASK-220 (Pipeline Visibility UI) — replaces single-spinner with step-by-step UI
```

## Dependencies & Risks
- **Sprint 11 foundation:** Orchestrator, status API, Research + Plan phases all in place
- TASK-217 → TASK-218b (generate phase must exist before orchestrator can call it)
- TASK-218b → TASK-220 (UI needs full pipeline phase data including Generate)
- **Risk: Prompt quality** — per-page generation is the hardest prompt engineering challenge. Expect 2-3 iterations to hit word count and quality targets.
- **Risk: Performance** — 6 pages × ~15-20s each = 90-120s total. If exceeding 120s, consider reducing section count or parallelizing (breaks ADR-006).
- **Risk: Component tree mapping** — `buildComponentTree()` was built for v1's simpler content. Richer v2 content sections may surface unmapped component types.
- **Risk: Review page redirect** — TASK-220 redirects to `/dashboard` since the review page (Sprint 13) doesn't exist yet. Sprint 13 will change this to `/onboarding/review`.

## Sprint 11 Artifacts Used
| File | Created in | Used by |
|------|-----------|---------|
| `pipeline/orchestrator.ts` | TASK-218a | TASK-218b (extend) |
| `pipeline/phases/research.ts` | TASK-215 | TASK-218b (called by orchestrator) |
| `pipeline/phases/plan.ts` | TASK-216 | TASK-218b (called by orchestrator) |
| `pipeline/schemas.ts` | Sprint 09 + BUG-310 | TASK-217 (PageLayoutSchema, estimatedWordCount) |
| `provision/status/route.ts` | TASK-219a | TASK-220 (polls for pipeline status) |
| `provision/generate-blueprint/route.ts` | TASK-218a | TASK-218b (remove v1 fallback) |

## Definition of Done
- [ ] Per-page generation produces 150-300 word service descriptions, 300-500 word about pages
- [ ] Total site content is 2,000+ words for a 6-page site
- [ ] Pipeline orchestrator runs all 3 phases sequentially with status tracking
- [ ] Site transitions to "review" status after generation (not "provisioning")
- [ ] Phase visibility UI shows Research → Plan → Generate with real-time progress
- [ ] Per-page progress visible during Generate phase
- [ ] v1 `generateBlueprint()` still works when CONTENT_PIPELINE_V2=false
- [ ] Playwright tests cover full pipeline execution flow
- [ ] All code committed
