# TASK-456: Fix Progress Stepper Alignment Jumps Between Layout Modes

**Story:** US-090
**Effort:** S
**Milestone:** M20 — AI Transparency (bug fix)
**Severity:** Major

## Bug Description
The progress stepper shifts position when transitioning between centered-mode and split-mode steps, creating a jarring visual jump during navigation.

## Implementation Details
1. Inspect stepper positioning in both centered and split modes
2. Ensure stepper is consistently positioned (likely needs to be outside the grid, in a fixed position relative to the viewport or page container)
3. Consider keeping stepper at a consistent width/position regardless of layout mode

## Acceptance Criteria
- [ ] Progress stepper does not shift position when navigating between centered and split steps
- [ ] Stepper remains visually consistent across all layout modes

## Files
- `platform-app/src/components/onboarding/StepLayout.tsx`
