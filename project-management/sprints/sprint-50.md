# Sprint 50: UX Modernization — Polish & Auth

**Milestone:** M25 — Onboarding UX Modernization
**Duration:** 2 days
**Predecessor:** Sprint 49 (Step Consolidation Part 2 — TODO)
**Architecture:** `architecture-onboarding-ux-modernization.md` (ADR-5, ADR-6, ADR-7)

## Sprint Goal

Ship the final polish layer: page transitions between onboarding steps, a showcase carousel on the auth page, a celebration moment + read-only preview mode on the review page, and a dashboard empty state.

## Tasks

| ID | Task | Effort | Depends On | Status |
|----|------|--------|------------|--------|
| TASK-482 | Page transitions via CSS View Transition API | M | TASK-481 | TODO |
| TASK-483 | Auth page — generated site showcase carousel | M | — | TODO |
| TASK-484 | Review page — read-only preview + celebration moment | L | — | TODO |
| TASK-485 | Dashboard empty state design | S | — | TODO |

## Execution Order

```
Wave 1 (parallel): TASK-483, TASK-484, TASK-485
  - All independent — different pages, no shared dependencies
  - TASK-484 is the largest (review page state machine)
  - TASK-483 needs curated screenshots (prerequisite: generate 3-4 sites)
  - TASK-485 is smallest (new component + conditional render)

Wave 2: TASK-482
  - Depends on TASK-481 (step config finalized)
  - Adds View Transition API calls to StepLayout navigation
  - Must test on Safari 18.2+, Chrome, Firefox
```

## Component Details

### TASK-482: View Transitions
```
Forward (→): Slide old content left, slide new content from right
Back (←):    Slide old content right, slide new content from left
Reduced motion: Opacity crossfade only (150ms)
Unsupported:    Instant navigation (fallback, no polyfill)

Integration points:
  - StepLayout.tsx (Continue/Back button handlers)
  - start/page.tsx (CTA button)
  - review-settings/page.tsx (Back button)
```

### TASK-483: Showcase Carousel
```
┌─────────────────────────────────┐
│                                 │
│  "Your professional Drupal      │
│   website, built by AI..."      │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │   [Site Screenshot 1]     │  │
│  │   ← CSS crossfade →      │  │
│  │   [Site Screenshot 2]     │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  "Sites built by Space AI"      │
│  "Trusted by businesses..."     │
│                                 │
└─────────────────────────────────┘

Animation: 4s visible → 1s crossfade → next image
Cycle: 20s total (4 images)
```

### TASK-484: Review Page State Machine
```
State: celebration ──(2s auto)──→ preview ──(user click)──→ edit
                                    ↑                        │
                                    └────(user click)────────┘

celebration: Animated checkmark + "Your site is ready!" (2s)
preview:     Full-page read-only, floating "Edit Content" FAB
edit:        Current editor (sidebar + preview + sections)
```

### TASK-485: Empty Dashboard
```
┌─────────────────────────────────────┐
│                                     │
│          [wireframe SVG]            │
│                                     │
│     Build your first website        │
│  Archie designs your site in 5 min  │
│                                     │
│       [Get Started Free →]          │
│                                     │
│    No credit card required          │
│                                     │
└─────────────────────────────────────┘
```

## Dependencies & Risks

- **Screenshot curation** — TASK-483 requires 3-4 real generated site screenshots. Must either generate these through the platform or mock them. Each image should be < 100KB (WebP, 1280x800).
- **View Transition browser support** — Chrome 111+ (2023), Safari 18.2+ (2025), Firefox 154+ (2025). Older browsers get no animation (acceptable).
- **Review page refactor scope** — TASK-484 modifies the most complex page in the app. The celebration + preview + edit state machine must preserve all existing editor functionality.
- **localStorage for celebration skip** — TASK-484 stores `celebration-seen-{siteId}` in localStorage. Must handle SSR (check `typeof window !== 'undefined'`).

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| S | 1 | TASK-485 |
| M | 2 | TASK-482, TASK-483 |
| L | 1 | TASK-484 |
| **Total** | **4 tasks** | |

## Definition of Done

- [ ] Onboarding steps slide smoothly between pages (forward/back)
- [ ] `prefers-reduced-motion` users see fade-only or instant transitions
- [ ] Auth left panel shows rotating site screenshots (CSS-only animation)
- [ ] Review page shows 2s celebration on first visit
- [ ] Review page defaults to read-only preview with "Edit Content" FAB
- [ ] Edit mode activates on demand, preserves all current editor functionality
- [ ] Empty dashboard shows compelling CTA when zero sites
- [ ] All changes work on mobile and desktop
- [ ] No performance regressions (Lighthouse check)

## Milestone M25 Completion Criteria

After Sprint 50, the M25 milestone is complete when:
- [ ] Onboarding reduced from 13 to 8 steps
- [ ] All form inputs use standardized shadcn components
- [ ] Color tokens consolidated to single source of truth
- [ ] ArchiePanel shows contextual tips (not empty sparkle)
- [ ] Page transitions animate between steps
- [ ] Auth page showcases generated sites
- [ ] Review page has celebration + read-only preview mode
- [ ] Dashboard has empty state
- [ ] All existing tests pass or are updated
- [ ] Full E2E flow verified: register → 8 steps → generate → review → dashboard
