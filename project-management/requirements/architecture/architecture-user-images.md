# Architecture: User-Uploaded Images with Pexels Fallback

**Status**: Draft
**Date**: 2026-03-26
**Scope**: Onboarding image uploads, AI-powered image description, semantic matching to components, Drupal Media integration

---

## 1. Problem Statement

Today, all website images come from Pexels stock photos selected during the **Enhance** pipeline phase. Users cannot supply their own imagery (product photos, team headshots, office shots, etc.), resulting in generic-looking sites. The current system:

- Has no mechanism for users to upload content images during onboarding
- Uses text-based Pexels queries derived from section content — often imprecise
- Does not create Drupal Media entities — images are raw files copied to `sites/{domain}/files/stock/`
- Cannot intelligently match a user's uploaded image to the right component

## 2. Solution Overview

```
┌───────────────────────────────────────────────────────────────────┐
│  ONBOARDING JOURNEY                                               │
│                                                                   │
│  New Step: "images" (between brand/fonts and follow-up)          │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │  Multi-file upload zone                                  │      │
│  │  Toggle: "I don't have images — use stock photos"        │      │
│  │  Per-image: AI-generated description preview (editable)  │      │
│  └─────────────────────────────────────────────────────────┘      │
└────────────────────────────────┬──────────────────────────────────┘
                                 │
                                 ▼
┌───────────────────────────────────────────────────────────────────┐
│  IMAGE DESCRIPTION SERVICE (Vision AI)                            │
│  - Analyzes each uploaded image via multimodal LLM                │
│  - Produces: { description, tags[], dominant_colors[], subject }  │
│  - User can edit description before proceeding                    │
└────────────────────────────────┬──────────────────────────────────┘
                                 │
                                 ▼
┌───────────────────────────────────────────────────────────────────┐
│  ENHANCE PHASE (modified)                                         │
│                                                                   │
│  For each image slot in the blueprint:                            │
│    1. Extract text context from component (existing logic)        │
│    2. Score user images by semantic similarity to context          │
│    3. Pick best match above threshold → inject user image         │
│    4. No match or no user images → Pexels fallback (existing)     │
└────────────────────────────────┬──────────────────────────────────┘
                                 │
                                 ▼
┌───────────────────────────────────────────────────────────────────┐
│  PROVISIONING (new step 08.3)                                     │
│                                                                   │
│  Upload ALL user images to Drupal as Media entities               │
│  (used + unused in blueprint)                                     │
│  - Create file entity → Create media entity (type: image)         │
│  - Set alt text from AI description                               │
│  - Rewrite blueprint src → media entity reference                 │
└───────────────────────────────────────────────────────────────────┘
```

## 3. Architecture Decisions

### ADR-1: Image Description via Multimodal LLM vs. Dedicated Vision API

| Option | Pros | Cons |
|--------|------|------|
| **A. Multimodal LLM (Claude)** | Rich semantic descriptions; understands business context; can tag for marketing relevance; already in our stack | Higher latency per image (~2-4s); token cost |
| **B. Dedicated Vision API (Google Vision, AWS Rekognition)** | Fast (~200ms); cheap; good at object detection and labels | Shallow descriptions; no business context; extra dependency |
| **C. Hybrid: Vision API labels + LLM summarization** | Fast labels + rich descriptions | Two API calls; added complexity |

**Decision**: **Option A — Multimodal LLM (Claude)**

**Rationale**: We need descriptions that are marketing-aware, not just object labels. "A woman using a laptop in a modern office" is far more useful for matching to a "Remote Work Solutions" section than raw labels `["person", "laptop", "desk"]`. We already have Claude in our pipeline. Latency is acceptable because uploads happen during onboarding (not real-time rendering), and we can process images in parallel.

### ADR-2: Semantic Matching Strategy

| Option | Pros | Cons |
|--------|------|------|
| **A. Embedding similarity (text-embedding model)** | Mathematically precise; handles synonyms well | Requires embedding API calls; overkill for 5-20 images |
| **B. LLM-based ranking** | Rich reasoning; can consider orientation, mood, composition | Expensive for many image×slot combinations |
| **C. Keyword overlap scoring** | Simple; fast; no API calls | Brittle; misses semantic relationships |

**Decision**: **Option C with enhancements — Keyword + tag overlap scoring**

**Rationale**: Users will typically upload 3-15 images. We already extract text from component props (titles, descriptions) and generate tags for each image. A weighted keyword/tag overlap score is sufficient and avoids additional API calls. The LLM-generated tags already capture semantic meaning (e.g., "teamwork", "professional", "outdoor dining"), so overlap scoring on these tags is effectively semantic matching without the embedding overhead.

If future usage shows poor matching quality, we can upgrade to Option A (embeddings) as a drop-in replacement since the interface is the same: `(imageDescription, componentContext) → score`.

### ADR-3: When to Create Drupal Media Entities

| Option | Pros | Cons |
|--------|------|------|
| **A. During provisioning (new step)** | Clean separation; Drupal handles file management; proper Media API | All images uploaded even if site generation fails |
| **B. During onboarding (immediate upload to Drupal)** | Images available instantly; Drupal URL from the start | Drupal site may not exist yet during onboarding; coupling |
| **C. Lazy — only when blueprint references them** | Minimal uploads | User loses unused images; breaks requirement |

**Decision**: **Option A — During provisioning**

**Rationale**: The requirement states ALL uploaded images become Media entities regardless of blueprint usage. The Drupal site exists by provisioning time (created in steps 01-07). Creating Media entities via Drush command keeps the platform-app decoupled from Drupal's internals.

### ADR-4: Image Storage During Onboarding (Before Drupal Exists)

**Decision**: Store uploads at `/public/uploads/{siteId}/images/{uuid}.{ext}` alongside the existing logo/palette uploads. The `siteId` scoping prevents collisions. The provisioning engine already mounts `/workspace/platform-app` and knows how to copy from this path.

---

## 4. Component Architecture

### 4.1 New Onboarding Step: "images"

**Position in flow**: After `fonts` (step 9), before `follow-up` (step 10)

```typescript
// platform-app/src/app/onboarding/images/page.tsx

interface ImageUpload {
  id: string;                    // UUID, generated client-side
  file_url: string;              // /uploads/{siteId}/images/{id}.jpg
  filename: string;              // Original filename
  description: string;           // AI-generated, user-editable
  tags: string[];                // AI-generated semantic tags
  dominant_colors: string[];     // Hex values from image analysis
  subject: string;               // Primary subject: "person", "product", "place", "abstract"
  orientation: "landscape" | "portrait" | "square";
  width: number;
  height: number;
  status: "uploading" | "analyzing" | "ready" | "error";
}
```

**UI behavior**:
- Multi-file drag-and-drop zone (reuses `FileUploadZone` pattern, extended for batch)
- Accept: `.png, .jpg, .jpeg, .webp` — max 10MB per file, max 20 files
- Each image shows a thumbnail + AI description (editable text field) + tags
- Toggle at top: "I don't have images yet — use stock photos for now"
- Skip button available — step is optional
- Images upload immediately on drop, analysis runs in parallel

**Saved to `OnboardingSession.data`**:
```typescript
{
  user_images: ImageUpload[];      // Array of analyzed uploads
  use_stock_only: boolean;         // True if user toggled "no images"
}
```

### 4.2 Image Description Service

```typescript
// platform-app/src/lib/images/image-description-service.ts

interface ImageAnalysisResult {
  description: string;          // "A barista carefully pouring latte art in a cozy café"
  tags: string[];               // ["coffee", "barista", "café", "latte art", "hospitality"]
  dominant_colors: string[];    // ["#3B2F2F", "#D4A574", "#FFFFFF"]
  subject: string;              // "person" | "product" | "place" | "food" | "abstract" | "group"
  orientation: "landscape" | "portrait" | "square";
}

async function analyzeImage(
  imagePath: string,
  businessContext: { idea: string; industry: string; audience: string }
): Promise<ImageAnalysisResult>
```

**API route**: `POST /api/ai/analyze-image`
- Accepts: `{ imagePath: string, siteId: string }`
- Loads business context from `OnboardingSession.data` for the site
- Calls Claude with the image + business context prompt
- Returns `ImageAnalysisResult`

**Prompt strategy**:
```
You are analyzing an image uploaded by a business owner building their website.

Business: {idea}
Industry: {industry}
Audience: {audience}

Analyze this image and return:
1. description: A concise, marketing-aware description of the image content (1-2 sentences)
2. tags: 5-10 semantic tags relevant to website content matching (not just objects — include concepts, moods, themes)
3. dominant_colors: Top 3 hex color values
4. subject: Primary subject category (person/product/place/food/abstract/group)

Focus the description on how this image could be used on a {industry} website.
```

**Parallelism**: When a user drops N files, all N analyses run concurrently via `Promise.allSettled()`. The UI shows per-image loading states.

### 4.3 Image Matching Engine

```typescript
// platform-app/src/lib/images/image-matcher.ts

interface MatchCandidate {
  imageId: string;
  score: number;              // 0-1 normalized
  reasons: string[];          // ["tag match: 'professional'", "subject match: 'person'"]
}

/**
 * Score all user images against a component's text context.
 * Returns candidates sorted by score descending.
 */
function rankImages(
  userImages: ImageUpload[],
  componentContext: {
    textContent: string;       // Extracted from component props (title, description, etc.)
    componentType: string;     // hero, testimonial, card, cta, etc.
    orientation: "landscape" | "portrait" | "square";
    pageTitle: string;
  },
  usedImageIds: Set<string>    // Already assigned images (avoid duplicates)
): MatchCandidate[]
```

**Scoring algorithm**:

```
Score = (tagOverlap × 0.4) + (descriptionOverlap × 0.3) + (orientationMatch × 0.15) + (subjectFit × 0.15)
```

| Factor | Weight | Calculation |
|--------|--------|-------------|
| **Tag overlap** | 0.4 | `matchingTags / max(imageTags, contextKeywords)` — tokenize component text into keywords, intersect with image tags |
| **Description overlap** | 0.3 | Jaccard similarity between image description tokens and component text tokens (stopwords removed) |
| **Orientation match** | 0.15 | 1.0 if image orientation matches component's expected orientation, 0.3 otherwise |
| **Subject fit** | 0.15 | Heuristic: testimonial/team → "person"/"group" = 1.0; hero → any = 0.8; product feature → "product" = 1.0 |

**Minimum threshold**: 0.25 — below this, fall back to Pexels.

**Deduplication**: `usedImageIds` set prevents the same user image from being assigned to multiple slots. If the best match is already used, take the next-best above threshold.

### 4.4 Modified Enhance Phase

The current `resolveImagesForSections()` in `image-resolver.ts` is extended with a new code path:

```typescript
// Modified signature
export async function resolveImagesForSections(
  siteId: string,
  sections: PageSection[],
  pageTitle: string,
  industry: string,
  audience: string,
  userImages?: ImageUpload[]    // NEW: optional user-uploaded images
): Promise<ResolveResult>
```

**Modified flow per image slot**:

```
1. Extract text context from component (existing: buildSearchQuery)
2. IF userImages provided AND use_stock_only !== true:
   a. Run rankImages(userImages, context, usedImageIds)
   b. IF best match score ≥ 0.25:
      - Inject user image (already local at /uploads/{siteId}/images/{id}.ext)
      - Add to usedImageIds
      - Tag section._meta.imageSource = "user"
      - CONTINUE to next slot
3. ELSE (no user images OR no match above threshold):
   - Pexels fallback (existing fetchAndDownload logic)
   - Tag section._meta.imageSource = "stock"
```

This is backward-compatible: if `userImages` is `undefined`, the behavior is identical to today.

### 4.5 Provisioning: Drupal Media Creation

**New step**: `08.3-create-media-entities.ts` (runs after image copy, before blueprint import)

```typescript
// provisioning/src/steps/08.3-create-media-entities.ts

export async function createMediaEntitiesStep(
  config: ProvisioningConfig,
  logger: winston.Logger
): Promise<StepResult>
```

**Process**:

1. **Read user images manifest** from blueprint:
   ```json
   {
     "user_images": [
       {
         "id": "abc-123",
         "file_url": "/uploads/{siteId}/images/abc-123.jpg",
         "description": "A barista pouring latte art",
         "tags": ["coffee", "barista"],
         "filename": "barista-photo.jpg"
       }
     ]
   }
   ```

2. **Copy ALL user images** to Drupal files directory:
   ```
   Source: /workspace/platform-app/public/uploads/{siteId}/images/{id}.ext
   Dest:   {drupalRoot}/web/sites/{domain}/files/user-images/{id}.ext
   ```

3. **Create Media entities via Drush**:
   ```bash
   drush ai-site-builder:create-media \
     --file="public://user-images/{id}.ext" \
     --alt="{description}" \
     --name="{filename}" \
     --bundle="image"
   ```
   This creates:
   - `file_managed` entity (file)
   - `media` entity (type: `image`, field_media_image → file)

4. **Build media ID map**: `{ imageId → drupalMediaId }`

5. **Rewrite blueprint image references** that use user images:
   - Replace `{ src: "/uploads/..." }` with `{ media_id: 42, src: "/sites/{domain}/files/user-images/..." }`
   - The `media_id` enables Canvas to reference the Media entity properly

**Key design point**: ALL user images get Media entities created, not just the ones used in the blueprint. Unused images are available in the Drupal Media Library for the user to assign later.

### 4.6 Drush Command for Media Creation

**New Drush command** in the `ai_site_builder` module:

```php
// web/modules/custom/ai_site_builder/src/Commands/CreateMediaCommand.php

#[CLI\Command(name: 'ai-site-builder:create-media')]
public function createMedia(
  string $file,
  string $alt = '',
  string $name = '',
  string $bundle = 'image'
): void
```

Alternatively, a batch variant that accepts a JSON manifest:

```bash
drush ai-site-builder:import-media --manifest=/tmp/media-manifest.json
```

Where the manifest is:
```json
[
  { "file": "public://user-images/abc-123.jpg", "alt": "...", "name": "...", "bundle": "image" },
  { "file": "public://user-images/def-456.jpg", "alt": "...", "name": "...", "bundle": "image" }
]
```

Returns: JSON array of `{ image_id: "abc-123", media_id: 42, fid: 101 }`.

---

## 5. Data Flow

```
┌─ ONBOARDING ──────────────────────────────────────────────────────────┐
│                                                                        │
│  User drops 5 images                                                   │
│       │                                                                │
│       ├──► POST /api/upload (×5 parallel)                             │
│       │    Saves to /public/uploads/{siteId}/images/{uuid}.ext         │
│       │                                                                │
│       ├──► POST /api/ai/analyze-image (×5 parallel)                   │
│       │    Claude Vision → { description, tags, colors, subject }      │
│       │                                                                │
│       └──► User edits descriptions → save to OnboardingSession.data   │
│            { user_images: [...], use_stock_only: false }               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌─ PIPELINE ────────────────────────────────────────────────────────────┐
│                                                                        │
│  Research → Plan → Generate (unchanged)                               │
│                                                                        │
│  Enhance Phase:                                                        │
│    Load user_images from OnboardingSession.data                       │
│    For each image slot:                                                │
│      1. Extract component text context                                 │
│      2. rankImages(userImages, context) → best match?                 │
│         YES (score ≥ 0.25) → inject user image path                   │
│         NO → Pexels fallback (existing)                               │
│    Save blueprint with imageSource metadata                           │
│                                                                        │
│  Blueprint.payload includes:                                          │
│    - pages[].sections[].props.image.src = "/uploads/..."              │
│    - user_images[] manifest (all uploads, not just used)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌─ PROVISIONING ────────────────────────────────────────────────────────┐
│                                                                        │
│  Step 08.3: Create Media Entities                                     │
│    - Copy ALL user images to Drupal files/user-images/                │
│    - drush ai-site-builder:import-media --manifest=...                │
│    - Creates Media entities for ALL (used + unused)                   │
│    - Rewrites blueprint paths to Drupal paths                         │
│                                                                        │
│  Step 08.5: Copy Stock Images (existing — handles Pexels images)     │
│                                                                        │
│  Step 08: Import Blueprint (existing — now references Media IDs)     │
└───────────────────────────────────────────────────────────────────────┘
```

## 6. Database Schema Changes

### OnboardingSession.data additions

No schema migration needed — `data` is a JSON field. New keys:

```typescript
{
  // ... existing fields ...
  user_images: ImageUpload[];    // Array of analyzed image uploads
  use_stock_only: boolean;       // User opted out of custom images
}
```

### Blueprint.payload additions

```typescript
{
  // ... existing fields ...
  user_images: Array<{           // Manifest of ALL uploaded images
    id: string;
    file_url: string;
    description: string;
    tags: string[];
    filename: string;
  }>;
}
```

### Section metadata additions

```typescript
section._meta = {
  imageQuery: string;            // Existing
  imageSource: "user" | "stock"; // NEW: tracks provenance
  imageMatchScore?: number;      // NEW: matching confidence (user images only)
}
```

## 7. API Design

### New Endpoints

#### `POST /api/ai/analyze-image`

Analyzes an uploaded image using Claude Vision.

**Request**:
```json
{
  "imagePath": "/uploads/{siteId}/images/{uuid}.jpg",
  "siteId": "site_abc123"
}
```

**Response**:
```json
{
  "description": "A barista carefully pouring latte art in a warmly lit café",
  "tags": ["coffee", "barista", "café", "latte art", "hospitality", "warm lighting"],
  "dominant_colors": ["#3B2F2F", "#D4A574", "#FFFFFF"],
  "subject": "person",
  "orientation": "landscape"
}
```

#### `POST /api/upload` (modified)

Extended to support `uploadType: "image"` alongside existing `logo`, `palette`, `font`.

**Changes**:
- New type: `image` — max 10MB, accepts PNG/JPG/JPEG/WEBP
- Storage path: `/public/uploads/{siteId}/images/{uuid}.{ext}` (UUID-based, not timestamp)
- Returns `{ url, filename, path, id }` — `id` is the UUID for tracking

### Modified Internal Interfaces

#### `resolveImagesForSections()` — new optional parameter

```typescript
// Before
resolveImagesForSections(siteId, sections, pageTitle, industry, audience)

// After
resolveImagesForSections(siteId, sections, pageTitle, industry, audience, userImages?)
```

#### Enhance phase — loads user images from session

```typescript
// phases/enhance.ts
const session = await getOnboardingSession(siteId);
const userImages = session.data.use_stock_only ? undefined : session.data.user_images;
// Pass to resolveImagesForSections
```

## 8. Security Considerations

| Concern | Mitigation |
|---------|------------|
| **Malicious file uploads** | Validate MIME type server-side (not just extension); use `file-type` npm package to check magic bytes; reject non-image files |
| **File size DoS** | 10MB per file, 20 files max = 200MB ceiling per site; enforce in upload route middleware |
| **Path traversal** | UUID-based filenames (no user-controlled path segments); validate `siteId` ownership |
| **EXIF data leakage** | Strip EXIF metadata before storing (use `sharp` library — already likely in stack for image processing) |
| **Prompt injection via image** | Claude Vision analysis runs with structured output schema; no user text concatenated into executable context |
| **Unauthorized access** | Upload route validates `userId` owns the `siteId`; images scoped to site directory |

## 9. Performance Considerations

| Operation | Expected Latency | Strategy |
|-----------|------------------|----------|
| Image upload (10MB) | 1-3s per file | Parallel uploads from client |
| Image analysis (Claude Vision) | 2-4s per image | `Promise.allSettled()` for all images; non-blocking UI |
| Image matching (per slot) | <5ms | In-memory scoring, no API calls |
| Media entity creation (Drush) | ~500ms per image | Batch via manifest JSON, single Drush invocation |
| Total onboarding overhead | ~5-10s for 5 images | Analysis runs while user reviews/edits descriptions |

**Optimization**: Start image analysis immediately on upload (don't wait for user to click "Next"). By the time they review descriptions, most analyses are complete.

## 10. UX Transparency

Following the project's AI transparency principles (see `onboarding_ux_review.md` memory):

- **Description source**: Show "AI-generated description" label with edit icon
- **Matching explanation**: On the review page, show which user image was matched to which section and why (e.g., "Matched to 'Our Services' section — tags: professional, teamwork")
- **Fallback notice**: If Pexels was used for a slot, show "Stock photo — you can replace this with your own image in Drupal"
- **Media library callout**: After site generation, inform user: "All {N} images you uploaded are available in your Drupal Media Library"

## 11. Future Considerations

- **Image cropping/resizing**: Currently images are used as-is. Future: auto-crop to component dimensions using `sharp`
- **Embedding-based matching**: If keyword scoring proves insufficient, swap in text-embedding similarity (same interface)
- **Image replacement in review**: Let users swap images on the post-generation review page before provisioning
- **Multi-session image library**: Allow users to reuse images across multiple site builds
- **AI image generation**: DALL-E/Stable Diffusion as a third source tier (user → stock → generated)

---

## 12. Implementation Sequence

| Order | Component | Dependencies |
|-------|-----------|--------------|
| 1 | Image description service (`image-description-service.ts`) | Claude Vision API access |
| 2 | Upload route extension (type: `image`, UUID naming) | Existing upload infra |
| 3 | Onboarding "images" step UI | #1, #2 |
| 4 | Image matcher (`image-matcher.ts`) | None |
| 5 | Enhance phase modification (user image priority) | #4 |
| 6 | Blueprint `user_images` manifest | #5 |
| 7 | Provisioning step 08.3 (Media entity creation) | Drush command |
| 8 | Drush `import-media` command | Drupal module |
| 9 | Review page — image provenance display | #5, #6 |

---

## Handoff

This architecture is ready for `/drupal-architect` to break down into technical backlog tasks. Key areas for Drupal-specific design:

1. **Drush `import-media` command** — batch Media entity creation with file management
2. **Canvas blueprint import** — how to reference Media entities (media ID vs. file path) in component tree inputs
3. **Media Library integration** — ensuring unused uploaded images are browsable and taggable post-provisioning
