# Sprint 26: UX Revamp — Research & Color Spike

**Milestone:** M18 — UX Revamp (US-063)
**Duration:** 2–3 days
**Predecessor:** Sprint 25 (SEO/GEO Interlinking)

## Sprint Goal

Complete all research groundwork and prove a working Tailwind v4 color system before any production UI changes. This is a **gate sprint** — no UI code ships until the color spike passes and research deliverables are reviewed.

## Tasks

| ID | Task | Priority | Effort | Assignee Persona | Status | Depends On |
|----|------|----------|--------|-------------------|--------|------------|
| TASK-339 | Tailwind v4 color system spike (full style guide) | P0 | M | `/dev` | DONE | — |
| TASK-340 | SaaS onboarding UX research | P0 | L | `/designer` | DONE | — |
| TASK-341 | AI transparency patterns research | P1 | M | `/designer` | DONE | — |
| TASK-342 | Live preview UX research & wireframes | P1 | M | `/designer` | DONE | TASK-340 |

## Execution Order

```
Day 1 (parallel):
  • TASK-339 — Color spike (dev)
  • TASK-340 — SaaS UX research (designer)
  • TASK-341 — AI transparency research (designer)

Day 2:
  • TASK-342 — Preview wireframes (blocked by TASK-340)
  • TASK-339 — Continue spike testing across browsers

Day 3:
  • Review all research deliverables
  • Gate check: Does the color spike pass? → Unblocks S27
  • Gate check: Wireframes approved? → Unblocks TASK-346 in S27
```

## Dependencies & Risks

- **TASK-339 is a hard gate** — if all three color approaches fail, escalate to investigate Tailwind v4 alternatives or CSS Modules fallback. Do NOT proceed to TASK-343 without a proven approach.
- **Risk: Research scope creep** — Research tasks should produce focused documents, not exhaustive audits. Cap each at 1 day of effort.
- **Parallel execution** — TASK-339 (dev) and TASK-340/341 (designer) can run fully in parallel.

## Deliverables

| Deliverable | Task | Format |
|-------------|------|--------|
| Color spike with browser screenshots | TASK-339 | Test page + documentation |
| SaaS onboarding audit report | TASK-340 | `sprint-outputs/s26-saas-onboarding-research.md` |
| AI transparency patterns report | TASK-341 | `sprint-outputs/s26-ai-transparency-research.md` |
| Preview wireframes (3 layout options) | TASK-342 | `sprint-outputs/s26-preview-ux-research.md` |

## Definition of Done

- [ ] Color spike proves one approach works in Chrome/Firefox/Safari with Turbopack
- [ ] Full mini style guide page renders brand scale, accent scale, semantic colors, gradients
- [ ] SaaS research covers 8+ products with top 5 applicable patterns identified
- [ ] AI transparency research maps insights to onboarding steps with copy templates
- [ ] Preview wireframes show 3 layout options with desktop/mobile/tablet views
- [ ] All research documents reviewed and recommendations approved before S27 begins
