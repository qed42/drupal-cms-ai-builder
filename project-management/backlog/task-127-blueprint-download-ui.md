# TASK-127: Blueprint Download UI

**Story:** N/A (Feature request — blueprint download for end users)
**Priority:** P2
**Estimated Effort:** S
**Milestone:** M5 — Platform Stabilization

## Description
Add a "Download Blueprint" button to the dashboard site card and the provisioning progress/completion page, allowing users to download their generated blueprint as a JSON file.

## Technical Approach

### 1. Dashboard SiteCard Enhancement
- Edit `platform-app/src/components/dashboard/SiteCard.tsx`
- Add a "Download Blueprint" button/link visible when `site.status` is one of: `blueprint_ready`, `provisioning`, `live`, `provisioning_failed` (i.e., any state where a blueprint exists)
- Button triggers a fetch to `GET /api/blueprint/{siteId}?download=true` and initiates browser download
- Use a small helper function that creates a temporary `<a>` link with `download` attribute from a Blob response, or simply use `window.open()` pointing to the download URL

### 2. Progress Page Enhancement
- Edit `platform-app/src/app/onboarding/progress/page.tsx`
- When blueprint generation is complete (generationStep === "ready") and provisioning is in progress or done, show a "Download Blueprint" link
- Same download mechanism as above

### 3. Download Helper
- Create a small client-side utility `platform-app/src/lib/download.ts` with:
  ```ts
  export function downloadBlueprint(siteId: string, siteName: string): void
  ```
- Uses `fetch()` to get the blob, then triggers download via temporary anchor element
- This avoids opening a new tab and gives better UX

### UI/UX Notes
- Use a secondary/outline button style — download is not the primary action
- Show a download icon (e.g., `↓` or an SVG icon)
- Button text: "Download Blueprint" or just "Blueprint JSON"
- Disable the button with a tooltip if the blueprint isn't ready yet

## Acceptance Criteria
- [ ] Dashboard site card shows "Download Blueprint" button for sites with a ready blueprint
- [ ] Progress page shows download link after blueprint generation completes
- [ ] Clicking download saves a `.json` file to the user's machine
- [ ] Button is not shown/disabled when blueprint is still generating
- [ ] Downloaded file contains the full blueprint payload
- [ ] Playwright test: click download button → verify network request to `/api/blueprint/{siteId}?download=true`

## Dependencies
- TASK-126 (Blueprint Retrieval API must exist first)

## Files/Modules Affected
- `platform-app/src/components/dashboard/SiteCard.tsx` (edit)
- `platform-app/src/app/onboarding/progress/page.tsx` (edit)
- `platform-app/src/lib/download.ts` (new)
