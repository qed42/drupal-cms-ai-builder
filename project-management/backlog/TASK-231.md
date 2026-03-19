# TASK-231: Review Page Layout

**Story:** US-046
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M8 — Content Review & Editing

## Description
Create the content review page with a collapsible sidebar navigation (page list) and main content area (page preview). Renders all generated pages as formatted markdown.

## Technical Approach
- Create route: `platform-app/src/app/onboarding/review/page.tsx`
- Server component: load blueprint from DB by siteId (from query param)
- Client components:
  - `PageSidebar.tsx` — list of page titles, click to navigate, indicates viewed/unviewed
  - `PagePreview.tsx` — renders one page's content using the markdown renderer
  - Collapsible sections per page with: title, meta description, component-labeled sections
- Content is read-only by default (edit mode toggled per section)
- Load within 2 seconds (NFR-05)
- Add route to onboarding flow navigation

## Acceptance Criteria
- [ ] Review page loads and displays all blueprint pages
- [ ] Sidebar lists all pages with click-to-navigate
- [ ] Each page renders as formatted content with component labels
- [ ] Content is full-length (not truncated)
- [ ] Page loads within 2 seconds
- [ ] Route added to middleware (auth-protected)

## Dependencies
- TASK-230 (Blueprint-to-Markdown Renderer)
- TASK-218 (Pipeline Orchestrator — generates the blueprint)

## Files/Modules Affected
- `platform-app/src/app/onboarding/review/page.tsx` (new)
- `platform-app/src/app/onboarding/review/components/PageSidebar.tsx` (new)
- `platform-app/src/app/onboarding/review/components/PagePreview.tsx` (new)
- `platform-app/src/middleware.ts` (add /onboarding/review to protected routes)
