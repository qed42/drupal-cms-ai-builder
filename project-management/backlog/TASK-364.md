# TASK-364: Migrate Page Design Rules to Adapter

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M19 — Design System Decoupling
**Phase:** 3 — Composition & Prompts

## Description
Move `PAGE_DESIGN_RULES` from `page-design-rules.ts` into the Space DS adapter. These rules define which patterns and component roles are preferred for each page type (home, about, services, contact, portfolio, faq, team, landing). Rules should reference roles instead of hardcoded component IDs where possible.

## Technical Approach
1. Read `platform-app/src/lib/ai/prompts/page-design-rules.ts`
2. Extract `PAGE_DESIGN_RULES` (8 page-type rule sets)
3. Convert `preferredStyles` from component IDs to ComponentRole references where applicable
4. Move into adapter's `design-rules.ts`
5. Replace consumer with `adapter.getPageDesignRules()`
6. Update `formatRulesForGeneration()` to work with adapter-provided rules
7. The file `page-design-rules.ts` should become a thin module that formats rules from the adapter for AI prompts

## Acceptance Criteria
- [ ] `PAGE_DESIGN_RULES` removed from `page-design-rules.ts`
- [ ] Rules use ComponentRole references where appropriate
- [ ] `formatRulesForGeneration()` produces identical prompt output
- [ ] No `space_ds:` string literals in `page-design-rules.ts`
- [ ] AI page design selection unchanged

## Dependencies
- TASK-363 (composition patterns migrated first)

## Files/Modules Affected
- `platform-app/src/lib/ai/prompts/page-design-rules.ts`
