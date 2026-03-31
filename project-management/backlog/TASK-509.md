# TASK-509: Wire Design Tokens into Code Component Generation Prompt

**Story:** US-108 — Inject Design Tokens into Code Component Generation Prompt
**Priority:** P0
**Effort:** M
**Milestone:** M27 — Design Rules Engine

## Description

Verify and complete the integration between the design rules engine (with tokens) and the code component generation pipeline. The rules engine resolves tokens and compiles them into a prompt fragment. This task ensures:

1. The `generate-code-components.ts` phase passes the full fragment (including tokens) to `generateCodeComponent()`
2. The section index is passed alongside the fragment so the AI can follow background alternation patterns
3. The `buildCodeComponentPrompt()` function properly positions the tokens fragment for maximum AI compliance

## Technical Approach

1. **Verify existing wiring**: `generate-code-components.ts` already calls `getDesignRules()` and passes the fragment — verify tokens are included in the compiled output
2. **Add section context**: Pass `sectionIndex` and `totalSections` to the prompt builder so the AI knows where in the page it's generating (enables background alternation)
3. **Prompt positioning**: Place the tokens MUST USE section immediately before the "Generate the component" instruction for recency bias
4. **Test**: Write an integration test that mocks onboarding data with `generationMode: "code_components"` and `industry: "Healthcare"`, resolves rules, and verifies the prompt contains healthcare-specific token overrides

## Acceptance Criteria

- [ ] Design tokens appear in the compiled prompt fragment when `ENABLE_DESIGN_RULES=true`
- [ ] Section index and total count are available in the prompt context
- [ ] Tokens section appears after visual direction but before the generation instruction
- [ ] Integration test passes
- [ ] No regression in SDC mode

## Dependencies

- TASK-508 (Designer Agent generation function)
- Design tokens implementation (already done this session)
