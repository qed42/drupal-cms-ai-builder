# TASK-251: Step-Level Provisioning Progress UI

**Story:** US-054
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M9 — Provisioning Hardening

## Description
Update the provisioning progress page to show each of the 11 steps with individual status indicators, elapsed time, and accessible status announcements.

## Technical Approach
- Create `platform-app/src/components/onboarding/ProvisioningSteps.tsx`
- Render 11 steps as a vertical list with:
  - ✓ checkmark (complete, with elapsed time "42s")
  - ⏳ spinner (in progress)
  - ○ circle (pending)
  - ✗ error (failed, with error summary)
- Poll `/api/provision/status` every 3 seconds (existing pattern)
- Add ARIA live regions for screen reader status announcements (NFR-18)
- Integrate into the existing progress page (after pipeline phases complete)

## Acceptance Criteria
- [ ] All 11 steps displayed with individual status indicators
- [ ] Completed steps show elapsed time
- [ ] In-progress step shows spinner
- [ ] Failed step shows error summary
- [ ] ARIA live regions announce status changes
- [ ] Integrates with pipeline progress (shows after "Approve & Build")

## Dependencies
- TASK-250 (Provisioning Step Timing & Interim Callbacks)

## Files/Modules Affected
- `platform-app/src/components/onboarding/ProvisioningSteps.tsx` (new)
- `platform-app/src/app/onboarding/progress/page.tsx` (modify)
