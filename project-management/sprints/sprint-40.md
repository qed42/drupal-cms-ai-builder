# Sprint 40: User Image Upload & AI Analysis

**Milestone:** M22 — User-Uploaded Images
**Duration:** 3 days
**Predecessor:** Sprint 39 (M20 Onboarding UX Polish — DONE)

## Sprint Goal

Enable users to upload their own images during onboarding and have each image automatically analyzed by Archie with marketing-aware descriptions, semantic tags, and metadata — establishing the foundation for intelligent image matching in Sprint 41.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-435 | Image description service (`image-description-service.ts`) | US-082 | M | None | DONE |
| TASK-436 | Extend upload API route for image type | US-081 | S | None | DONE |
| TASK-437 | Register "images" onboarding step in `onboarding-steps.ts` | US-081 | XS | None | DONE |
| TASK-439 | `POST /api/ai/analyze-image` endpoint | US-082 | S | TASK-435 | DONE |
| TASK-438 | Images step UI — multi-file upload zone with AI analysis | US-081, US-082 | L | TASK-435, TASK-436, TASK-437 | DONE |
| TASK-440 | Image matcher module (`image-matcher.ts`) | US-083 | M | None | DONE |

## Execution Order

```
Wave 1 (parallel): TASK-435, TASK-436, TASK-437, TASK-440
  - Description service, upload route, step registration, and matcher are all independent
  - TASK-440 (matcher) has no Sprint 40 dependents but is pulled forward to parallelize

Wave 2:            TASK-439
  - API endpoint wraps TASK-435's service

Wave 3:            TASK-438
  - UI wires together upload route (436), step config (437), and analyze endpoint (439)
```

## Dependencies & Risks

- **Claude Vision API access** — TASK-435 requires multimodal Claude API. Verify API key has vision permissions before sprint starts.
- **`sharp` dependency** — TASK-436 needs `sharp` for EXIF stripping. May require native binary compilation on the platform container. Test `npm install sharp` in the dev environment first.
- **`file-type` dependency** — TASK-436 needs `file-type` for MIME validation. Pure JS, no native deps, low risk.
- **Step insertion in `onboarding-steps.ts`** — TASK-437 inserts a new step into an `as const` array. Grep for any code that hardcodes step indices or exact label matches (same risk pattern as Sprint 39's TASK-426).
- **Parallel upload UX** — TASK-438 is the largest task (L). Multi-file upload + parallel analysis + editable descriptions is significant UI work. If it runs long, split the InferenceCard into a separate task.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| XS | 1 | TASK-437 |
| S | 2 | TASK-436, TASK-439 |
| M | 2 | TASK-435, TASK-440 |
| L | 1 | TASK-438 |
| **Total** | **6 tasks** | |

## Definition of Done

- [ ] New "images" step appears in the onboarding stepper after fonts
- [ ] Users can drag-and-drop up to 20 images (10MB each, validated MIME types)
- [ ] Each uploaded image is automatically analyzed by Claude Vision with business-context-aware descriptions
- [ ] Users can edit AI-generated descriptions before proceeding
- [ ] "Use stock photos" toggle works and skips the step
- [ ] Session data stores `user_images[]` and `use_stock_only` boolean
- [ ] Image matcher module exists with unit tests for scoring algorithm
- [ ] No TypeScript compilation errors
- [ ] Archie-branded headings and copy consistent with Sprint 39 voice
