# TASK-232: Inline Section Editor

**Story:** US-047
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M8 — Content Review & Editing

## Description
Add inline editing capability to each section in the review page. Users click "Edit" to switch a section from read-only to an editable textarea. Changes auto-save with debounce.

## Technical Approach
- Create `platform-app/src/app/onboarding/review/components/SectionEditor.tsx`
- Toggle between read-only markdown view and edit mode (textarea)
- In edit mode: textarea pre-filled with current section text content
- Editable fields: title, description, body text, list items
- Create `useAutoSave` hook: debounced PATCH to `/api/blueprint/{id}/edit`
- Create `PATCH /api/blueprint/{id}/edit` API endpoint:
  - Accept: `{ pageIndex, sectionIndex, field, value }` or `{ pageIndex, sectionIndex, props: {...} }`
  - Update blueprint payload in DB
  - Verify user owns the site and site is in "review" status

## Acceptance Criteria
- [ ] "Edit" button on each section switches to textarea mode
- [ ] "Done" button returns to read-only mode
- [ ] Changes auto-save with 500ms debounce
- [ ] Edit API validates ownership and review status
- [ ] Multiple sections can be edited independently
- [ ] Plain textarea editing (not rich editor per ADR-005)

## Dependencies
- TASK-231 (Review Page Layout)

## Files/Modules Affected
- `platform-app/src/app/onboarding/review/components/SectionEditor.tsx` (new)
- `platform-app/src/app/onboarding/review/hooks/useAutoSave.ts` (new)
- `platform-app/src/app/api/blueprint/[id]/edit/route.ts` (new)
