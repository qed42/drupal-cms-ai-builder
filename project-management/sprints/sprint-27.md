# Sprint 27: UX Revamp — Foundation (Color, Layout, Dashboard)

**Milestone:** M18 — UX Revamp (US-063)
**Duration:** 2–3 days
**Predecessor:** Sprint 26 (Research & Color Spike)

## Sprint Goal

Ship the foundational UI infrastructure: new color palette, 3-tier layout system, progress stepper, and dashboard fix. After this sprint, the onboarding flow has its new visual bones — ready for AI insight and preview features in S28.

## Tasks

| ID | Task | Priority | Effort | Assignee Persona | Status | Depends On |
|----|------|----------|--------|-------------------|--------|------------|
| TASK-343 | Implement color palette (proven approach) | P0 | M | `/dev` | DONE | TASK-339 |
| TASK-344 | ProgressStepper component | P0 | S | `/dev` | DONE | — |
| TASK-345 | Dashboard subscription card dedup | P1 | S | `/dev` | DONE | — |
| TASK-346 | StepLayout 3-tier layout refactor | P0 | L | `/dev` | DONE | TASK-342 |

## Execution Order

```
Day 1 (parallel):
  • TASK-343 — Color palette (unblocked by S26 spike)
  • TASK-344 — ProgressStepper (no dependencies)
  • TASK-345 — Dashboard fix (no dependencies, investigate data model first)

Day 2:
  • TASK-346 — StepLayout 3-tier refactor (unblocked by S26 wireframes)
  • Integrate TASK-344 into StepLayout

Day 3:
  • TASK-346 continued — verify all 3 layout modes
  • QA: visual regression check on all 11 onboarding steps
  • QA: dashboard with 1 site and multiple sites
```

## Dependencies & Risks

- **TASK-343 blocked by TASK-339** — color spike must have passed in S26
- **TASK-346 blocked by TASK-342** — wireframes must be approved in S26
- **TASK-345 needs data model investigation** — approach varies based on whether subscription is account-level or site-level
- **Risk: Layout regression** — 3-tier layout touches every onboarding step. Thorough visual QA needed.
- **Parallel execution** — TASK-343, TASK-344, and TASK-345 can all start on Day 1 in parallel.

## Definition of Done

- [ ] New color palette renders correctly across Chrome/Firefox/Safari
- [ ] ProgressStepper shows 4 labeled sections with correct visual states (completed/active/upcoming)
- [ ] ProgressStepper responsive: dots+labels on desktop, progress bar on mobile
- [ ] Dashboard: no duplicate subscription cards; SiteCard shows status + plan inline
- [ ] StepLayout supports 3 modes: centered (early steps), split (design steps), summary (review)
- [ ] All 11 onboarding steps render without visual regression
- [ ] Sprint 23 color spike test page cleaned up
