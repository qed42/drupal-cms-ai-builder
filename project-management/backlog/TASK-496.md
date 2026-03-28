# TASK-496: Persist Phase Card Green State During Provisioning

**Story:** US-095
**Effort:** S
**Milestone:** M20 — AI Transparency

## Description
Ensure "Writing your content" and "Adding images" phase cards stay green/complete during the provisioning phase instead of resetting.

## Technical Approach
- In progress page, when `siteStatus === "provisioning"`, preserve the pipeline state from the last content-generation poll
- Don't reset `pipeline` state when transitioning to provisioning
- The status API already returns complete for finished phases — ensure the frontend doesn't overwrite with defaults

## Acceptance Criteria
- [ ] All 4 content pipeline phases stay green/complete during provisioning
- [ ] Phase cards don't flicker or reset when provisioning starts
- [ ] Retry after provisioning failure preserves content phase states

## Files
- `platform-app/src/app/onboarding/progress/page.tsx`
