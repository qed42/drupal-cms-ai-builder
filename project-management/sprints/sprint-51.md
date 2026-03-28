# Sprint 51: Archie's Workshop — Engaging AI Progress Experience

**Milestone:** M20 — AI Transparency
**Duration:** 3 days
**Predecessor:** Sprint 43 (M20/M22 Bug Fixes — DONE)

## Sprint Goal

Transform the "Building your site" progress page from a passive status dashboard into a live feed of Archie's thinking — streaming reasoning messages, live content previews, and structured artifacts as the pipeline runs.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-486 | Add `messages[]` to pipeline phase status | US-093 | M | None | DONE |
| TASK-487 | Create ActivityLog component | US-093 | S | TASK-486 | DONE |
| TASK-488 | Expand PipelineProgress phase cards with live artifacts | US-093 | M | TASK-486 | DONE |
| TASK-489 | Progress page split layout with ActivityLog integration | US-093 | S | TASK-487, TASK-488 | DONE |

## Execution Order

```
Wave 1:            TASK-486
  - Backend: emit reasoning messages from all 4 pipeline phases
  - Must land first — frontend tasks consume this data

Wave 2 (parallel): TASK-487, TASK-488
  - ActivityLog component and expanded PhaseCards are independent
  - Both read messages[] from the status API

Wave 3:            TASK-489
  - Integrates ActivityLog + expanded cards into split-layout progress page
  - Depends on both Wave 2 tasks
```

## Dependencies & Risks

- **No external dependencies** — extends existing pipeline and polling infrastructure
- **Backend message frequency** — Too many messages could bloat polling responses. Cap at 3-5 per phase, ~20 total.
- **Polling latency** — 2-second polling means messages appear with up to 2s delay. Acceptable for v1; SSE upgrade is a future option.
- **Backward compatibility** — Frontend must handle status responses with no `messages` or `artifacts` fields (older sites still generating).
- **Generate phase is the longest wait** — Content preview is highest-impact engagement. Prioritize that in TASK-486 if time-boxed.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| S | 2 | TASK-487, TASK-489 |
| M | 2 | TASK-486, TASK-488 |
| **Total** | **4 tasks** | |

## Definition of Done

- [ ] Each pipeline phase emits 3-5 reasoning messages visible on the progress page
- [ ] Generate phase shows live content preview (first ~150 chars of current page hero)
- [ ] Completed phases show structured artifacts (industry, page list, image counts)
- [ ] Desktop: two-column layout with activity log in right column
- [ ] Mobile: collapsed 3-message activity summary below phase cards
- [ ] Activity log auto-scrolls and messages fade in
- [ ] All animations respect `prefers-reduced-motion`
- [ ] No regression in error handling, retry, or provisioning progress
- [ ] Backward compatible with existing status responses (no messages field)
- [ ] No TypeScript compilation errors
