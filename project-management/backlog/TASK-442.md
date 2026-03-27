# TASK-442: Add user_images Manifest to Blueprint Payload

**Story:** US-083, US-084
**Effort:** S
**Milestone:** M22 — User-Uploaded Images

## Description
Extend the blueprint payload to include a `user_images` manifest containing all uploaded images (not just those used in sections), enabling the provisioning engine to create Drupal Media entities for every upload.

## Implementation Details
- Add `user_images` array to `Blueprint.payload` type
- Manifest format per image: `{ id, file_url, description, tags[], filename }`
- Populated during enhance phase from `OnboardingSession.data.user_images`
- Includes ALL uploaded images, not just those matched to sections
- Update Zod schema if blueprint validation exists
- Ensure manifest survives blueprint serialization/deserialization

## Acceptance Criteria
- [ ] `Blueprint.payload.user_images` contains all uploaded images
- [ ] Each entry has id, file_url, description, tags, filename
- [ ] Unused images (not matched to any section) are still included
- [ ] Blueprint type definitions updated
- [ ] Zod validation schema updated (if applicable)

## Dependencies
- TASK-441 (enhance phase modification — produces the enriched blueprint)

## Files
- `platform-app/src/lib/blueprint/types.ts` (edit — add user_images to payload type)
- `platform-app/src/lib/pipeline/phases/enhance.ts` (edit — write manifest to blueprint)
