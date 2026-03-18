# TASK-120: Stripe Subscription Integration

**Story:** US-004 (Subscription Activation), US-003 (Trial Expiry)
**Priority:** P1
**Estimated Effort:** L
**Milestone:** M5 — Subscription & Polish

## Description
Integrate Stripe for subscription management. Handle trial-to-paid conversion, subscription lifecycle, and site suspension on non-payment.

## Technical Approach
- Install Stripe SDK (`stripe` npm package)
- **Stripe setup:**
  - Create product + price in Stripe dashboard
  - Configure Customer Portal for self-service subscription management

- **API Route: `/api/webhooks/stripe`**
  - Validates Stripe webhook signature
  - Handles events:
    - `customer.subscription.created` — update subscription record
    - `customer.subscription.updated` — update status
    - `customer.subscription.deleted` — mark expired, trigger site suspension
    - `invoice.payment_succeeded` — extend subscription
    - `invoice.payment_failed` — notify user, grace period

- **API Route: `/api/subscription/create-checkout`**
  - Creates Stripe Checkout Session for trial-to-paid conversion
  - Redirects to Stripe Checkout

- **API Route: `/api/subscription/portal`**
  - Creates Stripe Customer Portal session
  - Redirects to Stripe Portal for self-service management

- **Trial expiry handling:**
  - Cron job (Next.js API route or separate script) runs daily
  - Checks subscriptions where `trial_ends_at < now` and `status = "trial"`
  - Sends expiry warning emails at 3 days and 1 day before
  - On expiry: update status to "expired", trigger site suspension
  - Site suspension: update sites.status, optionally disable the Drupal site

## Acceptance Criteria
- [ ] User can upgrade from trial to paid via Stripe Checkout
- [ ] Webhook correctly handles subscription lifecycle events
- [ ] Trial expiry warnings sent at 3 days and 1 day before
- [ ] Expired trial marks site as suspended
- [ ] User can manage subscription via Stripe Customer Portal
- [ ] Webhook signature validation prevents tampering

## Dependencies
- TASK-117 (Dashboard — subscription UI)

## Files/Modules Affected
- `platform-app/src/app/api/webhooks/stripe/route.ts`
- `platform-app/src/app/api/subscription/create-checkout/route.ts`
- `platform-app/src/app/api/subscription/portal/route.ts`
- `platform-app/src/lib/stripe.ts`
- `platform-app/src/lib/cron/trial-expiry.ts`
