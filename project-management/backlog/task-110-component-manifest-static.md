# TASK-110: Space SDC Component Manifest (Static Export)

**Story:** US-013 (Page Generation with SDC Components)
**Priority:** P0
**Estimated Effort:** S
**Milestone:** M3 — Blueprint & Provisioning

## Description
Create a static JSON manifest of all Space theme SDC components. This manifest is used by the Next.js blueprint generator to constrain AI page layouts to valid components. It's derived from Space's `*.component.yml` files.

## Technical Approach
- Create a Drush command or script that scans Space theme's SDC directory
- Reads each `*.component.yml` file
- Extracts: component ID, label, category, props (name, type, required), slots, usage hint
- Outputs as JSON file
- This file is committed to the platform-app repo and included in AI prompts during blueprint generation
- When Space theme updates, re-run the export to update the manifest
- Reuse/adapt the existing `ComponentManifestService` from Sprint 03 to generate this export

## Acceptance Criteria
- [ ] Script/command reads Space SDC directory and outputs valid JSON
- [ ] Manifest includes all Space components with props and types
- [ ] JSON file is placed in `platform-app/src/lib/ai/space-component-manifest.json`
- [ ] Manifest is usable in AI prompts (component IDs, props, usage hints)

## Dependencies
- Space theme must be available in the Drupal codebase (existing)

## Files/Modules Affected
- `web/modules/custom/ai_site_builder/src/Drush/Commands/ExportManifestCommands.php` (new)
- `platform-app/src/lib/ai/space-component-manifest.json` (output)
