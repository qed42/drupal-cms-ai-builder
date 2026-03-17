# TASK-029: Publish Service & One-Click Publish

**Story:** US-030
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M5 — Publishing & Subscription

## Description
Create `PublishService` for bulk publishing/unpublishing all site content, and the one-click publish UI.

## Technical Approach
- Create `PublishService` implementing `PublishServiceInterface`:
  - `publish(SiteProfile)`: bulk publish all nodes where field_site_profile = profile; update SiteProfile status to "published"; assign platform subdomain
  - `unpublish(SiteProfile)`: bulk unpublish all nodes; update status
  - `isPublished(SiteProfile)`: check status
- Scaffold `ai_site_builder_publish` submodule
- Platform subdomain: `{sanitized-site-name}.{platform-domain}` — store on SiteProfile entity (add a `subdomain` base field)
- "Publish" button on site editor dashboard
- Confirmation dialog: "Your site will be live at {subdomain}. Continue?"
- On publish: clear all caches, dispatch `SitePublishedEvent`
- Post-publish: show success message with live URL

## Acceptance Criteria
- [ ] One-click publishes all site content simultaneously
- [ ] Site accessible to anonymous visitors after publish
- [ ] Platform subdomain assigned and working
- [ ] Success message shows live URL
- [ ] SiteProfile status updated to "published"
- [ ] Re-publishing after edits works correctly

## Dependencies
- TASK-028 (Draft mode — content exists in draft)
- TASK-005 (Trial — must be active to publish)

## Files/Modules Affected
- `ai_site_builder_publish/ai_site_builder_publish.info.yml`
- `ai_site_builder_publish/ai_site_builder_publish.services.yml`
- `ai_site_builder_publish/src/Service/PublishService.php`
- `ai_site_builder_publish/src/Service/PublishServiceInterface.php`
- `ai_site_builder_publish/src/Controller/PublishController.php`
