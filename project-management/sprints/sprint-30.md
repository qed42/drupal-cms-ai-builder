# Sprint 30: UX Revamp — Polish, Trust & QA

**Milestone:** M18 — UX Revamp (US-063)
**Duration:** 2 days
**Predecessor:** Sprint 29 (Live Preview Pane)

## Sprint Goal

Final polish sprint: add social proof on the start page, polish animations across the flow, and run comprehensive cross-browser QA to verify the entire UX revamp renders correctly. This sprint closes Milestone M18.

## Tasks

| ID | Task | Priority | Effort | Assignee Persona | Status | Depends On |
|----|------|----------|--------|-------------------|--------|------------|
| TASK-352 | SocialProofBanner start page | P2 | S | `/dev` | TODO | — |
| TASK-353 | Animation polish & transitions | P2 | M | `/dev` | TODO | TASK-351 |
| TASK-354 | Cross-browser QA & color verification | P1 | M | `/qa` | TODO | TASK-343, TASK-353 |

## Execution Order

```
Day 1 (parallel):
  • TASK-352 — SocialProofBanner on start page
  • TASK-353 — Animation polish:
    - Step transitions (fade + directional slide)
    - Insight chip/card entrance animations
    - Preview pane smooth transitions
    - ProgressStepper animated fill
    - prefers-reduced-motion support

Day 2:
  • TASK-354 — Cross-browser QA:
    - Chrome, Firefox, Safari (desktop + mobile viewports)
    - Color verification (computed styles match expected hex)
    - Split-pane breakpoint verification (1024px boundary)
    - WCAG AA contrast ratio checks
    - Playwright visual regression test suite
```

## Dependencies & Risks

- **TASK-353 blocked by TASK-351** — all animated components must exist before polishing
- **TASK-354 blocked by TASK-343 + TASK-353** — colors and animations must be in place before final QA
- **Risk: Safari CSS quirks** — Custom properties and gradients may behave differently. Budget extra time for Safari debugging.
- **Risk: Animation performance** — Ensure GPU-accelerated transforms only (no layout-triggering properties). Test on lower-end devices if possible.
- **P2 tasks are droppable** — If M18 is running over budget, TASK-352 (social proof) and TASK-353 (animations) can be deferred. TASK-354 (QA) should not be skipped.

## Definition of Done

- [ ] Start page shows social proof metric (site count or trust indicator)
- [ ] Step transitions are smooth (fade + directional slide, <300ms)
- [ ] All insight chips/cards animate on entrance
- [ ] `prefers-reduced-motion` disables all animations
- [ ] Colors verified in Chrome, Firefox, Safari — computed styles match expected hex
- [ ] WCAG AA contrast ratios met for all text/background combinations
- [ ] Split-pane breakpoint works correctly at 1024px boundary
- [ ] No horizontal overflow at any viewport width (375px → 1440px)
- [ ] Playwright visual regression tests pass for all 11 steps + dashboard

## Milestone M18 Completion Criteria

When Sprint 30 DoD is met, Milestone M18 is complete. Invoke `/qa sprint-30` for final verification, then `/tpm` to close M18.
