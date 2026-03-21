# TASK-378: CivicTheme Prompt Fragments & Design Rules

**Story:** Design System Abstraction (M19)
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M19 — Design System Decoupling
**Phase:** 6 — CivicTheme Adapter

## Description
Implement prompt generation and page design rules for CivicTheme. This requires fundamentally different AI guidance: CivicTheme uses pre-composed organisms, so the AI should select organisms rather than compose atoms.

## Technical Approach
1. Create `packages/ds-civictheme/src/prompt-fragments.ts`:
   - `buildPromptComponentReference()` — list CivicTheme organisms with their props and usage
   - `buildPromptAccessibilityRules()` — CivicTheme's light/dark theme system and contrast rules
   - `buildPromptDesignGuidance()` — CivicTheme-specific instructions:
     - **Key difference:** Select pre-composed organisms (promo, callout, banner) instead of composing from layout primitives
     - Use CivicTheme's card variants for specific content types (event-card for events, publication-card for blog)
     - Each component supports `theme: "light" | "dark"` — alternate for visual rhythm
     - Don't try to nest components in cards — they're flat (props only)
     - Use `slider` or `carousel` for collections, not manual grid

2. Create `packages/ds-civictheme/src/design-rules.ts`:
   - Page design rules for all 8 page types
   - Map hero preferences: banner for most pages, campaign for landing pages
   - Map section preferences to CivicTheme organisms

## Acceptance Criteria
- [ ] AI prompts reflect CivicTheme's organism-first composition model
- [ ] Design guidance prevents composition errors (e.g., trying to use flexi-style layout)
- [ ] All 8 page types have design rules
- [ ] Light/dark theme alternation documented in guidance
- [ ] Prompt output produces valid CivicTheme trees when fed to AI

## Dependencies
- TASK-375 (CivicTheme manifest)

## Files/Modules Affected
- `packages/ds-civictheme/src/prompt-fragments.ts` (new)
- `packages/ds-civictheme/src/design-rules.ts` (new)
