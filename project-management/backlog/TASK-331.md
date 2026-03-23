# TASK-331: Add contextual CTA labels per onboarding step

**Story:** REQ-onboarding-brand-refresh
**Priority:** P1
**Estimated Effort:** S
**Milestone:** Onboarding Brand Refresh

## Description

Replace the generic "Continue" button labels with step-specific contextual labels that tell the user what comes next. This creates forward momentum and reduces anxiety about the unknown next step.

## Technical Approach

1. **Extend `platform-app/src/lib/onboarding-steps.ts`**:
   - Add a `nextLabel` field to each step definition:
   ```typescript
   export const ONBOARDING_STEPS = [
     { slug: "start", label: "Welcome", nextLabel: "Start Building" },
     { slug: "name", label: "Project Name", nextLabel: "Define Your Vision" },
     { slug: "idea", label: "Big Idea", nextLabel: "Your Audience" },
     { slug: "audience", label: "Audience", nextLabel: "Plan the Structure" },
     { slug: "pages", label: "Page Map", nextLabel: "Shape the Experience" },
     { slug: "design", label: "Design Source", nextLabel: "Give It a Face" },
     { slug: "brand", label: "Brand", nextLabel: "Select a Font" },
     { slug: "fonts", label: "Fonts", nextLabel: "Final Details" },
     { slug: "follow-up", label: "Details", nextLabel: "Set Your Tone" },
     { slug: "tone", label: "Tone & Voice", nextLabel: "Review & Generate" },
     { slug: "review-settings", label: "Review & Generate", nextLabel: "Build My Site" },
   ] as const;
   ```

2. **Add a `getNextLabel` helper**:
   ```typescript
   export function getNextLabel(slug: string): string {
     const step = ONBOARDING_STEPS.find(s => s.slug === slug);
     return step?.nextLabel || "Continue";
   }
   ```

3. **Update each step page** to use the contextual label instead of hardcoded "Continue":
   - Each page currently passes `buttonLabel="Continue"` to `StepLayout`
   - Change to use `getNextLabel(stepSlug)` or pass the label from step config

4. **The start page** is a special case — it doesn't use StepLayout. Update its CTA to "Start Building →".

## Acceptance Criteria

- [ ] Each onboarding step shows a contextual next-step label on its CTA button
- [ ] Labels clearly communicate what the next step is about
- [ ] The `→` arrow icon is present on all forward CTAs
- [ ] Start page CTA reads "Start Building"
- [ ] Final step (review-settings) CTA reads "Build My Site"
- [ ] Type safety maintained — `nextLabel` included in step type

## Dependencies
- None (can be done in parallel with TASK-328)

## Files/Modules Affected
- `platform-app/src/lib/onboarding-steps.ts`
- `platform-app/src/app/onboarding/start/page.tsx`
- `platform-app/src/app/onboarding/name/page.tsx`
- `platform-app/src/app/onboarding/idea/page.tsx`
- `platform-app/src/app/onboarding/audience/page.tsx`
- `platform-app/src/app/onboarding/pages/page.tsx`
- `platform-app/src/app/onboarding/design/page.tsx`
- `platform-app/src/app/onboarding/brand/page.tsx`
- `platform-app/src/app/onboarding/fonts/page.tsx`
- `platform-app/src/app/onboarding/follow-up/page.tsx`
- `platform-app/src/app/onboarding/tone/page.tsx`
- `platform-app/src/app/onboarding/review-settings/page.tsx`
