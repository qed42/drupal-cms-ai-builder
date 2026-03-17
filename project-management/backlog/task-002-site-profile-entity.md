# TASK-002: Create SiteProfile Custom Entity

**Story:** US-005 through US-011 (all onboarding stories depend on this)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M1 — Platform Foundation & Onboarding

## Description
Define the `site_profile` custom content entity with all base fields needed for the onboarding wizard, generation metadata, and trial/subscription tracking.

## Technical Approach
- Create `SiteProfile` content entity class extending `ContentEntityBase`
- Implement `SiteProfileInterface` extending `ContentEntityInterface`
- Define all base fields in `baseFieldDefinitions()` per the technical design (site_name, tagline, logo, industry, colors, fonts, services, etc.)
- Create `SiteProfileAccessControlHandler` — users can only access their own profile; admins access all
- Create `SiteProfileListBuilder` for admin listing
- Create `SiteProfileViewBuilder`
- Add entity routes (canonical, add, edit, delete)
- Create `SiteProfileForm` for admin entity form

## Acceptance Criteria
- [ ] Entity installs with `drush entity:updates` or module install
- [ ] All base fields are present in the database schema
- [ ] A SiteProfile can be created, loaded, updated, and deleted via entity API
- [ ] Access control works: user A cannot load user B's SiteProfile
- [ ] Admin listing page works at `/admin/content/site-profiles`

## Dependencies
- TASK-001 (Module scaffold)

## Files/Modules Affected
- `ai_site_builder/src/Entity/SiteProfile.php`
- `ai_site_builder/src/Entity/SiteProfileInterface.php`
- `ai_site_builder/src/Entity/SiteProfileAccessControlHandler.php`
- `ai_site_builder/src/Entity/SiteProfileListBuilder.php`
- `ai_site_builder/src/Entity/SiteProfileViewBuilder.php`
- `ai_site_builder/src/Form/SiteProfileForm.php`
- `ai_site_builder/ai_site_builder.routing.yml`
- `ai_site_builder/ai_site_builder.links.menu.yml`
