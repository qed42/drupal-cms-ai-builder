# Sprint 36: Live Generation Narrative & Pipeline Metadata

**Milestone:** M20 — AI Transparency
**Duration:** 2 days
**Predecessor:** Sprint 34 or 35 (whichever finishes last)

## Sprint Goal

Replace generic progress text with real-time AI narration during generation, and persist pipeline metadata needed for Sprint 37's tooltip features.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-405 | Create summary template functions (`buildResearchSummary`, `buildPlanSummary`, `buildGenerateProgressSummary`, `buildCompletionSummary`, `buildImpactBullets`) | US-067 | M | — | DONE |
| TASK-407 | Enrich `/api/provision/status` to build rich summaries from ResearchBrief/ContentPlan DB records | US-067 | M | TASK-405 | TODO |
| TASK-408 | Update PipelineProgress.tsx to render enriched summaries + per-page generate progress | US-067 | M | TASK-407 | TODO |
| TASK-411 | Store image search queries in section `_meta.imageQuery` during image resolution | US-070 | S | — | TODO |
| TASK-412 | Store content briefs and target keywords in section `_meta` during Generate phase | US-070 | S | — | TODO |

**Note:** Original TASK-406 (Plan phase summaries) and TASK-409 (completion summary) were consolidated into TASK-405 — all template functions live in one module. Original TASK-410 (persist ResearchBrief/ContentPlan) was removed — investigation confirmed these tables already persist data correctly; no additional work needed.

## Execution Order

```
Wave 1 (parallel): TASK-405, TASK-411, TASK-412
Wave 2:            TASK-407                        ← depends on TASK-405
Wave 3:            TASK-408                        ← depends on TASK-407
```

## Dependencies & Risks

- **Risk:** Per-page progress updates require extending the status polling response. Currently polls every 2s — sufficient for per-page granularity (pages generate in ~5-10s each).
- **Critical:** TASK-411 and TASK-412 are foundational for Sprint 37 (tooltips consume `_meta` data). Must complete in this sprint.
- **Note:** All summaries are template-based string interpolation (NOT AI calls). Zero cost, deterministic output.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| S | 2 | TASK-411, TASK-412 |
| M | 3 | TASK-405, TASK-407, TASK-408 |
| **Total** | **5 tasks** | |

## Definition of Done

- [ ] Each completed pipeline phase shows a specific, user-input-aware summary (not generic counts)
- [ ] Research summary mentions industry, pain point count, compliance notes by name
- [ ] Plan summary mentions page count and any proactively-added pages
- [ ] Generate phase shows per-page progress: "Writing Services page (3 of 6)"
- [ ] Completion summary: "Generated X pages with Y words, Z images, optimized for N keywords"
- [ ] Blueprint sections include `_meta.imageQuery` for image sections
- [ ] Blueprint sections include `_meta.contentBrief` and `_meta.targetKeywords`
- [ ] Playwright test: trigger generation → verify progress page shows rich summaries (not "Analyzing your business...")
