# TASK-015: SDC Component Manifest Service

**Story:** US-013 (Page Generation)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M2 — AI Site Generation Engine

## Description
Create `ComponentManifestService` that scans the Space theme's SDC components and builds a machine-readable catalog for AI agents.

## Technical Approach
- Inject Drupal's SDC plugin manager (`plugin.manager.sdc`)
- Scan all registered SDC components from the Space theme
- Parse each `*.component.yml` to extract: id, label, props (name, type, required), slots, description
- Build structured manifest array
- Add `usage_hint` metadata per component (manual mapping or from component description)
- Cache manifest (invalidated on cache clear)
- `getManifestForPrompt()`: format manifest as readable text for inclusion in AI agent system prompts
- `isValidComponent(string $id)`: validate component ID exists in manifest

## Acceptance Criteria
- [ ] Manifest includes all Space theme SDC components
- [ ] Each component entry has: id, label, props with types, usage hint
- [ ] Manifest is cached and doesn't re-scan on every call
- [ ] `getManifestForPrompt()` returns human-readable text suitable for LLM context
- [ ] `isValidComponent()` correctly validates component IDs

## Dependencies
- TASK-001 (Module scaffold, Space theme installed)

## Files/Modules Affected
- `ai_site_builder/src/Service/ComponentManifestService.php`
- `ai_site_builder/src/Service/ComponentManifestServiceInterface.php`
- `ai_site_builder/ai_site_builder.services.yml`
