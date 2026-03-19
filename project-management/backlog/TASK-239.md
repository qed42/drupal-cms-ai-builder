# TASK-239: Download Menu

**Story:** US-053
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M8 — Content Review & Editing

## Description
Add download options to the review page: blueprint JSON download (existing feature) and markdown ZIP archive of all page content.

## Technical Approach
- Create `platform-app/src/app/onboarding/review/components/DownloadMenu.tsx`
- JSON download: reuse existing blueprint download logic from `platform-app/src/lib/download.ts`
- Markdown download:
  - Install `jszip` package
  - Use `blueprintPageToMarkdown()` for each page
  - Bundle into a ZIP with one `.md` file per page
  - Trigger browser download
- PDF summary: defer to future sprint (lower value vs. effort)

## Acceptance Criteria
- [ ] "Download" dropdown menu on review page
- [ ] "Download as JSON" downloads the blueprint JSON
- [ ] "Download as Markdown" downloads a ZIP with one .md per page
- [ ] Downloads work client-side (no server round-trip needed)

## Dependencies
- TASK-230 (Blueprint-to-Markdown Renderer)
- TASK-231 (Review Page Layout)

## Files/Modules Affected
- `platform-app/src/app/onboarding/review/components/DownloadMenu.tsx` (new)
- `platform-app/package.json` (add jszip)
