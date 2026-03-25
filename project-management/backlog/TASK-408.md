# TASK-408: Enrich PipelineProgress with rich summaries and per-page progress

**Story:** US-067
**Priority:** P2
**Estimated Effort:** M
**Milestone:** M20 — AI Transparency

## Description
Update the PipelineProgress component to render enriched phase summaries (from the status API) and show per-page progress during the Generate phase.

## Technical Approach
1. Read `platform-app/src/components/onboarding/PipelineProgress.tsx`
2. Update phase card rendering:
   - Complete phases: show the full summary text (currently truncated/generic)
   - In-progress Generate phase: show "Writing {pageName} page ({index}/{total})" from `currentPage` and `pageProgress` fields
   - Add target keyword display during Generate: "Targeting '{keyword}'"
3. Update the status polling consumer (progress page) to pass new fields
4. Add `React.memo` with custom comparator to PhaseCard to avoid re-renders when only `durationMs` changes during polling

## Acceptance Criteria
- [ ] Research phase summary shows business-specific text (industry, pain points, compliance)
- [ ] Plan phase summary shows page count and any proactively-added pages
- [ ] Generate phase shows per-page progress with page name and count
- [ ] Completed phase summaries persist and remain visible
- [ ] Error states show actionable context (e.g., "Content for About page didn't meet quality bar")
- [ ] No visible flickering during 2s polling intervals

## Dependencies
- TASK-405 (summary template functions — used by status API)
- Status API enrichment (TASK-407)

## Files Affected
- `platform-app/src/components/onboarding/PipelineProgress.tsx`
- `platform-app/src/app/onboarding/progress/page.tsx` (pass new fields)
