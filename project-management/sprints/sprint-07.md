# Sprint 07: Publishing & Polish

**Milestone:** M5 — Publishing & Polish
**Duration:** 2 weeks (~10 dev days)
**Architecture:** v2 (Split Platform)

## Sprint Goal
Add draft/publish workflow, media management, and component swap so site owners can refine and publish their sites with confidence.

## Tasks
| ID | Task | Story | Workstream | Effort | Status |
|----|------|-------|------------|--------|--------|
| TASK-028 | Draft Mode & Content Preview | US-025 | Drupal | M | Not Started |
| TASK-029 | Publish Service & One-Click Publish | US-026 | Drupal + Next.js | M | Not Started |
| TASK-025 | Media Management Configuration | US-022 | Drupal | M | Not Started |
| TASK-024 | Component Swap | US-021 | Drupal | L | Not Started |

## Execution Order

```
Phase 1 — Parallel (Days 1-5):
├── TASK-028: Draft mode & content preview
│   └── Moderation states: draft → published
│   └── Preview route for unpublished content
├── TASK-025: Media management configuration
│   └── Media library config for site_owner role
│   └── Image upload, crop, alt text

Phase 2 — Parallel (Days 6-10):
├── TASK-029: Publish service & one-click publish
│   └── Depends on: TASK-028 (draft mode must exist)
│   └── Bulk publish from dashboard
│   └── Publish status reflected in platform dashboard
└── TASK-024: Component swap
    └── Swap Space DS components within Canvas sections
    └── Preserve content when swapping compatible components
```

## Dependencies & Risks
- **Sprint 06 must be complete:** Page management and AI regeneration working
- **TASK-029 depends on TASK-028:** Can't publish without draft states
- **TASK-024 depends on TASK-118 (Sprint 05, ✅ Done):** Canvas editor with Space DS palette
- **Risk:** Content moderation module may need enabling — verify it's included in Drupal CMS recipe
- **Risk:** Component swap content mapping — not all components have compatible field structures

## Deliverable
Site owners can work in draft mode, preview changes, manage media assets, swap components for different layouts, and publish their site with one click.

## Definition of Done
- [ ] Draft/published moderation states working
- [ ] Content preview accessible for unpublished pages
- [ ] One-click publish transitions all draft content to published
- [ ] Media library accessible to site_owner role
- [ ] Image upload with crop and alt text
- [ ] Component swap preserves content where possible
- [ ] Publish status visible on platform dashboard
- [ ] Playwright tests for draft/publish flow
- [ ] Code committed
