# Architecture: Image Pipeline Separation of Concerns

**Status**: Approved
**Date**: 2026-03-26
**Scope**: Refactor Generate/Enhance phase boundary for image resolution

---

## Problem

The current pipeline has a responsibility overlap between Generate and Enhance phases for image resolution:

```
CURRENT (broken):
  Generate Phase:
    1. AI generates content sections + props
    2. resolveImagesForSections() — downloads Pexels images, injects into section.props
    3. buildComponentTree() — bakes image paths into Canvas component tree inputs
    4. Saves blueprint with hardcoded image paths in component trees

  Enhance Phase:
    1. Loads blueprint from DB
    2. Calls resolveImagesForSections() — BUT isImagePopulated() returns true (already filled!)
    3. Enhance is effectively a NO-OP for images
    4. Rebuilds component trees needlessly
```

**Consequences:**
- User-uploaded images never get matched (slots already filled by Pexels in Generate)
- Component trees are built twice (waste)
- Enhance phase is dead code for its primary purpose
- No clean "empty slot" concept — images are hardcoded at generation time

## Solution

Separate content generation from image resolution completely:

```
TARGET:
  Generate Phase:
    1. AI generates content sections + props (text only)
    2. Image props left EMPTY — no Pexels, no user images
    3. Build component trees WITH empty image slots
    4. Save blueprint (sections have empty image props, trees have empty image inputs)

  Enhance Phase (sole owner of images):
    1. Load blueprint from DB
    2. Load user images from onboarding session
    3. For each empty image slot (via adapter.getImageMapping):
       a. Try user image match (rankImages, threshold 0.25)
       b. Fallback: Pexels stock search + download
       c. Inject { src, alt, width, height } into section.props
       d. Set _meta.imageSource / _meta.imageMatchScore
    4. Write user_images manifest to blueprint
    5. Rebuild component trees (now with images in place)
    6. Save final blueprint
```

## Changes Required

### 1. Generate Phase (`platform-app/src/lib/pipeline/phases/generate.ts`)
- **Remove**: `resolveImagesForSections()` call (line ~340)
- **Remove**: `import { resolveImagesForSections }` and related imports
- **Remove**: `clearImageCache()` call
- **Remove**: `extractUserImagesFromData()` helper
- **Keep**: `buildComponentTree()` — trees are still built, just with empty image inputs
- **Keep**: URL validation, review loop, all other generation logic

### 2. Enhance Phase (`platform-app/src/lib/pipeline/phases/enhance.ts`)
- **Add**: `clearImageCache()` at start
- **Already correct**: Calls `resolveImagesForSections()` per page with user images
- **Already correct**: Rebuilds component trees after image injection
- **Already correct**: Saves blueprint with `generationStep: "ready"`
- **Verify**: `isImagePopulated()` correctly detects empty slots (should return false for undefined/null/missing props)

### 3. Image Resolver (`platform-app/src/lib/images/image-resolver.ts`)
- **No changes needed** — `isImagePopulated()` already returns false for empty/missing props
- User image priority logic already in place

### 4. Component Tree Builder
- **Verify**: Handles missing/empty image props gracefully (likely already does — inserts placeholder or omits)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Component tree builder fails on empty image props | Low | High | Test with sections that have no image props — existing placeholder logic should handle |
| Review loop in Generate needs images for validation | Low | Low | Review validates content/structure, not images |
| Generate phase log "0 images added" confuses debugging | Low | Low | Remove image-related logging from Generate |

## ADR: Why separate phases vs. single-pass

**Options considered:**
1. **Single-pass in Generate** (current) — images resolved inline during content generation
2. **Separate Enhance phase** (proposed) — content generation is pure text, images are a second pass
3. **Hybrid** — Generate creates image intents (queries), Enhance resolves them

**Decision: Option 2**

**Rationale:**
- Clean separation of concerns — AI generates content, image resolution is a post-processing step
- Enables user image matching — slots must be empty for the matcher to fill them
- Enables future image sources (DALL-E, uploads, CDN) without touching Generate
- Enables parallel image resolution across pages (Generate must be sequential for rate limits)
- Consistent with the original design intent of the Enhance phase
