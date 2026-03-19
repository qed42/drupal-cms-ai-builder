# TASK-280: Stock Image Pipeline — Fetch, Store & Inject into Component Tree

**Story:** New — US-061: As a site owner, I want my generated website to include relevant stock images so that the site looks professional and complete without me having to source images manually.
**Priority:** P1
**Effort:** XL
**Sprint:** 14.1

## Description

Generated websites currently have zero imagery — every hero, card, and team section is text-only because image props are filtered out during AI generation. This makes the output look like a wireframe. This task adds a stock image pipeline that fetches contextually relevant images and injects them into the component tree.

## Architecture

### New Pipeline Phase: "Enhance" (runs after Generate)

```
Generate Phase → Enhance Phase → Blueprint Ready
                      │
              ┌───────┴────────┐
              │ For each page: │
              │ 1. Extract image slots from sections │
              │ 2. Build search queries from context │
              │ 3. Fetch from stock API │
              │ 4. Download & store locally │
              │ 5. Inject into component tree │
              └────────────────┘
```

### Sub-tasks

#### A. Image Intent Extraction (`src/lib/ai/prompts/image-intent.ts`)
- After generation, analyze each section's component_id and props to identify image slots
- Components with image props (from manifest): hero banners, featured cards, image cards, team sections, text-media sections, accordions with images, people cards, logo grids
- Generate a search query per image slot using business context (industry, audience, tone) + section content
- Example: A dental practice hero → `"modern dental office reception professional"`

#### B. Stock Image Service (`src/lib/images/stock-image-service.ts`)
- API client for **Pexels API** (free, 200 req/hr, no attribution required for API use)
- Requires `PEXELS_API_KEY` environment variable
- Search endpoint: `GET https://api.pexels.com/v1/search?query={query}&per_page=1&orientation=landscape`
- Returns: `{ src: { large2x, large, medium, small }, alt, width, height }`
- Implement in-memory cache to avoid duplicate searches for similar queries within a generation
- Fallback: if API fails or rate-limited, leave image prop as null (component renders without image)

#### C. Image Download & Storage (`src/lib/images/image-downloader.ts`)
- Download selected image to `public/uploads/stock/{siteId}/{hash}.jpg`
- Store at appropriate resolution (large: 1200px for heroes, medium: 800px for cards)
- Return local path: `/uploads/stock/{siteId}/{hash}.jpg`

#### D. Component Tree Injection
- After images are resolved, inject into the section's props as Canvas-compatible objects:
  ```json
  {
    "src": "/uploads/stock/{siteId}/abc123.jpg",
    "alt": "Modern dental office with professional equipment",
    "width": 1200,
    "height": 800
  }
  ```
- Update `component-tree-builder.ts` to pass image objects through to `inputs`
- Update `component-validator.ts` to validate image object shape (src required, alt recommended)

#### E. Provisioning Image Handling (deferred — separate task)
- During provisioning, copy images from platform-app uploads to Drupal's `public://stock/` directory
- Rewrite `src` paths from `/uploads/stock/...` to `/sites/default/files/stock/...`
- This can be a new provisioning step (step 8.5: "Copy stock images")

### Image Slot Mapping (from Space DS Manifest)

| Component | Image Prop | Recommended Size | Orientation |
|-----------|-----------|-----------------|-------------|
| `space-hero-banner-style-*` | `background_image` | 1920x1080 | landscape |
| `space-text-media-default` | `image` | 800x600 | landscape |
| `space-featured-card` | `image` | 600x400 | landscape |
| `space-imagecard` | `image` | 600x400 | landscape |
| `space-people-card-*` | `image` | 400x400 | square |
| `space-team-section-image-card-*` | `image` | 400x400 | square |
| `space-accordion-with-image-item` | `image` | 600x400 | landscape |
| `space-logo-grid` | slot items | 200x100 | landscape |

## Canvas Image Schema (Validated)

From `canvas/components/image/image.component.yml`:
```yaml
properties:
  src:        # REQUIRED — relative or absolute URL, or stream wrapper URI
    type: string
    format: uri-reference
  alt:        # Optional but recommended
    type: string
  width:      # Optional, prevents layout shift
    type: integer
  height:     # Optional, prevents layout shift
    type: integer
  loading:    # Optional, defaults to "lazy"
    type: string
    enum: [lazy, eager]
```

## Implementation Notes

- **No Drupal-side changes needed**: `BlueprintImportService.prepareComponentTree()` passes `inputs` as-is — image objects flow through natively
- **Pipeline integration**: Add as a new phase after Generate, before blueprint is saved to DB
- **Progress UI**: Show "Enhancing with images..." as a sub-step during generation
- **Rate limiting**: Pexels allows 200 req/hr. A typical 5-page site needs ~15-20 images. Well within limits
- **Error resilience**: Image fetch failures should NEVER block generation. Fallback to null (component renders without image)
- **Deduplication**: If multiple sections need similar images (e.g., two team member cards), reuse the same search result

## Acceptance Criteria

- [ ] Generated blueprints include stock images in component tree for components that have image props
- [ ] Images are contextually relevant to the business type and section content
- [ ] Hero sections get landscape images; team/people sections get portrait/square images
- [ ] Image objects match Canvas schema: `{ src, alt, width, height }`
- [ ] Stock API failures do not block generation — graceful fallback to imageless sections
- [ ] Downloaded images are stored locally (not hotlinked from external CDN in final blueprint)
- [ ] Validator accepts image objects as valid props
- [ ] Unit tests cover: intent extraction, API client, download, tree injection, fallback behavior

## Dependencies

- TASK-268 (Component Validator — Done in Sprint 14)
- TASK-269 (Pipeline Integration — Done in Sprint 14)
- Requires `PEXELS_API_KEY` environment variable

## Architecture Decision

**Option A: Separate post-generation "Enhance" phase** — confirmed 2026-03-19.

Rationale: Image fetch failures are isolated from text generation, independently retryable, and the pipeline stays decoupled. Image intent is derived post-hoc from section content + business context (no AI coupling during generation).

## Open Questions

1. Should we offer image selection/swap in the review UI? (Likely a follow-up task)
2. For provisioning: should images be downloaded to Drupal during blueprint import, or during a dedicated provisioning step? (Recommend: dedicated step for separation of concerns)
