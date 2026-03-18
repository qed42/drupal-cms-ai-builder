# TASK-117: Platform Dashboard

**Story:** Foundation (no direct user story — platform feature)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M4 — Site Editing

## Description
Build the Next.js dashboard that shows the user's site status and provides access to edit their Drupal site. For MVP: site status card, "Edit Site" button (auto-login), and subscription status.

## Technical Approach
- **Dashboard page (`/dashboard`):**
  - Protected route (requires auth)
  - Fetches site record from Platform DB
  - Shows site card with:
    - Site name
    - Domain/URL
    - Status badge (onboarding | provisioning | live | suspended | expired)
    - "Edit Site" button (only when status = "live")
    - Subscription status (trial, days remaining, or active)
  - "Edit Site" triggers auto-login flow (TASK-116)
  - If status = "onboarding", show "Continue Setup" button → resume wizard
  - If status = "provisioning", show progress/spinner

- **Subscription section:**
  - Shows current plan (trial/basic/pro)
  - Trial countdown (days remaining)
  - "Manage Subscription" button (links to Stripe Customer Portal — TASK-120)

## Acceptance Criteria
- [ ] Dashboard shows site name, domain, and status
- [ ] "Edit Site" button triggers auto-login to Drupal Canvas
- [ ] "Continue Setup" shows when onboarding is incomplete
- [ ] Subscription status displays correctly
- [ ] Trial countdown shows remaining days
- [ ] Unauthenticated users redirected to login

## Dependencies
- TASK-101 (Auth)
- TASK-116 (Auto-login — for "Edit Site" flow)

## Files/Modules Affected
- `platform-app/src/app/dashboard/page.tsx`
- `platform-app/src/app/dashboard/layout.tsx`
- `platform-app/src/components/dashboard/SiteCard.tsx`
- `platform-app/src/components/dashboard/SubscriptionStatus.tsx`
