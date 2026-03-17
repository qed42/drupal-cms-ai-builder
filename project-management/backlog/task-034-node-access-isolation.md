# TASK-034: Node Access & Data Isolation

**Story:** Foundation (supports all stories — security requirement)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M1 — Platform Foundation & Onboarding

## Description
Implement node-level access control to enforce data isolation between site owners in the single-instance multi-tenant architecture.

## Technical Approach
- Implement `hook_node_access` in `ai_site_builder.module`:
  - For nodes with `field_site_profile`: allow access only if profile owner matches current user
  - Platform admins bypass (check `administer site profiles` permission)
  - Anonymous users: only access published nodes belonging to published sites
- Implement `hook_node_grants` and `hook_node_access_records` for efficient query-level filtering
- Apply same pattern to Webform submissions: `hook_webform_submission_access`
- File access: restrict file downloads to files in user's site directory
- Add comprehensive tests: user A cannot view/edit/delete user B's content

## Acceptance Criteria
- [ ] User A cannot view user B's draft content
- [ ] User A cannot edit user B's content
- [ ] Anonymous users only see published content from published sites
- [ ] Platform admin can access all content
- [ ] Webform submissions isolated per site owner
- [ ] File access restricted to owner's directory
- [ ] Access control tests pass

## Dependencies
- TASK-002 (SiteProfile entity)
- TASK-014 (Content types — all have field_site_profile)

## Files/Modules Affected
- `ai_site_builder/ai_site_builder.module` (hook_node_access, hook_node_grants, hook_node_access_records)
