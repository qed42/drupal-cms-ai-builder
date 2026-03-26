# Sprint 38 Output: Content Quality Hardening

**Status:** COMPLETE
**Tasks:** 4/4 done (TASK-422, TASK-423, TASK-424, TASK-425)

## Deliverables

### TASK-422: Remove "Welcome" fallback (DONE)
**File:** `packages/ds-mercury/src/tree-builders.ts`
- Replaced `|| "Welcome"` with multi-prop fallback chain: `heading_text` → `title` → `heading` → `""`
- Logs warning when all prop names are empty — blank h1 is created (caught by review agent)
- No interface changes — zero impact on 6 callers or 3 adapter implementations

### TASK-423: Fix review agent heading detection + quality gate (DONE)
**File:** `platform-app/src/lib/pipeline/phases/review.ts`
- Added `extractHeroHeadingText()` helper that checks all prop variants (`title`, `heading`, `heading_text`) on both section and children
- Fixed `checkHeroHeading()` to work with Mercury's `heading_text` prop and child heading components
- Added `checkHeroHeadingQuality()` — error severity check that rejects generic headlines against 12 forbidden patterns (Welcome, Welcome to *, Home, About Us, etc.)
- Added `"design"` to the `ReviewCheck.dimension` union type

### TASK-424: Per-page image deduplication (DONE)
**Files:** `stock-image-service.ts`, `image-resolver.ts`, `image-intent.ts`, `enhance.ts`
- `StockImageResult` now includes `photoId` field
- `searchStockImage()` accepts `excludeIds` option, fetches `per_page=5`, caches full results array
- `image-resolver.ts` tracks `usedPhotoIds` per page — each fetch excludes already-used photos
- `enhance.ts` uses `usedPhotoIdsByPage` Map for per-page dedup across the enhance flow
- `buildSearchQuery()` accepts optional `child` param — uses child's own text props for diverse queries in card grids

### TASK-425: Design review checks (DONE)
**File:** `platform-app/src/lib/pipeline/phases/review.ts`
- `checkConsecutiveBackgrounds()` — flags consecutive sections with same background color (warning)
- `checkImageAlternation()` — flags non-alternating text-image layouts within 2 positions (warning)
- `checkPatternVariety()` — flags consecutive identical composition patterns (warning)
- All design checks are pure functions, no I/O — deterministic per ADR-010
- Design dimension included in quality score and log output

## Test Results
- TypeScript: 0 errors
- Package tests: 139/139 pass (5 test files)
- Review agent test updated: new checks count (17→21), fixture uses marketing-grade headline, new test cases for all 4 new checks

## Prompt Changes (pre-sprint, included for completeness)
- `plan.ts`: Hero Headline Quality section added before Content Guidelines
- `page-generation.ts`: Strict enforcement rules + Content Contextuality section
- `prompt-fragments.ts`: Inline headline quality rule on mercury:hero-billboard
- `page-design-rules.ts`: Hero Heading Content Rule in per-page hero style guidance
