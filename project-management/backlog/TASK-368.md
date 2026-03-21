# TASK-368: Migrate Provisioning Theme Installation to Adapter

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M19 — Design System Decoupling
**Phase:** 4 — Section Builder Refactor

## Description
Update provisioning steps to read theme name and brand strategy from the adapter instead of hardcoding `space_ds`. The provisioning engine should install whichever theme the adapter specifies and apply brand tokens using the adapter's `prepareBrandPayload()` method.

## Technical Approach
1. Read `provisioning/src/steps/05-install-theme.ts` — currently hardcodes `space_ds`
2. Read `provisioning/src/steps/09-apply-brand.ts` — brand token application
3. Add `@ai-builder/ds-types` as dependency in `provisioning/package.json`
4. Update `05-install-theme.ts`:
   - Read `designSystemId` from blueprint/config
   - Use `adapter.themeName` for Drush theme install
   - Use `adapter.composerPackage` if theme needs installation via Composer
5. Update `09-apply-brand.ts`:
   - Call `adapter.prepareBrandPayload(tokens)` to get theme-specific payload
   - Handle all three payload types:
     - `drupal-config`: Write config via Drush
     - `css-file`: Write file to specified path
     - `scss-file`: Write file + run npm build in theme directory
6. Add Node.js build capability to provisioning for CivicTheme SCSS compilation

## Acceptance Criteria
- [ ] No hardcoded `space_ds` in provisioning steps
- [ ] Theme name sourced from adapter
- [ ] Brand application handles `drupal-config`, `css-file`, and `scss-file` payload types
- [ ] SCSS build step runs `npm install && npm run build` when payload type is `scss-file`
- [ ] Space DS provisioning unchanged (regression test)

## Dependencies
- TASK-357 (adapter wired into platform-app)
- TASK-356 (Space DS adapter with brand payload)

## Files/Modules Affected
- `provisioning/src/steps/05-install-theme.ts`
- `provisioning/src/steps/09-apply-brand.ts`
- `provisioning/package.json`
