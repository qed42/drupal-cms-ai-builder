# TASK-028: Draft Mode & Content Preview

**Story:** US-029
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M5 — Publishing & Subscription

## Description
Ensure all generated content starts in draft mode and implement preview capability for site owners while blocking anonymous access.

## Technical Approach
- All entity creation in AI agents must set `status = FALSE` (unpublished)
- Implement site-level access check: if SiteProfile status != "published", block anonymous access
- Use `hook_node_access` to deny anonymous access to unpublished content
- Canvas editor serves as the preview mechanism (already shows draft content)
- Add a "Preview" button on the site editor dashboard that opens the site in a new tab with a preview token
- Preview token: temporary hash-based URL parameter that grants anonymous preview access
- Visual "DRAFT" indicator overlay on all preview pages

## Acceptance Criteria
- [ ] All AI-generated content is unpublished by default
- [ ] Anonymous users cannot access draft content
- [ ] Site owner sees draft content in Canvas editor
- [ ] Preview button opens site in new tab with draft content visible
- [ ] Draft indicator clearly visible on preview pages

## Dependencies
- TASK-018 (Content Generator — must create content as draft)
- TASK-021 (Canvas editor — preview mechanism)

## Files/Modules Affected
- `ai_site_builder/src/Access/PreviewAccessCheck.php`
- `ai_site_builder/ai_site_builder.module` (hook_node_access for draft blocking)
- `ai_site_builder/ai_site_builder.routing.yml`
