# TASK-497: Provisioning Messages in Archie's Workshop

**Story:** US-095
**Effort:** M
**Milestone:** M20 — AI Transparency

## Description
Extend the emitMessage pattern to provisioning steps so Archie's Workshop stays active and engaging during the site launch phase.

## Technical Approach
- Add a "provisioning" phase to pipelineMessages in the provision/start flow
- Emit messages at each provisioning step (e.g., "Installing Drupal modules...", "Configuring your theme...", "Setting up your pages...")
- ActivityLog should render provisioning messages alongside completed content phases
- Add provisioning as a 5th phase in the ActivityLog phases array

## Acceptance Criteria
- [ ] Provisioning emits 3-8 messages visible in ActivityLog
- [ ] Messages are specific to what's being provisioned (not generic)
- [ ] ActivityLog renders provisioning phase with appropriate styling

## Dependencies
- TASK-496 (phase state persistence)

## Files
- Provisioning pipeline files (check `api/provision/start`)
- `platform-app/src/app/onboarding/progress/page.tsx`
- `platform-app/src/components/onboarding/ActivityLog.tsx`
