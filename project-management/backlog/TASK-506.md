# TASK-506: Provisioning — Import Code Component Config Entities

**Story:** US-104 — Code Component Provisioning to Drupal Canvas
**Priority:** P0
**Effort:** L
**Milestone:** M26 — Code Component Generation

## Description

Update the provisioning engine (Drush commands) to import Code Component config entities into the Drupal site alongside the existing SDC-based component tree.

## Technical Approach

- Read `_codeComponents[]` from blueprint payload
- Write each Code Component as `canvas.js_component.[name].yml` to Drupal's config/sync directory
- Run `drush cim --partial` to import only the new Code Component configs
- Alternative: use Canvas CLI `push` command if available in provisioning environment
- Build Canvas component tree referencing `js.[machineName]` component IDs
- Verify Code Components render correctly alongside any SDC components on the same page

## Acceptance Criteria

- [ ] Code Component config YAMLs imported into Drupal successfully
- [ ] `drush cex` shows Code Components in config
- [ ] Canvas pages render Code Components with correct JSX + Tailwind
- [ ] Mixed pages (SDC + Code Components) render without conflict
- [ ] Provisioning works for both pure-SDC and pure-Code-Component sites

## Dependencies
- TASK-504

## Files to Modify

- `provisioning/src/commands/` (Drush provisioning commands)
- `provisioning/src/services/blueprint-import.ts`
