# TASK-334: Add animated hero element to onboarding start page

**Story:** REQ-onboarding-brand-refresh
**Priority:** P2
**Estimated Effort:** S
**Milestone:** Onboarding Brand Refresh

## Description

Add an animated visual element to the onboarding start/welcome page inspired by the Figma design's gradient bars animation. The Figma prototype shows vertical bars with a purple-to-cyan gradient that animate with a subtle motion effect, creating an AI-forward first impression.

## Technical Approach

1. **Create a CSS-only animated element** in `platform-app/src/app/onboarding/start/page.tsx`:
   - 5-7 vertical bars of varying heights
   - Each bar uses a gradient from `#9E2EF8` (purple) to `#01D1FF` (cyan)
   - Subtle float/bounce animation with staggered delays per bar
   - CSS `@keyframes` defined in globals.css or inline

2. **Animation spec**:
   ```css
   @keyframes float-bar {
     0%, 100% { transform: translateY(0); }
     50% { transform: translateY(-12px); }
   }
   ```
   - Each bar: `animation: float-bar 2.5s ease-in-out infinite`
   - Stagger: `animation-delay: 0s, 0.2s, 0.4s, 0.6s, 0.8s`
   - Bar widths: 4-8px, heights: 40-80px, rounded-full
   - Slight rotation variation for organic feel

3. **Place above the heading** on the start page, replacing or augmenting the current StepIcon for this step.

4. **Performance considerations**:
   - Use `transform` only (GPU-accelerated, no layout thrash)
   - Add `will-change: transform` to animated elements
   - Respect `prefers-reduced-motion` — disable animation for users who prefer reduced motion

## Acceptance Criteria

- [ ] Start page shows animated gradient bars above the heading
- [ ] Bars use purple-to-cyan gradient from the new palette
- [ ] Animation is smooth with staggered timing
- [ ] `prefers-reduced-motion` query disables animation
- [ ] No performance impact (CSS transforms only, no JS animation)
- [ ] Visual impression: "premium, AI-forward, inviting"

## Dependencies
- TASK-328 (color palette for gradient colors)

## Files/Modules Affected
- `platform-app/src/app/onboarding/start/page.tsx`
- `platform-app/src/app/globals.css` (keyframes if not inline)
