# Sprint 41: Image Matching, Drupal Media & Provenance

**Milestone:** M22 — User-Uploaded Images
**Duration:** 3 days
**Predecessor:** Sprint 40 (User Image Upload & AI Analysis)

## Sprint Goal

Close the image loop: match user photos to blueprint sections in the enhance phase, create Drupal Media entities during provisioning so all uploads are available in the Media Library, and show image provenance on the review page.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-441 | Modify enhance phase for user image priority | US-083 | M | TASK-440 (Sprint 40) | DONE |
| TASK-442 | Add `user_images` manifest to blueprint payload | US-083, US-084 | S | TASK-441 | DONE |
| TASK-443 | Drush `import-media` command (unplaced uploads only) | US-084 | S | None | DONE |
| TASK-444 | Provisioning — copy user images + unplaced media creation | US-084 | M | TASK-442, TASK-443 | DONE |
| TASK-445 | Image provenance display on review page | US-085 | S | TASK-441, TASK-442 | DONE |

## Execution Order

```
Wave 1 (parallel): TASK-441, TASK-443
  - Enhance phase modification and Drush command are independent
  - TASK-441 depends on TASK-440 (image matcher from Sprint 40)
  - TASK-443 is pure Drupal/PHP work, no platform dependencies

Wave 2 (parallel): TASK-442, TASK-445
  - Blueprint manifest and review page provenance both depend on TASK-441
  - Can be developed in parallel (different files)

Wave 3:            TASK-444
  - Provisioning changes depend on both the blueprint manifest (442) and Drush command (443)
```

## Architecture Clarification — Canvas Media Risk RESOLVED

**Original risk:** "How Canvas resolves media references in component tree inputs needs clarification."

**Finding:** `BlueprintImportService::resolveImageInputs()` (line 612–663) **already handles the full conversion**:
1. Detects image props via `prop_field_definitions` (entity_reference targeting media)
2. Converts `{ src: "/sites/{domain}/files/...", alt: "..." }` → scalar media entity ID
3. Creates both file entity and media entity automatically

**Impact on TASK-444:** Blueprint-placed user images follow the **identical path** as stock images:
```
Enhance phase → { src: "/uploads/{siteId}/images/{uuid}.jpg", alt: "..." }
Step 08.5     → copies file, rewrites to /sites/{domain}/files/user-images/{uuid}.jpg
Step 08       → resolveImageInputs() creates media entity, replaces with media ID
```

No `media_id` rewriting needed. No new blueprint format. The existing `{ src, alt }` → media entity pipeline handles it.

**Drush command (TASK-443) is only needed for UNPLACED uploads** — images that aren't in any component tree prop. Scope reduced from M to S.

## Dependencies & Risks

- **Sprint 40 completion** — TASK-441 depends on TASK-440 (image matcher). If Sprint 40's matcher isn't done, this sprint is blocked.
- **Path prefix matching** — Step 08.5 uses `UPLOAD_PREFIXES = ["/uploads/stock/", "/uploads/"]`. User images at `/uploads/{siteId}/images/` match the `/uploads/` prefix but currently copy to `files/stock/`. Need to route user images to `files/user-images/` instead. Low risk — small conditional in `copyAndRewrite()`.
- **Drupal regex contract** — `createMediaEntityFromImage()` expects `/sites/{domain}/files/{rest}`. User image path `/sites/{domain}/files/user-images/{uuid}.jpg` matches this regex → `public://user-images/{uuid}.jpg`. **Confirmed safe.**
- **Cross-container file access** — Provisioning copies files between platform and Drupal volumes. Verify Docker volume mounts in DDEV and future AWS environments.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| S | 3 | TASK-442, TASK-443, TASK-445 |
| M | 2 | TASK-441, TASK-444 |
| **Total** | **5 tasks** | |

## Definition of Done

- [ ] Enhance phase tries user images first, falls back to Pexels when no match
- [ ] Match threshold of 0.25 enforced; `_meta.imageSource` and `_meta.imageMatchScore` set on every section
- [ ] Blueprint payload includes `user_images` manifest with ALL uploads (used + unused)
- [ ] Blueprint-placed user images flow through existing 08.5 → 08 pipeline (no special handling)
- [ ] Drush `import-media` command creates media entities for unplaced uploads
- [ ] ALL uploaded images exist as Media entities after provisioning (placed + unplaced)
- [ ] Review page shows "Your image" vs "Stock photo" indicators with match reasoning
- [ ] Post-generation callout: "All N images are in your Drupal Media Library"
- [ ] No behavior change for sites without user images (backward compatible)
- [ ] No TypeScript compilation errors
- [ ] E2E test: upload 3 images → generate → verify at least 1 matched + all 3 in Drupal Media
