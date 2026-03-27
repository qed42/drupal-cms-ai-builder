# TASK-435: Image Description Service

**Story:** US-082
**Effort:** M
**Milestone:** M22 — User-Uploaded Images

## Description
Create `platform-app/src/lib/images/image-description-service.ts` — a service that analyzes uploaded images using Claude Vision (multimodal LLM) and returns marketing-aware descriptions, semantic tags, dominant colors, subject type, and orientation.

## Implementation Details
- Function: `analyzeImage(imagePath, businessContext) → ImageAnalysisResult`
- `ImageAnalysisResult`: `{ description, tags[], dominant_colors[], subject, orientation }`
- Subject categories: `person | product | place | food | abstract | group`
- Orientation: `landscape | portrait | square` (derived from image dimensions)
- Prompt includes business context (idea, industry, audience) for marketing-aware descriptions
- Use `sharp` to read image dimensions for orientation detection
- Handle errors gracefully — return partial result if color extraction fails

## Acceptance Criteria
- [ ] Service accepts an image path and business context, returns analysis result
- [ ] Descriptions are marketing-aware (reference business context, not just objects)
- [ ] Tags include semantic concepts (moods, themes), not just object labels
- [ ] Orientation correctly determined from image dimensions

## Dependencies
- None (standalone service)

## Files
- `platform-app/src/lib/images/image-description-service.ts` (new)
