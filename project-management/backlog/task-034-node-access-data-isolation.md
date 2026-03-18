# TASK-034: Node Access & Data Isolation

**Story:** Foundation (security prerequisite)
**Priority:** P0
**Sprint:** 06
**Workstream:** Drupal

## Description

Implement per-site node access grants to enforce data isolation in the Drupal multisite environment. Each provisioned site operates in the same Drupal installation using multisite (`sites/{domain}/`), but content created during provisioning must only be visible to the site_owner of that specific site.

## Technical Approach

### 1. Site Context Detection
- Create `SiteContextService` that determines the current site based on the HTTP host / `sites/{domain}` mapping
- Store a `site_id` field on all content entities created during provisioning (already set by `BlueprintImportService`)
- Expose `getCurrentSiteId()` for use by access hooks

### 2. Node Access Grants
- Implement `hook_node_access_records()` to assign realm-based grants per site
- Implement `hook_node_grants()` to give the current site_owner grants for their site's realm
- Realm format: `ai_site_builder_site:{site_id}`

### 3. Query Filtering
- Implement `hook_query_TAG_alter()` for `node_access` tag to filter content queries to the current site
- Ensure Views, JSON:API, and Canvas all respect the filtering
- Admin users (uid=1, administrator role) bypass filtering

### 4. Entity Field Storage
- Add `field_site_id` (string) to node, media, menu_link_content, taxonomy_term, webform entities
- Populate during provisioning via `BlueprintImportService`

## Acceptance Criteria

- [ ] Content created for site A is not visible when accessing site B
- [ ] Site owner can only CRUD content within their site's scope
- [ ] Admin users can see all content across sites
- [ ] Canvas editor only shows components/nodes belonging to the current site
- [ ] Node access grants rebuilt correctly on cache clear
- [ ] JSON:API endpoints respect site filtering

## Dependencies

- Sprint 05 complete (provisioning creates content via `BlueprintImportService`)
- `BlueprintImportService` already sets site context during import

## Effort

Medium (M) — ~3 dev days
