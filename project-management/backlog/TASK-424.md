# TASK-424: Add per-page image deduplication to image resolver

**Story:** US-075
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M21 — Content Quality Hardening

## Description
The image resolver fetches from Pexels with `per_page=1` and caches results by query string. When multiple sections on the same page produce identical or similar search queries, they receive the same photo — causing visible duplicate images on the page.

## Root Cause
1. `stock-image-service.ts` requests `per_page=1` — always returns the same top result for a given query
2. Cache keyed by `query|orientation` — identical queries return the same cached photo
3. No tracking of which photo IDs have already been used on the current page
4. `buildSearchQuery()` in `image-intent.ts` produces identical queries for similar sections (e.g., two cards in a features grid)

## Technical Approach

### A. Stock Image Service — support returning multiple results
1. In `stock-image-service.ts`:
   - Change `searchStockImage()` to accept an `excludeIds?: string[]` parameter
   - Request `per_page=5` instead of `per_page=1` (still within Pexels limits, marginal cost)
   - Cache the full results array (not just the first photo) under the query key
   - Return the first photo whose ID is NOT in `excludeIds`
   - Add `photoId: string` to `StockImageResult` interface (needed for dedup tracking)

### B. Image Resolver — track used photos per page
2. In `image-resolver.ts`, `resolveImagesForSections()`:
   - Add a `usedPhotoIds: Set<string>` tracker at the top of the function
   - After each successful image fetch, add the photo ID to `usedPhotoIds`
   - Pass `Array.from(usedPhotoIds)` as `excludeIds` to `searchStockImage()`

### C. Image Intent / Enhance Phase — same treatment
3. In `enhance.ts`, apply the same per-page `usedPhotoIds` tracking when processing intents
4. Group intents by `pageIndex` and reset `usedPhotoIds` between pages

### D. Query diversity for children
5. In `image-intent.ts`, `buildSearchQuery()`:
   - When called for a child component, incorporate the child's own text props (e.g., card heading, description) instead of only the parent section's props
   - This naturally produces diverse queries for cards in a grid

## Acceptance Criteria
- [ ] No two sections on the same page receive the same Pexels photo ID
- [ ] Cards in a 3-column grid each get a distinct image
- [ ] Hero and CTA on the same page get different images even if queries are similar
- [ ] Cache still works for cross-page reuse (same image CAN appear on different pages)
- [ ] Rate limiting behavior unchanged — 429 still returns null gracefully
- [ ] Image count per page is unlimited — every image-capable component gets an attempt

## Files Affected
- `platform-app/src/lib/images/stock-image-service.ts` (per_page=5, excludeIds, photoId tracking)
- `platform-app/src/lib/images/image-resolver.ts` (usedPhotoIds per page)
- `platform-app/src/lib/images/image-intent.ts` (child-aware query building)
- `platform-app/src/lib/pipeline/phases/enhance.ts` (per-page dedup in enhance flow)
