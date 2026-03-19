# TASK-252: Per-Site MariaDB User Creation

**Story:** US-055
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M9 — Provisioning Hardening

## Description
Enhance the database creation provisioning step to create a dedicated MariaDB user per site with a random 32-character password. Update settings.php template to use site-specific credentials.

## Technical Approach
- Modify `provisioning/src/steps/01-create-database.ts`:
  - Generate password: `crypto.randomBytes(32).toString('hex')`
  - Execute: `CREATE USER IF NOT EXISTS 'site_{siteId}'@'%' IDENTIFIED BY '{password}'`
  - Execute: `GRANT ALL PRIVILEGES ON site_{siteId}.* TO 'site_{siteId}'@'%'`
  - Execute: `FLUSH PRIVILEGES`
  - Store credentials in config object for settings.php generation
- Modify `provisioning/src/steps/02-generate-settings.ts`:
  - Use site-specific credentials (username: `site_{siteId}`, password: generated) instead of root
- Update rollback: `DROP USER IF EXISTS 'site_{siteId}'@'%'`
- Verify works in DDEV local dev environment

## Acceptance Criteria
- [ ] Each site gets a unique MariaDB user `site_{siteId}`
- [ ] Password is randomly generated (32 chars)
- [ ] User has ALL PRIVILEGES only on its own database
- [ ] settings.php uses site-specific credentials (not root)
- [ ] Works in DDEV local dev environment
- [ ] Rollback drops the user on failure
- [ ] Root credentials no longer in generated site configs

## Dependencies
- None

## Files/Modules Affected
- `provisioning/src/steps/01-create-database.ts` (modify)
- `provisioning/src/steps/02-generate-settings.ts` (modify)
