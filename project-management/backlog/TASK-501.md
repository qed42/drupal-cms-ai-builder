# TASK-501: CodeComponentGenerator Interface & Config YAML Builder

**Story:** Code Components Initiative
**Priority:** P0
**Effort:** M
**Milestone:** M26 — Code Component Generation

## Description

Define the `CodeComponentGenerator` interface and implement a config YAML builder that converts Designer Agent output into `canvas.js_component.*.yml` config files for Drupal import.

## Technical Approach

- Define `CodeComponentGenerator` interface (parallel to `DesignSystemAdapter`)
- Define `CodeComponentOutput` type (machineName, name, jsx, css, props, slots)
- Implement `buildConfigYaml(output: CodeComponentOutput): string` producing valid `canvas.js_component.*.yml`
- Implement `wrapAsCanvasTreeNode(machineName: string, propValues: Record): ComponentTreeItem`
- Write unit tests with sample JSX → YAML conversion

## Acceptance Criteria

- [ ] `CodeComponentGenerator` interface defined with all required methods
- [ ] Config YAML builder produces valid Drupal config entity YAML
- [ ] Canvas tree node wrapper produces correct `js.[machineName]` component_id format
- [ ] Unit tests pass for YAML generation

## Dependencies
- None

## Files to Create

- `platform-app/src/lib/code-components/types.ts`
- `platform-app/src/lib/code-components/config-builder.ts`
- `platform-app/src/lib/code-components/__tests__/config-builder.test.ts`
