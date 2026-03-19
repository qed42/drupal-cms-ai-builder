# TASK-131: Fix Provisioning Callback Authentication & Failure Handling

**Story:** US-019 (Provisioning Pipeline)
**Priority:** P0
**Estimated Effort:** S
**Milestone:** M4 — Site Editing

## Description
Two related bugs in the provisioning callback:

1. **Callback 401 Unauthorized**: The callback API validates `x-api-key` against `PROVISION_CALLBACK_KEY` env var, but the provisioning engine never sent this header.
2. **UI stuck in "provisioning" state**: When provisioning fails, no failure callback is sent — the site stays in `provisioning` status forever. The UI has retry logic for `provisioning_failed` status, but it's never reached.

Additionally, if the callback step itself fails (step 11), the entire provisioning was rolled back — destroying a successfully provisioned Drupal site just because the status update API call failed.

## Fix

### Callback auth (steps/11-callback.ts)
- Read `PROVISION_CALLBACK_KEY` from env and include as `x-api-key` header
- Added `sendFailureCallback()` export for the orchestrator to call on errors

### Failure handling (provision.ts)
- On step failure, call `sendFailureCallback()` before rollback — updates site status to `provisioning_failed`
- If only the callback step fails, skip rollback — the site is already provisioned

### Subdomain extraction (callback/route.ts)
- Use `SITE_DOMAIN_SUFFIX` env var instead of hardcoded `.drupalcms.app`

## Files Changed
- `provisioning/src/steps/11-callback.ts` — auth header + failure callback function
- `provisioning/src/provision.ts` — failure callback before rollback, skip rollback for callback-only failures
- `platform-app/src/app/api/provision/callback/route.ts` — configurable domain suffix
