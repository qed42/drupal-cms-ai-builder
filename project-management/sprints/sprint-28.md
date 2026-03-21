# Sprint 28: UX Revamp — AI Feedback Layer

**Milestone:** M18 — UX Revamp (US-063)
**Duration:** 2–3 days
**Predecessor:** Sprint 27 (Foundation)

## Sprint Goal

Add the AI transparency layer: insight chips on early steps, insight cards on design steps, and the RecipeCard summary on the review screen. After this sprint, users see real-time AI feedback as they build their site.

## Tasks

| ID | Task | Priority | Effort | Assignee Persona | Status | Depends On |
|----|------|----------|--------|-------------------|--------|------------|
| TASK-347 | AiInsightChip + AiInsightCard components | P0 | M | `/dev` | TODO | TASK-346 |
| TASK-348 | AI insight integration per step (chip + card) | P0 | L | `/dev` | TODO | TASK-347 |
| TASK-349 | RecipeCard pre-generation summary | P1 | M | `/dev` | TODO | TASK-347 |

## Execution Order

```
Day 1:
  • TASK-347 — Build both AiInsightChip and AiInsightCard components
  • TASK-347 — Build getStepInsight() helper in ai-insights.ts

Day 2 (parallel):
  • TASK-348 — Integrate insights into all 8 applicable steps
  • TASK-349 — Build RecipeCard for review-settings page

Day 3:
  • TASK-348 continued — verify insights update reactively (debounced)
  • QA: all 11 steps with populated session data
  • QA: mobile layout — insights render inline below inputs
```

## Dependencies & Risks

- **TASK-347 blocked by TASK-346** — 3-tier layout must exist to provide `insightSlot`
- **Risk: Insight copy quality** — `getStepInsight()` derives copy from session data. If session data is sparse (e.g., early in flow), insights may feel generic. Ensure null return for weak data.
- **Risk: Over-communication** — Insight chips on early steps must feel like whispers (`text-white/40`), not announcements. QA should verify they don't add visual noise.
- **Parallel execution** — TASK-348 and TASK-349 can run in parallel once TASK-347 is complete.

## Definition of Done

- [ ] `AiInsightChip` renders as subtle one-liner with sparkle icon
- [ ] `AiInsightCard` renders with title, description, optional visual content
- [ ] Both variants respect `prefers-reduced-motion`
- [ ] 4 centered-layout steps show chip variant; 4 split-layout steps show card variant
- [ ] Insights reflect actual session data (not hardcoded)
- [ ] Insights update reactively on input change (300ms debounce)
- [ ] RecipeCard aggregates all choices on review-settings page
- [ ] RecipeCard sections link back to relevant steps for editing
- [ ] No insight shown on start, follow-up, review-settings steps
