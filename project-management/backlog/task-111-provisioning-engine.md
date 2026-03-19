# TASK-111: Provisioning Engine — Core Orchestrator (Revised for Drupal CMS)

**Story:** Foundation (no direct user story — infrastructure)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M3 — Blueprint & Provisioning

## Description
Build the standalone Node.js provisioning engine that orchestrates Drupal CMS multisite creation from a blueprint. Leverages Drupal CMS 2.0 as the baseline (Canvas, Webform, SEO tools all pre-installed) with Space DS as the front-end theme. Blueprint JSON includes pre-built Canvas component trees generated during onboarding.

## Architecture Decisions

### Drupal CMS 2.0 Baseline
- Use `composer create-project drupal/cms` instead of `drupal/recommended-project`
- Canvas, Webform, Pathauto, Metatag, Media, AI modules all pre-installed
- 57 modules pre-configured — eliminates module enablement step
- Only `ai_site_builder` custom module needs enabling post-install

### Space DS Theme
- Space DS is battle-tested for SDC + Canvas compatibility
- Component manifest from Sprint 03 (84 components) remains valid
- Space DS installed via `composer require drupal/space_ds` and set as default theme

### Component Trees Generated in Next.js
- The blueprint generator (Next.js onboarding) produces Canvas-ready component tree structures
- Blueprint JSON includes `component_tree` per page — ready to save directly to `canvas_page` entities
- Drupal side does NOT build component trees — it receives and saves pre-built trees
- This approach is deterministic, fast, and avoids LLM calls during provisioning

## Technical Approach
- Create `provisioning/` directory at project root
- Node.js project with TypeScript
- Main entry: `provision.ts` — accepts CLI args: `--blueprint <path> --domain <domain> --email <email> --site-name <name>`
- Sequential step execution with error handling and rollback:

  1. **Create database** — MySQL `CREATE DATABASE site_{id}`. Use `mysql2` client.
  2. **Generate settings.php** — Write `sites/{domain}/settings.php` from template (DB creds, hash salt, JWT secret, trusted host, file paths)
  3. **Update sites.php** — Append domain → directory mapping
  4. **Install Drupal CMS** — `drush site:install drupal_cms_installer --sites-subdir={domain} --db-url=... --site-name=... --account-mail=...`
     - If `drupal_cms_installer` doesn't support CLI: use alternative from TASK-123 spike
  5. **Install Space DS** — `drush theme:install space_ds && drush config:set system.theme default space_ds`
  6. **Apply optional recipes** — As needed:
     - `drupal_cms_forms` (Webform)
     - `drupal_cms_ai` (AI agents for future section regeneration)
  7. **Enable ai_site_builder** — `drush en ai_site_builder` (our custom module only)
  8. **Import industry config** — `drush ai-site-builder:import-config --industry={industry}`
  9. **Import blueprint** — `drush ai-site-builder:import-blueprint --json={blueprint_path}`
     - Creates `canvas_page` entities with pre-built component trees from the blueprint
     - Creates content entities (services, team, testimonials)
     - Creates Webform from form definitions
  10. **Apply brand** — `drush ai-site-builder:apply-brand --tokens={tokens_path}`
  11. **Configure site** — `drush ai-site-builder:configure-site`
  12. **Callback** — POST to platform API: `{ site_id, status: "live", url }`

- Rollback on failure: drop database, remove settings.php, remove sites.php entry
- Logging: structured JSON logs for each step
- Can run as ECS task or local CLI

## Open Questions (Resolved by TASK-123 Spike)
1. **Can `drush site:install drupal_cms_installer` work?** — Spike will test CLI install.
2. **Canvas component tree format** — Spike documents the exact schema so Next.js can generate it.
3. **Multisite + Drupal CMS** — Spike validates recipe system in multisite.

## Acceptance Criteria
- [ ] CLI accepts required arguments and validates them
- [ ] Database created successfully
- [ ] settings.php generated with correct DB credentials
- [ ] sites.php updated with new domain mapping
- [ ] Drupal CMS installs with Canvas active
- [ ] Space DS theme installed and set as default
- [ ] `ai_site_builder` module enabled without errors
- [ ] Blueprint imported — canvas pages created with pre-built component trees
- [ ] Content entities created from blueprint content section
- [ ] Webform created from blueprint form definitions
- [ ] Brand tokens applied (CSS custom properties on Space DS)
- [ ] Callback to platform API sent on success
- [ ] Rollback cleans up on failure (DB dropped, files removed)
- [ ] End-to-end provisioning completes in < 90 seconds

## Dependencies
- TASK-109 (Blueprint generation — provides the input) ✅ Done
- TASK-112 (Drupal Drush commands — provisioning calls these)
- TASK-113 (Content type configs — installed during provisioning)
- TASK-123 (Spike — provides CLI install method and component tree format)

## Files/Modules Affected
- `provisioning/` (new directory)
- `provisioning/src/provision.ts`
- `provisioning/src/steps/01-create-database.ts` through `12-callback.ts`
- `provisioning/src/utils/drush.ts`
- `provisioning/src/utils/database.ts`
- `provisioning/src/templates/settings.php.template`
- `provisioning/package.json`
- `provisioning/Dockerfile`
