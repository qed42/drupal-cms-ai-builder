# Sprint 42: Split-Pane Onboarding Layout

**Milestone:** M20 — AI Transparency
**Duration:** 2 days
**Predecessor:** Sprint 39 (Onboarding UX polish — completed)

## Sprint Goal

Upgrade AI-heavy onboarding steps to a two-column split layout on desktop, placing Archie's analysis panel alongside user input for immediate visibility and better AI transparency.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-447 | Create ArchiePanel right-pane wrapper component | US-090 | M | None | DONE |
| TASK-448 | Add compact variant to InferenceCard | US-090 | S | None | DONE |
| TASK-446 | Refactor StepLayout split mode for right-column insightSlot | US-090 | M | TASK-447 | DONE |
| TASK-449 | Switch 6 existing steps to split layout mode | US-090 | S | TASK-446, TASK-448 | DONE |
| TASK-450 | Add InferenceCard to follow-up step with split layout | US-090 | M | TASK-446, TASK-448 | DONE |

## Execution Order

```
Wave 1 (parallel): TASK-447, TASK-448
  - ArchiePanel and InferenceCard compact variant are independent components
  - Both are prerequisites for the layout integration

Wave 2:            TASK-446
  - StepLayout refactor depends on ArchiePanel existing
  - Core layout change that enables all subsequent page updates

Wave 3 (parallel): TASK-449, TASK-450
  - 6 existing page updates and follow-up new InferenceCard are independent
  - Both depend on the StepLayout refactor being complete
```

## Dependencies & Risks

- **No external dependencies** — All work builds on existing components and API endpoints
- **Regression risk** — StepLayout is used by all 13 steps; changes must not break centered or summary modes. Mitigated by mode-specific code paths (existing pattern).
- **Follow-up InferenceCard (TASK-450)** — May need a new lightweight API endpoint if the existing `/api/ai/analyze` doesn't accept accumulated follow-up context. Fallback: reuse existing analyze with concatenated text.
- **Text alignment shift** — Split mode is left-aligned vs. centered mode. Transition between centered and split steps may feel jarring. Mitigated by the fact that steps flow forward (users don't rapidly toggle between modes).

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| S | 2 | TASK-448, TASK-449 |
| M | 3 | TASK-446, TASK-447, TASK-450 |
| **Total** | **5 tasks** | |

## Definition of Done

- [ ] 7 onboarding steps (idea, audience, pages, brand, fonts, follow-up, tone) render in split layout on desktop ≥1024px
- [ ] 5 steps (start, theme, name, design, images) remain centered; review-settings remains summary
- [ ] ArchiePanel shows empty/loading/populated states with correct transitions
- [ ] InferenceCard compact variant renders after "Looks right" confirmation
- [ ] All transitions respect `prefers-reduced-motion`
- [ ] Mobile (<1024px) behavior is unchanged — single column, card below input
- [ ] No TypeScript compilation errors
- [ ] No regressions in form submission, navigation, or data persistence across all 13 steps
