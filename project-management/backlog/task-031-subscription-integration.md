# TASK-031: Subscription Integration (Stripe)

**Story:** US-004
**Priority:** P1
**Estimated Effort:** XL
**Milestone:** M5 — Publishing & Subscription

## Description
Integrate Stripe for subscription billing: checkout, webhook handling, subscription lifecycle.

## Technical Approach
- Evaluate Drupal Commerce vs. custom Stripe integration:
  - **Recommendation:** Custom lightweight integration for MVP (Commerce is heavy for single-product subscription)
- Create `SubscriptionService`:
  - `createCheckoutSession(SiteProfile)`: creates Stripe Checkout session for subscription
  - `handleWebhook(Request)`: processes Stripe webhook events
  - `getStatus(SiteProfile)`: returns current subscription status
- Stripe webhook handler at `/subscription/webhook`:
  - `checkout.session.completed` → activate subscription, update SiteProfile
  - `invoice.paid` → confirm renewal
  - `invoice.payment_failed` → notify user, grace period
  - `customer.subscription.deleted` → expire site
- Subscribe page: `/subscribe` — shows pricing, redirects to Stripe Checkout
- Store Stripe subscription_id and customer_id on SiteProfile
- API keys stored via Key module

## Acceptance Criteria
- [ ] User can navigate to subscribe page from trial expiry prompt
- [ ] Stripe Checkout session created correctly
- [ ] Successful payment activates subscription and re-publishes site
- [ ] Webhook handles payment success, failure, and cancellation
- [ ] Subscription status reflected on SiteProfile
- [ ] API keys securely stored (not in code)

## Dependencies
- TASK-005 (Trial Manager)
- TASK-029 (Publish Service — for re-publishing on subscription)

## Files/Modules Affected
- `ai_site_builder_trial/src/Service/SubscriptionService.php`
- `ai_site_builder_trial/src/Service/SubscriptionServiceInterface.php`
- `ai_site_builder_trial/src/Controller/SubscriptionController.php`
- `ai_site_builder_trial/ai_site_builder_trial.routing.yml`
- `composer.json` (add stripe/stripe-php)
