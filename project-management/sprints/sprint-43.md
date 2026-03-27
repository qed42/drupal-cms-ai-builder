# Sprint 43: M20/M22 Polish — Design Review Bug Fixes + Image Pipeline Refactor

**Milestone:** M20 — AI Transparency + M22 — User-Uploaded Images
**Duration:** 2 days
**Predecessor:** Sprint 42 (Split-Pane Layout — DONE)

## Sprint Goal

Fix the 9 design review bugs from the split-pane onboarding layout and commit the image pipeline refactor, bringing both milestones to shippable quality.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-451 | Separate image resolution from content generation phase | US-091 | M | None | DONE |
| TASK-452 | Fix Audience step InferenceCard never populating | US-090 | S | None | DONE |
| TASK-453 | Fix Pages step InferenceCard ghosting/overlapping | US-090 | S | None | DONE |
| TASK-454 | Fix centered textarea in left-aligned split layout | US-090 | S | None | DONE |
| TASK-455 | Fix mismatched empty state copy in ArchiePanel | US-090 | XS | None | DONE |
| TASK-456 | Fix progress stepper alignment jumps between modes | US-090 | S | None | DONE |
| TASK-457 | Minor UI polish: compact spacing, font overflow, transitions, tone data | US-090 | S | None | DONE |

## Execution Order

```
Wave 0:            TASK-451 (commit only — code already implemented)

Wave 1 (parallel): TASK-452, TASK-453
  - Two critical bugs, independent fix areas (API data flow vs CSS stacking)
  - Must fix before shipping M20

Wave 2 (parallel): TASK-454, TASK-455, TASK-456
  - Three major bugs, all independent (textarea alignment, empty state copy, stepper position)

Wave 3:            TASK-457
  - Minor polish, can be done last or deferred if time-boxed
```

## Dependencies & Risks

- **No external dependencies** — All bugs are in existing platform-app components
- **Regression risk** — Fixes to StepLayout (TASK-454, TASK-456) affect all 13 steps; test all layout modes after changes
- **TASK-452 investigation risk** — Root cause may be in the API endpoint rather than the component; may require server-side tracing
- **TASK-451 already implemented** — Just needs commit and verification; no code risk

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| XS | 1 | TASK-455 |
| S | 4 | TASK-452, TASK-453, TASK-454, TASK-456 |
| S | 1 | TASK-457 |
| M | 1 | TASK-451 |
| **Total** | **7 tasks** | |

## Definition of Done

- [ ] TASK-451 committed: Generate phase makes zero Pexels calls; Enhance phase owns all image resolution
- [ ] Audience step InferenceCard populates with AI analysis (TASK-452)
- [ ] Pages step InferenceCard renders without ghosting (TASK-453)
- [ ] All split-layout form inputs are left-aligned (TASK-454)
- [ ] ArchiePanel shows contextual empty state per step (TASK-455)
- [ ] Progress stepper position is stable across layout mode transitions (TASK-456)
- [ ] Minor polish items addressed (TASK-457)
- [ ] No TypeScript compilation errors
- [ ] No regressions in centered-mode or summary-mode steps
