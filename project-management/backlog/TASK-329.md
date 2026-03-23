# TASK-329: Update ProgressDots and button styles with gradient treatment

**Story:** REQ-onboarding-brand-refresh
**Priority:** P0
**Estimated Effort:** S
**Milestone:** Onboarding Brand Refresh

## Description

Update the ProgressDots component and primary CTA button styles across the onboarding flow to use the new brand colors. The progress indicator should use a gradient accent and the primary CTA should be solid blue with white text.

## Technical Approach

1. **Update `platform-app/src/components/onboarding/ProgressDots.tsx`**:
   - Current step indicator: change `bg-brand-500` to a gradient bar using the brand triad
   - Completed steps: change `bg-brand-400/60` to `bg-brand-500/60`
   - Use CSS gradient via inline style or a utility class for the active dot:
     ```
     background: linear-gradient(to right, #4856FA, #01D1FF);
     ```

2. **Update `platform-app/src/components/onboarding/StepLayout.tsx`**:
   - Primary CTA button: change from `bg-white text-slate-900` to `bg-brand-500 text-white hover:bg-brand-400`
   - Add shadow: `shadow-lg shadow-brand-500/25`
   - Back button: change `text-white/60` to outlined pill: `border border-white/20 px-5 py-2.5 rounded-full text-white/70 hover:border-white/40`
   - Ensure the `→` arrow icon is retained on primary CTA

3. **Update `platform-app/src/app/onboarding/progress/page.tsx`**:
   - Spinner: change `border-brand-500/30 border-t-brand-500` to new brand blue
   - "Review Your Website" CTA: `bg-brand-500` already correct after TASK-328 palette swap
   - Provisioning progress bar: change `bg-brand-500` fill to gradient:
     ```
     background: linear-gradient(to right, #4856FA, #01D1FF, #9E2EF8)
     ```

## Acceptance Criteria

- [ ] Active progress dot shows blue→cyan gradient
- [ ] Completed dots use new brand color at reduced opacity
- [ ] Primary CTA button is solid brand-blue with white text
- [ ] Back button has subtle outlined pill style
- [ ] Progress page spinner and bars use new brand colors
- [ ] Provisioning progress bar uses triad gradient fill
- [ ] Disabled state still clearly distinguishable (opacity-40)

## Dependencies
- TASK-328 (color palette must be in place first)

## Files/Modules Affected
- `platform-app/src/components/onboarding/ProgressDots.tsx`
- `platform-app/src/components/onboarding/StepLayout.tsx`
- `platform-app/src/app/onboarding/progress/page.tsx`
- `platform-app/src/components/onboarding/PipelineProgress.tsx`
