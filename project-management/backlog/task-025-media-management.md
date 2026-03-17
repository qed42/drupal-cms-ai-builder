# TASK-025: Media Management Configuration

**Story:** US-025
**Priority:** P2
**Estimated Effort:** M
**Milestone:** M3 — Site Editing & Refinement

## Description
Configure Drupal Media module for site owners to upload and manage images, with per-site file isolation.

## Technical Approach
- Enable and configure Drupal Media module (media types: Image)
- Configure image styles for responsive images (thumbnail, medium, large, hero)
- Set up per-site file directory: `public://sites/{site_profile_uuid}/`
- Implement `hook_file_url_alter` or file storage override for per-site paths
- Configure Canvas to use media library for image component props
- Set file upload limits: PNG, JPG, WebP, max 10MB
- Enable WebP conversion via image toolkit if available

## Acceptance Criteria
- [ ] Site owner can upload images via Canvas editor
- [ ] Images stored in per-site directory
- [ ] Image styles generate responsive variants
- [ ] Media library accessible from Canvas component editing
- [ ] Upload limits enforced (type and size)

## Dependencies
- TASK-021 (Canvas editor config)

## Files/Modules Affected
- `ai_site_builder/config/install/media.type.image.yml`
- `ai_site_builder/config/install/image.style.*.yml`
- `ai_site_builder/ai_site_builder.module` (file directory override)
