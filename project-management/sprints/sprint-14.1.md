# Sprint 14.1: Stock Image Pipeline

**Milestone:** M12 — Visual Content Enrichment
**Duration:** 1 week

## Sprint Goal
Generated websites include contextually relevant stock images in all image-capable components, transforming text-only wireframes into visually complete sites.

## Tasks

### Phase 1: Infrastructure (Days 1-2)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-280a | Stock Image Service — Pexels API client with caching & rate limiting | US-061 | M | Done |
| TASK-280b | Image Downloader — Download, resize & store to local uploads | US-061 | M | Done |

### Phase 2: Pipeline Integration (Days 3-4)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-280c | Image Intent Extraction — Derive search queries from section content + business context | US-061 | L | Done |
| TASK-280d | Enhance Phase — New pipeline phase orchestrating intent→search→download→inject | US-061 | L | Done |

### Phase 3: Validation & Polish (Day 5)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-280e | Component Tree & Validator Updates — Image object support in tree builder and validator | US-061 | M | Done |
| TASK-280f | Provisioning Image Copy — New step to copy stock images into Drupal public:// during provisioning | US-061 | M | Done |

## Dependencies & Risks

### Dependency Chain
```
TASK-280a (API client) → no dependencies, start immediately
TASK-280b (downloader) → no dependencies, parallel with 280a
TASK-280c (intent extraction) → no dependencies, parallel with 280a/b
TASK-280d (enhance phase) → depends on 280a, 280b, 280c
TASK-280e (validator/tree) → depends on 280d
TASK-280f (provisioning copy) → depends on 280b, can parallel with 280d/e
```

### Risks
- **Pexels API rate limit (200 req/hr):** A 5-page site needs ~15-20 images. Safe for single-user generation, but concurrent users could hit limits. Mitigation: implement request queue with backoff
- **Image relevance quality:** Search queries derived from section content may return irrelevant results for niche industries. Mitigation: fall back to industry-level queries if section-specific search returns low-quality results
- **Canvas image schema mismatch:** The `json-schema-definitions://canvas.module/image` schema is confirmed as `{ src, alt, width, height }`, but edge cases (SVG components, logo grids) may need special handling
- **Pipeline timing:** Enhance phase adds ~10-15s. Total generation time increases from ~45s to ~60s. Must update progress UI labels
- **Provisioning path rewriting:** Images stored as `/uploads/stock/{siteId}/` must be rewritten to `/sites/default/files/stock/` during provisioning. Off-by-one path errors could break all images

### Prerequisites
- Sprint 14 complete (component validator — done)
- `PEXELS_API_KEY` environment variable configured in `.env` and Docker Compose
- Sprint 15 preferred (brand identity informs image style/tone, but not strictly required)

## Image Slot Reference

| Component | Image Prop | Size | Orientation |
|-----------|-----------|------|-------------|
| `space-hero-banner-style-*` | `background_image` | 1920x1080 | landscape |
| `space-text-media-default` | `image` | 800x600 | landscape |
| `space-featured-card` | `image` | 600x400 | landscape |
| `space-imagecard` | `image` | 600x400 | landscape |
| `space-people-card-*` | `image` | 400x400 | square |
| `space-team-section-image-card-*` | `image` | 400x400 | square |
| `space-accordion-with-image-item` | `image` | 600x400 | landscape |

## Definition of Done

### Infrastructure
- [ ] Pexels API client returns search results with proper error handling
- [ ] API responses are cached (same query within a generation returns cached result)
- [ ] Rate limiting with exponential backoff implemented
- [ ] Image downloader saves to `/uploads/stock/{siteId}/` at correct resolution
- [ ] `PEXELS_API_KEY` documented and added to Docker env passthrough

### Pipeline
- [ ] Image intent extraction produces relevant search queries from section content
- [ ] Enhance phase runs after Generate, before blueprint save
- [ ] Progress UI shows "Enhancing with images..." during enhance phase
- [ ] Image objects injected into component tree match Canvas schema: `{ src, alt, width, height }`
- [ ] Component validator accepts image objects as valid props
- [ ] Image fetch failures never block generation — graceful fallback to null (imageless sections)

### Provisioning
- [ ] Stock images copied from platform-app to Drupal `public://stock/` during provisioning
- [ ] Blueprint `src` paths rewritten from `/uploads/stock/...` to `/sites/default/files/stock/...`
- [ ] Provisioned Drupal site renders images correctly

### Testing
- [ ] Unit tests: API client, downloader, intent extraction, tree injection, validator, fallback behavior
- [ ] Integration test: full pipeline generates blueprint with image props populated
- [ ] All existing tests continue to pass (no regressions)
- [ ] All code committed with passing tests
