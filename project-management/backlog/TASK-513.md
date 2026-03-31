# TASK-513: Fix BUG-054-001 — Add Missing list:text and list:integer Prop Types

**Story:** US-099 — Code Component Type System & Config Builder
**Priority:** P2
**Effort:** S
**Milestone:** M26 — Code Component Generation

## Description

The Zod schema and TypeScript types for code component props are missing `list:text` and `list:integer` Canvas prop types.

## Technical Approach

1. Add `"list:text"` and `"list:integer"` to the Zod prop type enum in `code-component-generation.ts`
2. Add to the `CodeComponentPropType` union type in `code-components/types.ts`
3. Update config builder tests to cover list prop types
4. Add few-shot example or test demonstrating a component with list props (e.g., gallery with image URLs)

## Acceptance Criteria

- [ ] `list:text` and `list:integer` accepted by Zod schema
- [ ] Config YAML builder handles list prop types
- [ ] Tests updated
- [ ] No regression in existing 106 tests

## Dependencies

- None
