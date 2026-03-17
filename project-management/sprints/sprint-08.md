# Sprint 08: Subscription & Polish

**Milestone:** M5 (completion) + P2 enhancements
**Duration:** 2 weeks (~10 dev days)

## Sprint Goal
Integrate Stripe for subscription billing and implement P2 enhancements (component swap, media management, custom domains) to round out the MVP.

## Tasks
| ID | Task | Story | Assignee Persona | Effort | Status |
|----|------|-------|-------------------|--------|--------|
| TASK-031 | Subscription integration (Stripe) | US-004 | /dev | XL | Not Started |
| TASK-024 | Component swap | US-024 | /dev | L | Not Started |
| TASK-025 | Media management configuration | US-025 | /dev | M | Not Started |
| TASK-033 | Custom domain support | US-031 | /dev | L | Not Started |

## Task Sequence
```
TASK-031 (deps: 005, 029 from prior sprints) — critical path
TASK-024 (deps: 021, 015 from prior sprints) — parallel
TASK-025 (deps: 021 from Sprint 06) — parallel
TASK-033 (deps: 029, 032 from Sprint 07) — parallel
```

**Parallelization:** All tasks are independent — can be developed in parallel or prioritized. TASK-031 (Stripe) is the most important.

## Dependencies & Risks
- **Depends on:** Sprint 07 (publish service, trial management, SSL)
- **Risk:** Stripe integration complexity — webhook handling, edge cases (payment failures, card declines)
- **Risk:** Custom domain SSL provisioning requires server-level tooling
- **Note:** P2 tasks (024, 025, 033) can be cut if sprint capacity is tight — MVP functions without them

## Definition of Done
- [ ] User can subscribe via Stripe Checkout
- [ ] Successful payment activates subscription and re-publishes expired site
- [ ] Webhooks handle payment success, failure, and cancellation
- [ ] Component swap shows compatible alternatives and maps content
- [ ] Media library accessible from Canvas for image management
- [ ] Custom domain connection with DNS verification works
- [ ] Playwright: subscription flow, component swap, media upload
- [ ] All code committed

## Sprint Deliverable
Full MVP with monetization. Users can subscribe to keep sites live. P2 enhancements polish the editing and publishing experience. **Product ready for early access / investor presentation.**
