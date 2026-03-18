# TASK-111: Provisioning Engine — Core Orchestrator

**Story:** Foundation (no direct user story — infrastructure)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M3 — Blueprint & Provisioning

## Description
Build the standalone Node.js provisioning engine that orchestrates Drupal multisite creation from a blueprint. This is the CLI tool that the platform app triggers after blueprint generation.

## Technical Approach
- Create `provisioning/` directory at project root
- Node.js project with TypeScript
- Main entry: `provision.js` — accepts CLI args: `--blueprint <path> --domain <domain> --email <email> --site-name <name>`
- Sequential step execution with error handling and rollback:

  1. **Create database** — MySQL `CREATE DATABASE site_{id}`. Use `mysql2` client.
  2. **Generate settings.php** — Write `sites/{domain}/settings.php` from template (DB creds, hash salt, JWT secret, trusted host, file paths)
  3. **Update sites.php** — Append domain → directory mapping
  4. **Install Drupal** — `drush site:install --sites-subdir={domain} --db-url=... --site-name=... --account-mail=...`
  5. **Enable modules** — `drush en ai_site_builder ai_site_builder_content canvas webform metatag pathauto`
  6. **Import config** — `drush ai-site-builder:import-config --industry={industry}`
  7. **Import blueprint** — `drush ai-site-builder:import-blueprint --path={blueprint_path}`
  8. **Apply brand** — `drush ai-site-builder:apply-brand --tokens={tokens_path}`
  9. **Configure site** — `drush ai-site-builder:configure-site`
  10. **Callback** — POST to platform API: `{ site_id, status: "live", url }`

- Rollback on failure: drop database, remove settings.php, remove sites.php entry
- Logging: structured JSON logs for each step
- Can run as ECS task or local CLI

## Acceptance Criteria
- [ ] CLI accepts required arguments and validates them
- [ ] Database created successfully
- [ ] settings.php generated with correct DB credentials
- [ ] sites.php updated with new domain mapping
- [ ] `drush site:install` completes without errors
- [ ] All required modules enabled
- [ ] Blueprint imported successfully
- [ ] Brand tokens applied
- [ ] Callback to platform API sent on success
- [ ] Rollback cleans up on failure (DB dropped, files removed)
- [ ] End-to-end provisioning completes in < 2 minutes

## Dependencies
- TASK-109 (Blueprint generation — provides the input)
- TASK-112 (Drupal Drush commands — provisioning calls these)
- TASK-113 (Content type configs — installed during provisioning)

## Files/Modules Affected
- `provisioning/` (new directory)
- `provisioning/src/provision.ts`
- `provisioning/src/steps/01-create-database.ts` through `10-callback.ts`
- `provisioning/src/utils/drush.ts`
- `provisioning/src/utils/database.ts`
- `provisioning/src/templates/settings.php.template`
- `provisioning/package.json`
- `provisioning/Dockerfile`
