# Sprint 29: UX Revamp — Live Preview Pane

**Milestone:** M18 — UX Revamp (US-063)
**Duration:** 2–3 days
**Predecessor:** Sprint 28 (AI Feedback Layer)

## Sprint Goal

Ship the live preview pane: a contextual branded wireframe that updates as users make design choices, making the website "take shape" during onboarding. This is the premium differentiator of the UX revamp.

## Tasks

| ID | Task | Priority | Effort | Assignee Persona | Status | Depends On |
|----|------|----------|--------|-------------------|--------|------------|
| TASK-350 | SiteSkeletonPreview component | P0 | L | `/dev` | TODO | TASK-346 |
| TASK-351 | PreviewPane integration with onboarding state | P0 | L | `/dev` | TODO | TASK-350 |

## Execution Order

```
Day 1:
  • TASK-350 — Build SiteSkeletonPreview:
    - Browser chrome frame with subdomain
    - Header with site name + nav items from pages
    - Hero section with brand color gradient
    - Content sections labeled with page names
    - Footer with brand accent

Day 2:
  • TASK-351 — PreviewPane wrapper + integration:
    - Wire to useOnboarding session state
    - Integration into split-layout steps (pages, design, brand, fonts, follow-up, tone)
    - Debounced state sync (300ms)

Day 3:
  • Handle empty/minimal state gracefully (early design steps)
  • QA: verify preview updates for each user action
  • QA: verify preview hidden on mobile (<1024px)
  • QA: verify centered-layout steps (vision steps) don't show preview
```

## Dependencies & Risks

- **TASK-350 blocked by TASK-346** — 3-tier layout `split` mode provides the container
- **Risk: Performance** — Preview re-renders on state changes. Must verify debounce prevents layout thrashing, especially during color picker interactions.
- **Risk: Font loading** — Preview shows headingFont in actual typeface. If Google Font isn't loaded yet, show fallback gracefully.
- **Risk: Minimal data** — On the `pages` step (first split-layout step), preview may have only a site name. Ensure the skeleton still looks good with sparse data.

## Definition of Done

- [ ] SiteSkeletonPreview renders browser chrome frame with `{siteName}.site.com`
- [ ] Header shows site name + page names as nav items
- [ ] Hero uses brand primaryColor as gradient overlay
- [ ] Content sections labeled with actual page names
- [ ] Heading text renders in selected headingFont
- [ ] Preview updates reactively from onboarding state (300ms debounce)
- [ ] Preview shown on split-layout steps only (pages, design, brand, fonts, follow-up, tone)
- [ ] Preview hidden on mobile (<1024px) and on centered-layout steps
- [ ] Graceful empty state when data is minimal
- [ ] No performance regression (smooth scrolling, no layout thrashing)
