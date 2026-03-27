# TASK-438: Images Step UI — Multi-File Upload Zone

**Story:** US-081, US-082
**Effort:** L
**Milestone:** M22 — User-Uploaded Images

## Description
Build the images onboarding step page with a multi-file drag-and-drop upload zone, per-image thumbnails with AI descriptions, edit capability, and stock-only toggle.

## Implementation Details
- New file: `platform-app/src/app/onboarding/images/page.tsx`
- Multi-file drag-and-drop zone (extend `FileUploadZone` pattern for batch)
- Accept: `.png, .jpg, .jpeg, .webp` — visual validation before upload
- Per-image UI: thumbnail + status indicator (uploading/analyzing/ready/error) + editable description + tags
- Toggle at top: "I don't have images yet — use stock photos for now" — hides upload zone when on
- Skip button when no uploads and toggle off
- On file drop: immediately upload via `POST /api/upload` (parallel), then trigger `POST /api/ai/analyze-image` (parallel)
- User can edit AI-generated descriptions before proceeding
- Archie-branded conversational heading: "Show us your business" / subtitle explaining how images are used
- Save to `OnboardingSession.data`: `{ user_images: ImageUpload[], use_stock_only: boolean }`
- InferenceCard slot: "Archie analyzed your photos" showing count + top tags

## Acceptance Criteria
- [ ] Multi-file upload zone accepts drag-and-drop and file picker
- [ ] Per-file progress indicators during upload
- [ ] AI analysis runs automatically after upload completes
- [ ] Editable description field per image
- [ ] Stock-only toggle hides upload zone
- [ ] Skip button works when no images uploaded
- [ ] Session data saved correctly on proceed
- [ ] Archie-branded headings and InferenceCard

## Dependencies
- TASK-435 (image description service)
- TASK-436 (upload route extension)
- TASK-437 (step registration)

## Files
- `platform-app/src/app/onboarding/images/page.tsx` (new)
