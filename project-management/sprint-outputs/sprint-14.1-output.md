# Sprint 14.1 Output: Stock Image Pipeline

**Milestone:** M12 — Visual Content Enrichment
**Date:** 2026-03-19
**Status:** Complete

## Tasks Delivered

| ID | Task | Status | Key Files |
|----|------|--------|-----------|
| TASK-280a | Stock Image Service (Pexels API) | Done | `src/lib/images/stock-image-service.ts` |
| TASK-280b | Image Downloader | Done | `src/lib/images/image-downloader.ts` |
| TASK-280c | Image Intent Extraction | Done | `src/lib/images/image-intent.ts` |
| TASK-280d | Enhance Pipeline Phase | Done | `src/lib/pipeline/phases/enhance.ts` |
| TASK-280e | Validator + Tree Image Support | Done | `src/lib/blueprint/component-validator.ts` (updated) |
| TASK-280f | Provisioning Image Copy | Done | `provisioning/src/steps/08.5-copy-stock-images.ts` |

## New Files Created

- `platform-app/src/lib/images/stock-image-service.ts` — Pexels API client with in-memory caching, rate limit handling, and abort timeout
- `platform-app/src/lib/images/image-downloader.ts` — Downloads images to `public/uploads/stock/{siteId}/`, hash-based filenames
- `platform-app/src/lib/images/image-intent.ts` — Maps 30+ Space DS components to image search intents with size/orientation metadata
- `platform-app/src/lib/pipeline/phases/enhance.ts` — New pipeline phase: extracts intents → searches → downloads → injects into blueprint
- `provisioning/src/steps/08.5-copy-stock-images.ts` — Copies stock images to Drupal `sites/{domain}/files/stock/` and rewrites paths
- `platform-app/tests/sprint-14.1-unit.test.ts` — 16 unit tests

## Files Modified

- `platform-app/src/lib/pipeline/orchestrator.ts` — Added enhance phase after generate (non-fatal: failures don't block pipeline)
- `platform-app/src/lib/blueprint/component-validator.ts` — Added image object validation (passes through objects with valid `src`)
- `platform-app/src/components/onboarding/PipelineProgress.tsx` — Added "Enhance" phase card
- `platform-app/src/app/onboarding/progress/page.tsx` — Added enhance to pipeline data model
- `platform-app/src/app/api/provision/status/route.ts` — Added enhance phase progress mapping and status builder
- `provisioning/src/provision.ts` — Added "Copy stock images" provisioning step (between import-blueprint and apply-brand)
- `platform-app/tests/sprint-14-qa.test.ts` — Updated assertion from `JSON.parse(sanitized)` to `safeParsePropsJson`

## Architecture

### Pipeline Flow (updated)
```
Research → Plan → Generate → Enhance (NEW) → Blueprint Ready
                                  │
                         For each image slot:
                         1. Extract intent from section content
                         2. Search Pexels API
                         3. Download to local storage
                         4. Inject Canvas image object into props
                         5. Rebuild component tree
```

### Canvas Image Object Format
```json
{
  "src": "/uploads/stock/{siteId}/{hash}.jpg",
  "alt": "Professional dental office reception area",
  "width": 1920,
  "height": 1080
}
```

### Image Slot Coverage (30+ components)
- Hero banners (10 variants): `background_image` or `image_1`, landscape 1920x1080 / 1200x800
- Text-media sections (5 variants): `image_1`, landscape 800x600
- Cards (featured, image, quicklink, testimony): `image`, landscape/square 600x400 / 400x400
- CTA banners (2 variants): `image`, landscape 800x600
- People cards (6 variants): `image`, square 400x400
- Accordions with images (2 variants): `image`, landscape 600x400

### Error Resilience
- Enhance phase failures are **non-fatal** — pipeline continues to review status
- Individual image fetch failures skip that slot (section renders without image)
- Pexels API 429 responses cached as null (no retry flood)
- 10s timeout on API requests, 15s on downloads

## Test Results

| Suite | Tests | Passed | Failed |
|-------|-------|--------|--------|
| Sprint 14.1 | 16 | 16 | 0 |
| Sprint 14 QA | 44 | 44 | 0 |
| Sprint 14 Unit | 44 | 44 | 0 |
| Sprint 13 QA | 44 | 44 | 0 |
| Sprint 13 Unit | 36 | 36 | 0 |
| Sprint 12 | 8 | 8 | 0 |
| Sprint 11 | 14 | 14 | 0 |
| Sprint 10 | 18 | 18 | 0 |
| **Total** | **224** | **224** | **0** |

TypeScript: **PASS** (0 errors, excluding pre-existing vitest type declarations)

## Configuration Required

- `PEXELS_API_KEY` environment variable must be set for image fetching to work
- Without the key, enhance phase skips silently (all sections render without images)
