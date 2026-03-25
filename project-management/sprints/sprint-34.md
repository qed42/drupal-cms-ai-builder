# Sprint 34: AI Strategy Preview — Pre-Generation Trust

**Milestone:** M20 — AI Transparency
**Duration:** 2 days
**Predecessor:** Sprint 33 (Header/Footer Canvas & Image Pipeline Fixes)

## Sprint Goal

Give users visibility into the AI's strategy before they click Generate — the single biggest trust gap in the current flow.

## Why This Sprint First

The review-settings page is the last touchpoint before irreversible generation. Users currently go from a list of raw inputs straight to a 3-minute blind wait. Adding a strategy preview here transforms "hope for the best" into "I see the plan, let's go."

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-391 | Add `researchPreview` + `previewInputHash` fields to OnboardingSession (Prisma migration) | US-066 | S | — | TODO |
| TASK-392 | Create input hash utility for cache invalidation (`lib/transparency/input-hash.ts`) | US-066 | S | — | TODO |
| TASK-390 | Create `/api/ai/research-preview` endpoint with cache-through pattern | US-066 | M | TASK-391, TASK-392 | TODO |
| TASK-393 | Pipeline orchestrator checks cached Research preview before running Research phase | US-066, US-070 | S | TASK-391, TASK-392 | TODO |
| TASK-394 | Build StrategyPreview panel + skeleton + `useResearchPreview` hook; integrate on review-settings page | US-065 | L | TASK-390 | TODO |

**Note:** Original TASK-395/396/397 (wire preview, responsive, error handling) were consolidated into TASK-394 per frontend architect's design — the component handles fetch, responsive behavior (`<details>` native collapse), and graceful degradation internally.

## Execution Order

```
Wave 1 (parallel): TASK-391, TASK-392
Wave 2 (parallel): TASK-390, TASK-393    ← both depend on Wave 1
Wave 3:            TASK-394              ← depends on TASK-390
```

## Dependencies & Risks

- **Risk:** Research phase may be too slow for a preview (>20s). Mitigation: 25s server-side timeout; degrade to "Preview unavailable" with Generate button always available.
- **Risk:** Cache invalidation false positives. Mitigation: hash only 7 semantically significant fields.
- **Dependency:** TASK-390 must complete before TASK-394 can integrate.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| S | 3 | TASK-391, TASK-392, TASK-393 |
| M | 1 | TASK-390 |
| L | 1 | TASK-394 |
| **Total** | **5 tasks** | |

## Definition of Done

- [ ] Review-settings page shows AI Strategy Preview within 20 seconds of page load
- [ ] Preview shows page structure, tone examples, SEO keywords, competitive positioning
- [ ] Generate button works regardless of preview status (non-blocking)
- [ ] Preview is cached and re-used during generation (verified: Research phase skipped in pipeline logs when cache is valid)
- [ ] Mobile: `<details>` collapsed by default; desktop: expanded
- [ ] Error state: "Preview unavailable" note, no broken UI
- [ ] Cache invalidation: changing idea/audience/tone nulls the preview
- [ ] Playwright test: navigate to review-settings → verify preview loads → verify Generate still works
