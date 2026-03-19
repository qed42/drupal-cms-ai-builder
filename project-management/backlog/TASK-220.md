# TASK-220: Pipeline Phase Visibility UI

**Story:** US-042
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M7 — AI Content Pipeline

## Description
Replace the current single-spinner progress page with a step-by-step UI showing Research, Plan, and Generate phases with real-time status, timing, and expandable summaries.

## Technical Approach
- Create new component: `platform-app/src/components/onboarding/PipelineProgress.tsx`
- Three-phase display: Research → Plan → Generate, each with:
  - Status indicator (pending/spinner/checkmark/error)
  - Elapsed time display
  - Expandable summary section
- Research summary: bullet points from research brief
- Plan summary: collapsible per-page outline
- Generate: per-page progress ("Generating Home page... ✓", "Generating Services page... ⏳")
- Poll `/api/provision/status` every 2 seconds during generation
- On all phases complete: redirect to `/onboarding/review`
- Replace usage in `platform-app/src/app/onboarding/progress/page.tsx`

## Acceptance Criteria
- [ ] Progress page shows 3 phases with individual status indicators
- [ ] Real-time updates via polling
- [ ] Expandable summaries for completed phases
- [ ] Per-page progress during Generate phase
- [ ] Redirects to review page when generation completes
- [ ] ARIA live regions for screen reader accessibility (NFR-18)

## Dependencies
- TASK-219 (Pipeline Phase Status API)

## Files/Modules Affected
- `platform-app/src/components/onboarding/PipelineProgress.tsx` (new)
- `platform-app/src/app/onboarding/progress/page.tsx` (modify)
