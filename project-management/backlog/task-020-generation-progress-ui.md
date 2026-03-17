# TASK-020: Generation Progress UI

**Story:** US-019
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M2 — AI Site Generation Engine

## Description
Build the frontend progress screen that shows real-time generation status by polling the status endpoint.

## Technical Approach
- Create `generation-progress.html.twig` template
- Display step list with status indicators (pending, in_progress, completed, failed)
- Use Alpine.js to poll `/api/generation/{id}/status` every 3 seconds
- Animate step transitions (checkmark on complete, spinner on in_progress)
- Show progress percentage bar
- On all steps completed: auto-redirect to site preview
- On failure: show error message with "Retry" button (calls retry endpoint)
- Prevent navigation away with `beforeunload` confirmation
- Route: `/generate/progress/{site_profile_id}`

## Acceptance Criteria
- [ ] Progress screen renders with all 5 pipeline steps listed
- [ ] Steps update in real-time as generation progresses
- [ ] Completed steps show checkmark
- [ ] Current step shows spinner/animation
- [ ] Auto-redirect to preview on completion
- [ ] Error state shows retry option
- [ ] Navigation away shows confirmation dialog

## Dependencies
- TASK-016 (Generation Pipeline — provides the status endpoint)

## Files/Modules Affected
- `ai_site_builder/templates/generation-progress.html.twig`
- `ai_site_builder/src/Controller/OnboardingController.php` (progress page route)
- `ai_site_builder/ai_site_builder.routing.yml`
