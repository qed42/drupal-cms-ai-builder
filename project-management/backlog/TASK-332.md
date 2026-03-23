# TASK-332: Enhance generation progress screen with gradient bar and animated status messages

**Story:** REQ-onboarding-brand-refresh
**Priority:** P1
**Estimated Effort:** M
**Milestone:** Onboarding Brand Refresh

## Description

Upgrade the generation progress screen from a simple spinner + pipeline phases to a more engaging experience with a gradient progress bar, rotating status messages, a rocket/sparkle icon, and a celebratory "Your site is ready!" completion state.

## Technical Approach

1. **Replace spinner with animated icon** in `platform-app/src/app/onboarding/progress/page.tsx`:
   - In-progress state: rocket SVG icon with a circular background and subtle pulse animation
   - Completion state: checkmark with confetti-like gradient circle
   - Error state: keep existing red alert icon

2. **Add rotating status messages**:
   - Create an array of contextual messages that rotate every 3-4 seconds:
     ```typescript
     const STATUS_MESSAGES = [
       "Analyzing your big idea...",
       "Mapping your site structure...",
       "Applying aesthetic preferences...",
       "Crafting your content...",
       "Optimizing for your audience...",
       "Assembling your pages...",
       "Adding finishing touches...",
     ];
     ```
   - Use a `useEffect` interval to cycle through messages
   - Display below the main heading with a fade transition

3. **Add gradient progress bar** below the status messages:
   - Full-width bar with gradient fill: `linear-gradient(to right, #4856FA, #01D1FF, #9E2EF8)`
   - Animate width based on `progress` percentage
   - Track background: `bg-white/10 rounded-full`
   - Bar: `h-2 rounded-full transition-all duration-700`

4. **Enhance completion state**:
   - Heading: "Your site is ready!" (matches Figma)
   - Subtitle: "We've built a custom foundation based on your vision."
   - CTA: "Enter Editor →" (maps to our "Review Your Website →")

5. **Keep existing PipelineProgress component** as a detailed breakdown below the main progress bar (collapsible or secondary).

## Acceptance Criteria

- [ ] Rocket/sparkle icon replaces spinner during generation
- [ ] Status messages rotate every 3-4 seconds with fade transition
- [ ] Gradient progress bar fills smoothly based on generation progress
- [ ] Completion state shows "Your site is ready!" with updated messaging
- [ ] Error state still shows clear error message and retry button
- [ ] Provisioning progress still displays correctly when in provisioning phase
- [ ] PipelineProgress component still accessible (detailed breakdown)
- [ ] Animation performance: no layout shifts, smooth transitions

## Dependencies
- TASK-328 (color palette)
- TASK-329 (button styles)

## Files/Modules Affected
- `platform-app/src/app/onboarding/progress/page.tsx`
- `platform-app/src/components/onboarding/PipelineProgress.tsx` (may need minor style updates)
