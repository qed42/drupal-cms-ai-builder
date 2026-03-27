# Sprint 46: shadcn/ui Phase 2 — Interactive Primitives

**Milestone:** M24 — UI Component System (Phase 2)
**Duration:** 1 day
**Predecessor:** Sprint 45 (shadcn Foundation — DONE)

## Sprint Goal

Add Dialog/Sheet, RadioGroup, and Tooltip primitives — completing the shadcn component library with accessible interactive patterns for modals, option selection, and hover hints.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-471 | Add shadcn Dialog and Sheet components | US-092 | S | TASK-465 | DONE |
| TASK-472 | Migrate DesignOptionCard to shadcn RadioGroup | US-092 | M | TASK-465 | DONE |
| TASK-473 | Add shadcn Tooltip to ColorSwatch and ViewToggle | US-092 | S | TASK-465 | DONE |

## Execution Order

```
Wave 1 (parallel): TASK-471, TASK-472, TASK-473
  - All independent, each installs its own component
  - TASK-472 is the most complex (RadioGroup + page migrations)
```

## Dependencies & Risks

- **RadioGroup visual match** — Current DesignOptionCard has custom card styling. RadioGroup items need visual override to maintain card appearance while adding radio semantics.
- **Dialog not yet consumed** — TASK-471 installs Dialog/Sheet for future use. No current UI uses modals, but provisioning retry and delete site confirmations will need them.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| S | 2 | TASK-471, TASK-473 |
| M | 1 | TASK-472 |
| **Total** | **3 tasks** | |

## Definition of Done

- [ ] Dialog, Sheet, RadioGroup, Tooltip components in `components/ui/`
- [ ] Theme/design steps use RadioGroup with arrow-key navigation
- [ ] ColorSwatch and ViewToggle show styled tooltips (not native `title`)
- [ ] All components styled for dark theme
- [ ] TypeScript compiles cleanly
- [ ] No visual regression in onboarding flow
