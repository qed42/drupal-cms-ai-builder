# TASK-234: Per-Page Regeneration

**Story:** US-049
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M8 — Content Review & Editing

## Description
Add a "Regenerate Page" button that regenerates all sections of a single page using the same research brief and content plan for consistency.

## Technical Approach
- Add "Regenerate Page" button to page header in review UI
- Create `POST /api/blueprint/{id}/regenerate-page` API:
  - Accept: `{ pageIndex, guidance? }`
  - Reuse per-page generation logic from TASK-217
  - Return new page + previous page for undo
- Client stores previous page version for undo

## Acceptance Criteria
- [ ] "Regenerate Page" button on each page header
- [ ] Regeneration produces a complete new page using existing brief/plan
- [ ] Other pages remain unchanged
- [ ] Previous page version preserved for undo

## Dependencies
- TASK-233 (Per-Section Regeneration — shares regeneration infrastructure)
- TASK-217 (Per-Page Content Generation — reuses generation logic)

## Files/Modules Affected
- `platform-app/src/app/api/blueprint/[id]/regenerate-page/route.ts` (new)
- `platform-app/src/app/onboarding/review/components/PagePreview.tsx` (modify)
