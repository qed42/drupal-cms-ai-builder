# TASK-106: Wizard Screen 5 — Design Source Selection

**Story:** US-007 (Brand Input)
**Priority:** P0
**Estimated Effort:** S
**Milestone:** M2 — Onboarding Journey

## Description
Implement Screen 5: "How should it feel?" — two-option card selection: "Provide Figma details" or "Let Space AI choose". For MVP, only "Let Space AI choose" is functional; Figma import is displayed but disabled/greyed with "Coming soon".

## Technical Approach
- **Screen (`/onboarding/design`):**
  - Title: "How should it feel?"
  - Subtitle: "We can follow your exact design, or craft a look that fits your vision."
  - Two selectable cards side-by-side:
    1. "Provide Figma details" — Figma icon, subtitle "Upload your design or paste a URL". Card has "Coming soon" badge, not selectable for MVP.
    2. "Let Space AI choose" — AI icon, subtitle "We'll generate a template based on your answers". Selectable, default selected.
  - Button: "Shape the Experience →"
  - Save `design_source: "ai"` (or "figma" post-MVP) to onboarding_sessions.data

## Acceptance Criteria
- [ ] Two cards render side-by-side matching Figma
- [ ] "Let Space AI choose" is selectable and default
- [ ] "Provide Figma details" shows "Coming soon" and is non-selectable
- [ ] Selection saved to onboarding_sessions.data.design_source
- [ ] Selecting Figma card does NOT proceed (MVP)

## Dependencies
- TASK-102 (Wizard framework)

## Files/Modules Affected
- `platform-app/src/app/(onboarding)/design/page.tsx`
- `platform-app/src/components/onboarding/DesignOptionCard.tsx`
