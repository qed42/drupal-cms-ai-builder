# TASK-481: Update Step Config, Routing & ProgressStepper for 8-Step Flow

**Status:** TODO
**Priority:** High
**Sprint:** 49
**Architecture:** architecture-onboarding-ux-modernization.md (ADR-1, §3.1)
**Depends on:** TASK-478, TASK-479, TASK-480

## Description

After all composite pages are built, update the central step configuration and ProgressStepper to reflect the new 8-step flow.

## Tasks

1. **Update `onboarding-steps.ts`:**
   ```typescript
   export const ONBOARDING_STEPS = [
     { slug: "start",           label: "Get Started" },
     { slug: "describe",        label: "Your Business" },
     { slug: "style",           label: "Style & Tone" },
     { slug: "brand",           label: "Brand Identity" },
     { slug: "pages",           label: "Site Pages" },
     { slug: "images",          label: "Your Photos" },
     { slug: "details",         label: "Content Details" },
     { slug: "review-settings", label: "Review & Launch" },
   ] as const;

   export const STEP_SECTIONS = [
     { name: "Your Business", steps: ["start", "describe"] },
     { name: "Design",        steps: ["style", "brand"] },
     { name: "Content",       steps: ["pages", "images", "details"] },
     { name: "Launch",        steps: ["review-settings"] },
   ] as const;
   ```

2. **Rename follow-up route** — `src/app/onboarding/follow-up/` → `src/app/onboarding/details/`
   - Add redirect from `/onboarding/follow-up` → `/onboarding/details`

3. **Add redirect routes** for all removed step slugs:
   - `/onboarding/name` → `/onboarding/describe`
   - `/onboarding/idea` → `/onboarding/describe`
   - `/onboarding/audience` → `/onboarding/describe`
   - `/onboarding/theme` → `/onboarding/style`
   - `/onboarding/design` → `/onboarding/style`
   - `/onboarding/tone` → `/onboarding/style`
   - `/onboarding/fonts` → `/onboarding/brand`
   - `/onboarding/follow-up` → `/onboarding/details`

4. **Update ProgressStepper** for 8 steps:
   - Desktop: 4 sections with 1-3 dots each (more spacious)
   - Mobile: cleaner fraction display ("Step 3 of 8")
   - With fewer steps, can show step labels on desktop (not just section names)

5. **Update start page CTA** — ensure it navigates to `/onboarding/describe` (was `/onboarding/theme`)

6. **Update resume logic** — `/api/onboarding/resume` must map old step slugs to new ones for existing sessions

7. **Full regression test** — navigate complete flow start to review-settings

## Acceptance Criteria

- [ ] 8 steps displayed in ProgressStepper
- [ ] All old URLs redirect correctly
- [ ] Forward/back navigation works through all 8 steps
- [ ] Resume from saved session maps to correct new step
- [ ] Mobile progress bar scales correctly (1/8 = 12.5% per step)
