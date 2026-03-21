# TASK-343: Implement Color Palette (Proven Approach)

**Story:** US-063
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M18 — UX Revamp

## Description
Implement the new brand color palette in `globals.css` using the approach proven in TASK-339's spike. Replace the teal palette with the new color scheme. Update all components that reference brand colors.

## Technical Approach
1. Apply the winning approach from TASK-339 spike to `globals.css`
2. Define the full new brand palette (50–950 scale) — colors TBD from research, likely blue/purple direction
3. Search codebase for all `brand-` color references and verify they still render correctly
4. Update `StepIcon.tsx` gradient assignments if palette hues change
5. Update `ProgressDots.tsx` (or its replacement `ProgressStepper`) brand color usage
6. Test in Turbopack dev server and production build
7. Cross-browser verify (Chrome, Firefox, Safari)
8. Remove the spike test page from TASK-339

## Acceptance Criteria
- [ ] New color palette defined in `globals.css` using proven approach
- [ ] All `bg-brand-*`, `text-brand-*`, `border-brand-*` utilities render correctly
- [ ] No visual regressions in existing components
- [ ] Colors verified in Chrome, Firefox, Safari
- [ ] Spike test page cleaned up

## Dependencies
- TASK-339 (must complete spike first — this is a hard gate)

## Files/Modules Affected
- `platform-app/src/app/globals.css`
- `platform-app/src/components/onboarding/StepIcon.tsx`
- `platform-app/src/components/onboarding/ProgressDots.tsx`
- Any component using `brand-*` Tailwind classes
