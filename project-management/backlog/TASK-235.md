# TASK-235: Page Add/Remove from Review

**Story:** US-050
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M8 — Content Review & Editing

## Description
Allow users to add new pages (AI-generated from title + description) or remove existing pages from the review interface.

## Technical Approach
- Create `POST /api/blueprint/{id}/add-page` API:
  - Accept: `{ title, description }`
  - Generate page using research brief + content plan + user description
  - Append to blueprint pages array
  - Enforce max 15 pages limit
- Create `DELETE /api/blueprint/{id}/remove-page` API:
  - Accept: `{ pageIndex }`
  - Remove from blueprint pages array (with confirmation)
- UI: "Add Page" button in sidebar + "Remove Page" option per page
- Add page form: title input + description textarea

## Acceptance Criteria
- [ ] "Add Page" button in sidebar opens a form
- [ ] New pages generated with AI using existing brief/plan context
- [ ] Max 15 pages enforced
- [ ] "Remove Page" asks for confirmation before removing
- [ ] Page list updates immediately after add/remove

## Dependencies
- TASK-231 (Review Page Layout)
- TASK-217 (Per-Page Content Generation — reuses generation logic)

## Files/Modules Affected
- `platform-app/src/app/api/blueprint/[id]/add-page/route.ts` (new)
- `platform-app/src/app/api/blueprint/[id]/remove-page/route.ts` (new)
- `platform-app/src/app/onboarding/review/components/PageSidebar.tsx` (modify)
