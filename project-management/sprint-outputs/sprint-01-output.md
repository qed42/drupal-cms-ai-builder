# Sprint 01 Output: Platform Foundation

**Completed:** 2026-03-17

## Tasks Delivered

### TASK-001: Scaffold ai_site_builder Core Module — DONE
- Drupal 11 project created via DDEV (ddev v1.25.1, PHP 8.3, MariaDB 11.8)
- Contrib modules required: ai ^1.3, ai_agents ^1.2, canvas ^1.2, webform 6.3.x-dev, metatag ^2.2, pathauto ^1.14, token ^1.17, key ^1.22, admin_toolbar ^3.6
- Safe modules enabled: metatag, pathauto, token, key, admin_toolbar
- AI/Canvas modules composer-required but NOT enabled (need API keys/config)
- Custom module scaffold: info.yml, module, routing, services, permissions, links, config
- 6 custom permissions defined
- Module settings config with default values

### TASK-002: SiteProfile Custom Entity — DONE
- `site_profile` content entity with 30+ base fields matching technical design
- Revisionable entity with revision table
- PHP 8.1 attribute-based entity type definition (Drupal 11 pattern)
- EntityOwnerTrait for user ownership
- SiteProfileAccessControlHandler: owner-only + admin bypass
- SiteProfileListBuilder: admin listing at `/admin/content/site-profiles`
- SiteProfileViewBuilder: default entity view
- SiteProfileForm: admin add/edit form
- Auto-generated routes via DefaultHtmlRouteProvider

### TASK-003: Industry Taxonomy Vocabulary — DONE
- `industry` vocabulary shipped as install config
- 6 terms created via hook_install(): Healthcare, Legal, Real Estate, Restaurant, Professional Services, Other
- Terms ordered by weight (0-5)
- Descriptions provided for each term

### TASK-004: Simplified User Registration Form — DONE
- RegistrationForm at `/start` — email + password fields
- Creates user with `site_owner` role
- Creates linked SiteProfile entity (status: onboarding, step: 1, trial dates set)
- Auto-login after registration
- Welcome email via hook_mail()
- Duplicate email validation with login redirect
- `site_owner` role config with 5 permissions
- Placeholder OnboardingController at `/onboarding`

### TASK-034: Node Access & Data Isolation — DONE
- `hook_node_access()` implemented: checks `field_site_profile` ownership
- Owner access: allowed for all operations on own content
- Admin bypass: `administer site profiles` permission
- Anonymous: view-only for published content from published sites
- SiteProfileAccessCheck service for route-level access control
- Registered as tagged access checker (`_site_profile_access`)
- Note: Access hooks are no-ops until TASK-014 adds `field_site_profile` to content types

## Verification Results

| Check | Result |
|-------|--------|
| Module installs on clean Drupal 11 | PASS |
| SiteProfile entity CRUD | PASS |
| Industry taxonomy: 6 terms, correct order | PASS |
| site_owner role with 5 permissions | PASS |
| `/start` route accessible | PASS |
| `/onboarding` route accessible | PASS |
| `/admin/content/site-profiles` route accessible | PASS |
| Module settings config loaded | PASS |
| User A cannot view User B's SiteProfile | PASS |
| Admin can view all SiteProfiles | PASS |

## Architecture Decisions Made During Implementation

1. **Space theme not available:** The "Space" theme referenced in architecture docs does not exist as Drupal contrib. Using Olivero (Drupal 11 default) for now.
2. **AI/Canvas not enabled:** Contrib modules `drupal/ai`, `drupal/ai_agents`, `drupal/canvas` are composer-required but NOT Drupal-enabled. They need API keys and configuration. Will be enabled in later sprints.
3. **Taxonomy terms via hook_install():** Terms are content entities, not config. Created programmatically in `hook_install()` with `$is_syncing` guard.
4. **PHP 8.1 attributes:** Used `#[ContentEntityType(...)]` attribute syntax (not annotation docblocks) following Drupal 11 core patterns.
5. **ControllerBase inheritance:** Used `ControllerBase` methods directly (e.g., `$this->entityTypeManager()`) instead of constructor injection to avoid property type conflicts.

## Files Created

```
web/modules/custom/ai_site_builder/
├── ai_site_builder.info.yml
├── ai_site_builder.install
├── ai_site_builder.links.menu.yml
├── ai_site_builder.links.task.yml
├── ai_site_builder.module
├── ai_site_builder.permissions.yml
├── ai_site_builder.routing.yml
├── ai_site_builder.services.yml
├── config/
│   └── install/
│       ├── ai_site_builder.settings.yml
│       ├── taxonomy.vocabulary.industry.yml
│       └── user.role.site_owner.yml
└── src/
    ├── Access/
    │   └── SiteProfileAccessCheck.php
    ├── Controller/
    │   └── OnboardingController.php
    ├── Entity/
    │   ├── SiteProfile.php
    │   ├── SiteProfileAccessControlHandler.php
    │   ├── SiteProfileInterface.php
    │   ├── SiteProfileListBuilder.php
    │   └── SiteProfileViewBuilder.php
    └── Form/
        ├── RegistrationForm.php
        └── SiteProfileForm.php
```

## Next Steps

- Invoke `/qa sprint-01` for Playwright test automation
- Sprint 02: Onboarding Wizard (TASK-006 through TASK-009)
