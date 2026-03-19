# TASK-126: Blueprint Retrieval & Download API

**Story:** N/A (Feature request — blueprint persistence & download)
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M5 — Platform Stabilization

## Description
Expose an authenticated API endpoint that returns the full blueprint payload for a given site, with an option to download it as a JSON file. The blueprint is already persisted in the `blueprints` table (JSON column) — this task adds the retrieval layer.

## Technical Approach

### `GET /api/blueprint/[siteId]`
1. Create `platform-app/src/app/api/blueprint/[siteId]/route.ts`
2. Authenticate via `auth()` — return 401 if no session
3. Look up the site by `siteId` with ownership check (`userId === session.user.id`)
4. If site not found or not owned → 404
5. Include the related `blueprint` record
6. If no blueprint or blueprint status is not `ready` → 400 ("Blueprint not available")
7. Check query param `?download=true`:
   - If **false/absent**: Return JSON response with `{ siteId, siteName, status, payload }` — useful for programmatic access or preview
   - If **true**: Return the `payload` as a downloadable file with headers:
     - `Content-Type: application/json`
     - `Content-Disposition: attachment; filename="{siteName}-blueprint.json"`
8. Sanitize `siteName` for the filename (strip non-alphanumeric chars, limit length)

### Security Considerations
- Ownership check is critical — users must only access their own blueprints
- No additional authorization beyond NextAuth session (all authenticated users own their sites)
- Blueprint payload is not sensitive (no passwords/keys) — it's site content + layout metadata

## Acceptance Criteria
- [ ] `GET /api/blueprint/{siteId}` returns full blueprint JSON for the authenticated owner
- [ ] Returns 401 for unauthenticated requests
- [ ] Returns 404 for non-existent sites or sites owned by another user
- [ ] Returns 400 when blueprint is not in `ready` status
- [ ] `?download=true` returns the payload with `Content-Disposition: attachment` header
- [ ] Downloaded filename is derived from the site name
- [ ] Playwright test covers: authenticated retrieval, download header, ownership denial

## Dependencies
- None — blueprint persistence already exists in the database

## Files/Modules Affected
- `platform-app/src/app/api/blueprint/[siteId]/route.ts` (new)
