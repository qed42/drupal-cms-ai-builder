# TASK-353: Animation Polish & Transitions

**Story:** US-063
**Priority:** P2
**Estimated Effort:** M
**Milestone:** M18 — UX Revamp

## Description
Add polish animations and transitions throughout the onboarding flow to create a premium feel. Focus on step transitions, insight card entrances, preview pane updates, and the progress stepper.

## Technical Approach
1. **Step transitions**: Add page transition animation between onboarding steps (fade + slide)
   - Use `framer-motion` `AnimatePresence` or CSS-only transitions
   - Direction-aware: forward slides left, back slides right
2. **Insight card entrance**: Fade-in + slide-up when insight data becomes available
3. **Preview pane updates**: Smooth CSS transitions on color/section changes (already debounced)
4. **Progress stepper**: Animated fill on section completion, smooth indicator movement
5. **Generation screen**: Enhanced `PipelineProgress` with step-by-step reveal animation
6. Keep all animations under 300ms for snappiness
7. Respect `prefers-reduced-motion` media query — disable animations when set

## Acceptance Criteria
- [ ] Smooth transitions between onboarding steps
- [ ] Insight cards animate on entrance
- [ ] Preview updates have smooth transitions
- [ ] Progress stepper animates section completion
- [ ] `prefers-reduced-motion` disables all animations
- [ ] No janky or dropped frames

## Dependencies
- TASK-351 (preview pane integration complete)

## Files/Modules Affected
- `platform-app/src/components/onboarding/StepLayout.tsx`
- `platform-app/src/components/onboarding/AiInsightCard.tsx`
- `platform-app/src/components/onboarding/SiteSkeletonPreview.tsx`
- `platform-app/src/components/onboarding/ProgressStepper.tsx`
- `platform-app/src/components/onboarding/PipelineProgress.tsx`
