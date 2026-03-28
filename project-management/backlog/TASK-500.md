# TASK-500: Add Generation Mode to Onboarding Data & UI

**Story:** Code Components Initiative
**Priority:** P0
**Effort:** M
**Milestone:** M26 — Code Component Generation

## Description

Add `generationMode` field to OnboardingData and a "Design Approach" selection in onboarding. Users choose between "Polished & consistent" (design_system) or "Unique & creative" (code_components).

## Technical Approach

- Add `generationMode: "design_system" | "code_components"` to OnboardingData type and Prisma schema
- Add `designPreferences` object (animationLevel, visualStyle, interactivity) for code_components mode
- Create new onboarding step or add toggle to existing Style step
- Default based on industry: creative/portfolio → code_components, professional → design_system
- Update save API to persist mode selection

## Acceptance Criteria

- [ ] OnboardingData includes `generationMode` with default `"design_system"`
- [ ] UI presents two clear options with visual previews
- [ ] Selection persists across save/resume
- [ ] Existing flows default to `design_system` (backward compatible)

## Dependencies
- None

## Files to Modify

- `platform-app/src/lib/blueprint/types.ts`
- `platform-app/prisma/schema.prisma`
- `platform-app/src/app/onboarding/style/page.tsx` (or new step)
- `platform-app/src/app/api/onboarding/save/route.ts`
