# TASK-372: Mercury Prompt Fragments & Design Rules

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M19 — Design System Decoupling
**Phase:** 5 — Mercury Adapter

## Description
Implement `buildPromptComponentReference()`, `buildPromptAccessibilityRules()`, `buildPromptDesignGuidance()`, and `getPageDesignRules()` for the Mercury adapter. The AI needs Mercury-specific guidance to generate correct component trees.

## Technical Approach
1. Create `packages/ds-mercury/src/prompt-fragments.ts`:
   - `buildPromptComponentReference()` — list all 22 Mercury components with their props and slots, formatted for AI consumption
   - `buildPromptAccessibilityRules()` — Mercury's background colors (primary, secondary, accent, muted) and their contrast implications
   - `buildPromptDesignGuidance()` — Mercury-specific instructions:
     - Section component combines container + grid (no separate wrapper)
     - Use `group` for flexible sub-layouts within sections
     - Cards are flat (props only, no slots) — don't try to nest components in cards
     - `accordion-container` wraps `accordion` items (not vice versa)
     - Mercury uses Tailwind utility classes via CVA — don't reference raw CSS

2. Create `packages/ds-mercury/src/design-rules.ts`:
   - Page design rules for all 8 page types (home, about, services, contact, portfolio, faq, team, landing)
   - Map hero preferences to Mercury hero variants
   - Map section preferences to Mercury-compatible patterns

## Acceptance Criteria
- [ ] AI prompts include accurate Mercury component props and slots
- [ ] Accessibility rules reflect Mercury's color palette
- [ ] Design guidance prevents common Mercury composition errors
- [ ] Page design rules cover all 8 page types
- [ ] Prompt output is clear enough for AI to generate valid Mercury trees

## Dependencies
- TASK-369 (Mercury manifest)

## Files/Modules Affected
- `packages/ds-mercury/src/prompt-fragments.ts` (new)
- `packages/ds-mercury/src/design-rules.ts` (new)
