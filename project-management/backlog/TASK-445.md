# TASK-445: Image Provenance Display on Review Page

**Story:** US-085
**Effort:** S
**Milestone:** M22 — User-Uploaded Images

## Description
Extend the review/settings page to show image provenance indicators — which images are the user's own vs. stock photos, with match reasoning for user images.

## Implementation Details
- For sections with `_meta.imageSource === "user"`: show "Your image" badge + match reason
- For sections with `_meta.imageSource === "stock"`: show "Stock photo" label + "You can replace this in Drupal"
- Match reason derived from `_meta.imageMatchScore` and section context
- Post-generation callout: "All {N} images you uploaded are available in your Drupal Media Library"
- Use existing UI patterns — no new components
- Archie-branded voice: "Archie matched your photo to this section because..."

## Acceptance Criteria
- [ ] User images show "Your image" indicator on review page
- [ ] Stock images show "Stock photo" indicator
- [ ] Match score/reason visible for user image placements
- [ ] Media library callout shown with upload count
- [ ] Consistent Archie branding in all copy

## Dependencies
- TASK-441 (enhance phase — produces imageSource metadata)
- TASK-442 (blueprint manifest — provides image count)

## Files
- `platform-app/src/app/onboarding/review-settings/page.tsx` (edit)
