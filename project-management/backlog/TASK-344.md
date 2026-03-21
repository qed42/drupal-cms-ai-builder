# TASK-344: ProgressStepper Component

**Story:** US-063
**Priority:** P0
**Estimated Effort:** S
**Milestone:** M18 — UX Revamp

## Description
Replace the existing `ProgressDots` with a labeled section-based progress stepper showing named phases: Vision → Design → Content → Launch. Each section groups multiple steps and shows completion state.

## Technical Approach
1. Define step-to-section mapping in `onboarding-steps.ts`:
   ```ts
   export const STEP_SECTIONS = [
     { name: "Vision", steps: ["start", "name", "idea", "audience"] },
     { name: "Design", steps: ["pages", "design", "brand", "fonts"] },
     { name: "Content", steps: ["follow-up", "tone"] },
     { name: "Launch", steps: ["review-settings"] },
   ];
   ```
2. Create `ProgressStepper.tsx` with detailed visual spec:

   **Desktop (≥768px):**
   ```
     Vision ──── Design ──── Content ──── Launch
       ●━━━━━━━━━━○━━━━━━━━━━○━━━━━━━━━━○
       ✓           2 of 4      ·           ·
   ```
   - `●` = completed section (filled circle, `brand-500` fill)
   - `○` = active section (ring with inner dot, subtle pulse animation)
   - `·` = upcoming section (dimmed dot, `white/20`)
   - `━` = connector line (filled = completed, `white/10` = future)
   - Section label positioned ABOVE the dot
   - Step fraction (e.g., "2 of 4") positioned BELOW the active dot only

   **Mobile (<768px):**
   ```
     Design · Step 2 of 4
     [============================--------]
   ```
   - Single line: active section name + step fraction
   - Horizontal progress bar (filled portion = overall progress)
   - No dots on mobile — too small to be useful

3. Update `StepLayout.tsx` to use `ProgressStepper` instead of `ProgressDots`
4. Keep `ProgressDots` temporarily for backward compatibility but mark deprecated

## Acceptance Criteria
- [ ] `ProgressStepper` renders four labeled sections with dots and connector lines (desktop)
- [ ] Three visual states: completed (filled `brand-500`), active (ring + pulse), upcoming (dimmed)
- [ ] Step fraction shown BELOW active section dot only
- [ ] Mobile: single-line label + horizontal progress bar (no dots)
- [ ] Connector lines visually distinguish completed vs. future segments
- [ ] Integrated into `StepLayout.tsx`

## Dependencies
- None

## Files/Modules Affected
- `platform-app/src/lib/onboarding-steps.ts`
- `platform-app/src/components/onboarding/ProgressStepper.tsx` (new)
- `platform-app/src/components/onboarding/StepLayout.tsx`
