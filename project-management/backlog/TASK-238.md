# TASK-238: Approve & Provision Flow

**Story:** US-052
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M8 — Content Review & Editing

## Description
Implement the "Approve & Build Site" button with page view tracking. Button is disabled until all pages have been viewed. On click, triggers provisioning with the reviewed/edited blueprint.

## Technical Approach
- Create `platform-app/src/app/onboarding/review/hooks/usePageTracking.ts`
  - Track which pages the user has viewed (scrolled to or clicked in sidebar)
  - Store viewed page indices in component state
- Create `platform-app/src/app/onboarding/review/components/ApproveButton.tsx`
  - Disabled until all pages viewed (show "Review X more pages" hint)
  - On click: call existing `POST /api/provision/start` to trigger provisioning
  - Update site status from "review" to "provisioning"
  - Redirect to enhanced provisioning progress page
- Optional: "Skip Review" link ("I'll review later in Drupal Canvas") that provisions immediately

## Acceptance Criteria
- [ ] "Approve & Build Site" button disabled until all pages viewed
- [ ] Hint text shows how many pages remain
- [ ] On approve: provisioning starts with the reviewed blueprint
- [ ] Site status transitions from "review" to "provisioning"
- [ ] User redirected to provisioning progress page
- [ ] Optional "Skip Review" link available (per OQ-4 recommendation)

## Dependencies
- TASK-231 (Review Page Layout)

## Files/Modules Affected
- `platform-app/src/app/onboarding/review/components/ApproveButton.tsx` (new)
- `platform-app/src/app/onboarding/review/hooks/usePageTracking.ts` (new)
- `platform-app/src/app/api/provision/start/route.ts` (modify — accept from review state)
