# TASK-388: Create image resolver service for per-page section image resolution

**Story:** Infrastructure — Image Pipeline Refactoring
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M19 — Design System Abstraction

## Description

Create a new `resolveImagesForSections()` function that operates on a single page's sections array. It fetches Pexels images and injects them directly into section props (and child props) before component trees are built. This reuses all existing image infrastructure (`searchStockImage`, `downloadStockImage`, `buildSearchQuery`) without duplicating logic.

## Technical Approach

1. **Create `platform-app/src/lib/images/image-resolver.ts`** with a single exported function:
   ```typescript
   export async function resolveImagesForSections(
     siteId: string,
     sections: PageSection[],
     pageTitle: string,
     industry: string,
     audience: string
   ): Promise<{ imagesAdded: number; imagesFailed: number }>
   ```

2. **Implementation logic:**
   - Get design system adapter via `getDefaultAdapter()`
   - For each section, call `adapter.getImageMapping(section.component_id)`
   - For each mapped image prop, skip if already populated (non-null, has `src`)
   - Call `buildSearchQuery()` (exported from TASK-387) to build Pexels query
   - Call `searchStockImage()` → `downloadStockImage()` (existing functions)
   - On success: set `section.props[propName] = { src: downloaded.localPath, alt, width, height }`
   - On failure: leave prop empty — tree-builder placeholder fills it as fallback
   - **Also iterate `section.children[]`** with same flow for child components
   - Process sequentially (respects Pexels 200 req/min rate limit)

3. **Canvas image object format:**
   ```typescript
   { src: string, alt: string, width: number, height: number }
   ```

4. **Error handling:** All failures are non-fatal. Log warnings, increment `imagesFailed` counter, continue processing remaining sections.

## Acceptance Criteria

- [ ] `resolveImagesForSections()` populates image props for top-level sections
- [ ] `resolveImagesForSections()` populates image props for children in composed sections
- [ ] Skips sections/children that already have image props populated
- [ ] Uses existing `searchStockImage()` and `downloadStockImage()` — no new API clients
- [ ] Returns `{ imagesAdded, imagesFailed }` counts
- [ ] Graceful degradation — Pexels failures don't throw, section renders with placeholder
- [ ] TypeScript compiles cleanly
- [ ] Unit test with mocked Pexels/download verifies props mutation

## Dependencies

- TASK-387 (exports `buildSearchQuery()` and `getComponentTypeHint()`)

## Files/Modules Affected

- `platform-app/src/lib/images/image-resolver.ts` (new file)
