# TASK-125: Wire Provisioning Engine to Blueprint Pipeline

**Story:** US-019 (End-to-End Site Generation)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M3 — Blueprint & Provisioning

## Description
Connect the blueprint generator to the provisioning engine so that after blueprint generation completes, the Drupal site is automatically provisioned. Currently the generator produces a `Blueprint` in the database with status `"ready"`, but nothing triggers the provisioning engine CLI to create the actual Drupal site.

## Problem
After completing onboarding, the blueprint generates successfully and site status becomes `"blueprint_ready"`, but the user is stuck — no Drupal site is actually created. The provisioning engine exists as a standalone CLI tool but is never invoked.

## Technical Approach

### 1. API Route: `POST /api/provision/start`
- Input: `{ siteId }` (from authenticated session)
- Validates site ownership and blueprint status is `"ready"`
- Writes blueprint payload to temp file
- Generates a subdomain from site name (slugified + random suffix)
- Spawns `provisioning/src/provision.ts` as a detached child process with:
  - `--blueprint <tempfile>`
  - `--domain <subdomain>.drupalcms.app`
  - `--email <user.email>`
  - `--site-name <site.name>`
  - `--site-id <site.id>`
  - `--industry <blueprint.site.industry>`
  - `--callback-url <platform_url>/api/provision/callback`
- Updates site status to `"provisioning"`
- Returns immediately (fire-and-forget)

### 2. API Route: `POST /api/provision/callback`
- Receives POST from provisioning engine step 11 (callback step)
- Payload: `{ site_id, status, url, domain }`
- Updates Site: `status: "live"`, `drupalUrl`, `subdomain`
- Secured by internal API key (not user auth)

### 3. Auto-Trigger from Generator
- After blueprint generation succeeds (status → `"ready"`), automatically call the `/api/provision/start` logic
- No manual "Start Provisioning" button needed

### 4. Provisioning Progress Tracking
- Update `/api/provision/status` to include provisioning steps in the progress map
- Add provisioning-specific steps: `provisioning_db`, `provisioning_install`, `provisioning_config`, `provisioning_brand`, `provisioning_done`

## Acceptance Criteria
- [ ] Blueprint generation automatically triggers provisioning
- [ ] Provisioning engine spawned as child process with correct arguments
- [ ] Site status transitions: `generating` → `blueprint_ready` → `provisioning` → `live`
- [ ] Callback updates site with drupalUrl and subdomain
- [ ] Progress UI shows provisioning steps (not just blueprint generation)
- [ ] Failed provisioning updates site status with error
- [ ] Subdomain generated from site name (unique)

## Dependencies
- TASK-109b (Blueprint generation — must produce valid blueprint)
- TASK-111 (Provisioning engine — must be functional)

## Files/Modules Affected
- `platform-app/src/lib/blueprint/generator.ts` (auto-trigger after ready)
- `platform-app/src/app/api/provision/start/route.ts` (new)
- `platform-app/src/app/api/provision/callback/route.ts` (new)
- `platform-app/src/app/api/provision/status/route.ts` (update progress map)
- `platform-app/src/lib/provisioning.ts` (new — spawn logic)
