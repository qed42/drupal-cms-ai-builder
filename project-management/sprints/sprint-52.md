# Sprint 52: M20 Completion — AI Transparency Polish

**Milestone:** M20 — AI Transparency
**Duration:** 3 days
**Predecessor:** Sprint 51 (Archie's Workshop — DONE)

## Sprint Goal

Close out M20 by adding input-aware narrative messages, review editor insights (page-level and section-level), and dashboard impact summaries. All features use existing pipeline metadata — no new AI calls.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-490 | Input-aware narrative messages & completion summary | US-067 | S | None | DONE |
| TASK-491 | Page-level insights panel in review editor | US-069 | M | None | DONE (pre-existing) |
| TASK-492 | "Why This?" section tooltips in review editor | US-068 | M | TASK-491 | DONE (pre-existing) |
| TASK-493 | Input impact summary on dashboard site card | US-071 | S | None | DONE (pre-existing) |

## Execution Order

```
Wave 1 (parallel): TASK-490, TASK-491, TASK-493
  - TASK-490: Enrich pipeline emitMessage calls with user input references
  - TASK-491: Build PageInsightsPanel component + data wiring
  - TASK-493: Generate impact bullets at pipeline end + dashboard UI
  All three are independent — different files, different features

Wave 2:            TASK-492
  - Depends on TASK-491 for shared data access patterns
  - Builds SectionInsight component using same metadata sources
```

## Dependencies & Risks

- **Data availability** — TASK-491 and TASK-492 depend on `_review` data being present in blueprints. Must handle gracefully when missing (older sites, failed review phases).
- **Input-to-section mapping (TASK-491)** — Requires adding lightweight metadata during Generate phase to record which user inputs influenced each section. This is a small orchestrator change but crosses the backend/frontend boundary.
- **Review editor page** — TASK-491 and TASK-492 modify the review page. Verify current review page structure before implementation.
- **No new AI calls** — All four tasks must use existing stored metadata. This is a hard constraint to prevent cost/latency regression.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| S | 2 | TASK-490, TASK-493 |
| M | 2 | TASK-491, TASK-492 |
| **Total** | **4 tasks** | |

## Definition of Done

- [ ] Pipeline messages reference specific user inputs (business name, tone, industry, services)
- [ ] Pipeline completion emits summary with page/section/image/keyword counts
- [ ] Error/retry events emit contextual messages with page name and reason
- [ ] Review editor shows page-level insights panel (quality score, SEO coverage, word count, input mapping)
- [ ] Review editor shows section-level "Why This?" tooltips (influencing inputs, keywords, rationale)
- [ ] Image sections show search query in tooltip
- [ ] Edited sections show "original reasoning may no longer apply" note
- [ ] Dashboard site card shows 3-5 impact summary bullets
- [ ] All features work with partial/missing metadata (graceful degradation)
- [ ] Desktop: panels as slide-outs/popovers; Mobile: overlays/bottom sheets
- [ ] No additional AI API calls introduced
- [ ] No TypeScript compilation errors
- [ ] M20 milestone can be marked COMPLETE after this sprint
