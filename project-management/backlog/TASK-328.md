# TASK-328: Migrate color palette from teal to blue/purple/cyan triad

**Story:** REQ-onboarding-brand-refresh
**Priority:** P0
**Estimated Effort:** M
**Milestone:** Onboarding Brand Refresh

## Description

Replace the teal-centric brand palette with the new blue/purple/cyan color triad derived from the Figma design prototype. This is the foundational styling change that all other brand refresh tasks build upon.

## Technical Approach

1. **Update `platform-app/src/app/globals.css`**:
   - Replace `--color-brand-*` teal scale (50→950) with a new scale generated from `#4856FA` (blue)
   - Add new accent color variables:
     - `--color-accent-purple`: `#9E2EF8`
     - `--color-accent-cyan`: `#01D1FF`
   - Add gradient utility variables:
     - `--gradient-brand`: `linear-gradient(to right, #4856FA, #9E2EF8, #01D1FF)`

2. **Generate the new brand-* scale** from `#4856FA`:
   - brand-50 through brand-950, consistent with Tailwind shade generation
   - Ensure sufficient contrast ratios for accessibility (brand-500 on dark bg must meet WCAG AA)

3. **Update `platform-app/src/app/onboarding/layout.tsx`**:
   - Change background gradient from `from-[#0f172a] via-[#1e293b] to-[#0f172a]` (slate) to a deeper navy: `from-[#060B22] via-[#0B1437] to-[#060B22]`

4. **Update `platform-app/src/components/onboarding/StepIcon.tsx`**:
   - Replace step-specific gradient colors to align with the new triad:
     - `from-brand-400 to-brand-600` stays (now blue instead of teal)
     - `from-sky-400 to-blue-600` → keep (aligns with new palette)
     - `from-amber-400 to-orange-600` → `from-accent-purple to-brand-500`
     - `from-violet-400 to-violet-600` → keep (aligns with purple accent)
     - `from-emerald-400 to-green-600` → `from-accent-cyan to-brand-500`
     - `from-pink-400 to-rose-600` → `from-accent-purple to-accent-cyan`
     - `from-cyan-400 to-teal-600` → `from-accent-cyan to-brand-600`
     - `from-fuchsia-400 to-pink-600` → `from-accent-purple to-brand-500`

5. **Verify no hardcoded teal references** remain in onboarding components:
   - Search for `#14b8a6`, `#0d9488`, `#0f766e`, `teal` across `platform-app/src/`

## Acceptance Criteria

- [ ] `globals.css` brand-500 resolves to `#4856FA` (blue)
- [ ] accent-purple (`#9E2EF8`) and accent-cyan (`#01D1FF`) available as Tailwind utilities
- [ ] Onboarding background uses deep navy gradient
- [ ] StepIcon gradients use new palette colors
- [ ] All `bg-brand-*`, `text-brand-*`, `border-brand-*` usages render in blue tones
- [ ] No teal hex codes remain in onboarding-related files
- [ ] Visual review: all onboarding steps render correctly with new colors

## Dependencies
- None (foundational task)

## Files/Modules Affected
- `platform-app/src/app/globals.css`
- `platform-app/src/app/onboarding/layout.tsx`
- `platform-app/src/components/onboarding/StepIcon.tsx`
- Any component with hardcoded teal hex values
