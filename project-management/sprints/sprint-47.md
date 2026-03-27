# Sprint 47: UX Modernization — Foundation

**Milestone:** M25 — Onboarding UX Modernization
**Duration:** 2 days
**Predecessor:** Sprint 46 (shadcn Phase 2 — DONE)
**Architecture:** `architecture-onboarding-ux-modernization.md`

## Sprint Goal

Establish the foundation for the onboarding UX overhaul: resolve the color token conflict, standardize form inputs, add contextual tips to the ArchiePanel, and ship quick-win polish improvements (hover states, accessibility, micro-animations).

## Tasks

| ID | Task | Effort | Depends On | Status |
|----|------|--------|------------|--------|
| TASK-474 | Resolve color token conflict — single source of truth | M | — | TODO |
| TASK-475 | Standardize Input component with size variants | M | TASK-474 | TODO |
| TASK-476 | ArchiePanel contextual tips system | M | — | TODO |
| TASK-477 | Quick wins — hover states, accessibility, micro-animations | M | — | TODO |

## Execution Order

```
Wave 1 (parallel): TASK-474, TASK-476, TASK-477
  - TASK-474: Color token cleanup (globals.css + brand.ts audit)
  - TASK-476: Tips system (new component + step data)
  - TASK-477: Independent polish across multiple components

Wave 2 (sequential): TASK-475
  - Depends on TASK-474 (semantic tokens must exist before Input variants reference them)
  - Migrates all manual input styling to shadcn Input variants
```

## Dependencies & Risks

- **Color token audit scope** — TASK-474 must audit every `emerald-*`, `amber-*`, `red-*` usage. Not all should migrate to semantic tokens — only recurring status patterns. Risk: visual regressions if over-zealous replacement.
- **Input migration breadth** — TASK-475 touches 8+ page files. Each must be visually verified post-migration.
- **Tips copy quality** — TASK-476 requires well-crafted copy for each step. Poor tips are worse than no tips.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| M | 4 | TASK-474, TASK-475, TASK-476, TASK-477 |
| **Total** | **4 tasks** | |

## Definition of Done

- [ ] `BRAND_COLORS` and `BG_GRADIENT` removed from `brand.ts`
- [ ] Semantic color tokens (`success`, `warning`, `error`, `info`) in `globals.css`
- [ ] All form inputs use shadcn `Input`/`Textarea` with size variants (default/lg/xl)
- [ ] ArchiePanel shows contextual tips when empty (all split-layout steps)
- [ ] Interactive cards have hover scale effect
- [ ] Upload zones keyboard-accessible
- [ ] ProgressStepper has step-complete animation
- [ ] AI loading areas use Skeleton component
- [ ] All animations respect `prefers-reduced-motion`
- [ ] No visual regressions — screenshot comparison before/after
