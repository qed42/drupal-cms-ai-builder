# Sprint 08: Subscription & Domains (Go-Live)

**Milestone:** M6 — Subscription & Go-Live
**Duration:** 2 weeks (~10 dev days)
**Architecture:** v2 (Split Platform)

## Sprint Goal
Integrate Stripe for paid subscriptions, handle trial expiry, provision SSL certificates, and support custom domains — completing the monetization and go-live infrastructure.

## Tasks
| ID | Task | Story | Workstream | Effort | Status |
|----|------|-------|------------|--------|--------|
| TASK-120 | Stripe Subscription Integration | US-003, US-004 | Next.js | L | Not Started |
| TASK-030 | Trial Expiry Cron & Notifications | US-004 | Next.js + Drupal | M | Not Started |
| TASK-032 | SSL Provisioning | Foundation | DevOps | M | Not Started |
| TASK-033 | Custom Domain Support | US-030 | Next.js + DevOps | L | Not Started |

## Execution Order

```
Phase 1 — Parallel (Days 1-5):
├── TASK-120: Stripe subscription integration
│   └── Stripe Checkout for trial-to-paid conversion
│   └── Stripe Customer Portal for subscription management
│   └── Webhook handlers for subscription lifecycle events
└── TASK-032: SSL provisioning
    └── Let's Encrypt cert automation for *.drupalcms.app
    └── Cert issuance on site provision

Phase 2 — Sequential (Days 6-10):
├── TASK-030: Trial expiry cron & notifications
│   └── Depends on: TASK-120 (Stripe subscription status needed)
│   └── Expiry warnings at 3 days and 1 day before
│   └── Expired trials suspend site access
└── TASK-033: Custom domain support
    └── Depends on: TASK-032 (SSL must work for custom certs)
    └── Domain mapping in platform + Drupal sites.php
    └── DNS verification flow
```

## Dependencies & Risks
- **Sprint 07 must be complete:** Publishing flow working end-to-end
- **TASK-030 depends on TASK-120:** Trial expiry logic needs Stripe subscription status to determine active vs. expired
- **TASK-033 depends on TASK-032:** Custom domains need SSL provisioning infrastructure
- **Risk:** Stripe webhook reliability — use webhook signature validation, handle idempotency
- **Risk:** Let's Encrypt rate limits — implement cert caching and renewal cron
- **Risk:** DNS propagation delays for custom domains — implement async verification with polling

## Deliverable
Users can convert from trial to paid via Stripe. Expired trials are suspended with notifications. All sites have SSL. Users can map custom domains to their sites. Platform is ready for commercial launch.

## Definition of Done
- [ ] Stripe Checkout flow for trial-to-paid conversion
- [ ] Stripe Customer Portal for subscription management
- [ ] Webhook handles all subscription lifecycle events
- [ ] Trial expiry warnings at 3 days and 1 day before
- [ ] Expired trials suspend site access
- [ ] SSL certificates provisioned for all sites
- [ ] Custom domain mapping works end-to-end
- [ ] DNS verification flow for custom domains
- [ ] Playwright tests for subscription and domain flows
- [ ] Code committed
