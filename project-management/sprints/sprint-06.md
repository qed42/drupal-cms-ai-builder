# Sprint 06: AI Regeneration & Subscription

**Milestone:** M4 + M5 — Site Editing & Subscription
**Duration:** 2 weeks (~10 dev days)
**Architecture:** v2 (Split Platform)

## Sprint Goal
Add section-level AI regeneration within Canvas editor and integrate Stripe for subscription management (trial-to-paid conversion, expiry handling).

## Tasks
| ID | Task | Story | Workstream | Status |
|----|------|-------|------------|--------|
| TASK-119 | Section-Level AI Regeneration | US-021 | Drupal | Not Started |
| TASK-120 | Stripe Subscription Integration | US-003, US-004 | Next.js | Not Started |

## Dependencies & Risks
- **TASK-119 depends on TASK-118:** Canvas editor must be configured
- **TASK-120 depends on TASK-117:** Dashboard must exist for subscription UI
- **Parallel:** Both tasks are independent of each other — can be developed simultaneously
- **Risk:** Canvas section toolbar extensibility — need to verify Canvas supports custom toolbar actions
- **Risk:** Stripe webhook reliability — use webhook signature validation, handle idempotency

## Deliverable
Site owners can regenerate page sections with AI guidance in Canvas. Users can convert from trial to paid subscription via Stripe. Trial expiry handling with notifications.

## Definition of Done
- [ ] "Regenerate with AI" button appears on Canvas section toolbar
- [ ] AI regeneration updates section content while preserving layout
- [ ] User guidance text influences regeneration output
- [ ] Stripe Checkout flow for trial-to-paid conversion
- [ ] Stripe Customer Portal for subscription management
- [ ] Trial expiry warnings at 3 days and 1 day before
- [ ] Expired trials suspend site access
- [ ] Webhook handles all subscription lifecycle events
- [ ] Playwright tests for regeneration flow
- [ ] Code committed
