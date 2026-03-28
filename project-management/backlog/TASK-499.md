# TASK-499: Fix Progress Page "Ready" Messaging

**Story:** US-097
**Effort:** S
**Milestone:** M20 — AI Transparency

## Description
The progress page shows "Your site is ready!" after content generation completes, but the site isn't actually ready — it still needs review. Fix messaging to set accurate expectations.

## Technical Approach
- Change `getHeading()` in progress page:
  - When `done && siteStatus === "review"`: "Your content is ready for review"
  - When `done && siteStatus === "live"`: "{siteName} is live!"
  - Keep "Building..." for in-progress
- Change `getSubheading()` to match: "Review your pages, make any edits, then launch."
- The "is ready!" message should only appear when `siteStatus === "live"`

## Acceptance Criteria
- [ ] After generation completes: heading says "ready for review", not "is ready"
- [ ] After provisioning completes (live): heading says "is live!"
- [ ] Subheading accurately describes the next action at each stage

## Files
- `platform-app/src/app/onboarding/progress/page.tsx`
