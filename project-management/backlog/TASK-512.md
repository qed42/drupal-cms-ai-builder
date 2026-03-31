# TASK-512: Fix BUG-053-001 — Industry-Based Generation Mode Default

**Story:** US-098 — Design Approach Selection in Onboarding
**Priority:** P2
**Effort:** S
**Milestone:** M20 — AI Transparency

## Description

The style page should default the generation mode based on the selected industry. Creative/portfolio industries should default to "code_components" (Unique & Creative); professional industries should default to "design_system" (Polished & Consistent).

## Technical Approach

1. In the style page `useEffect` resume handler, check if `generationMode` has been previously saved
2. If not saved, look at the industry from onboarding data
3. Map creative industries (photography, design, art, portfolio, creative) to `code_components`
4. All others default to `design_system`
5. Only apply on first visit — if user has explicitly chosen, respect their choice

## Acceptance Criteria

- [ ] Creative industries default to "Unique & Creative" on first visit
- [ ] Other industries default to "Polished & Consistent"
- [ ] Previously saved choice is respected on resume
- [ ] No regression in style page flow

## Dependencies

- None
