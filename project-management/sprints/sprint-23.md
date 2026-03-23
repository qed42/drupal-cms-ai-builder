# Sprint 23: Onboarding Brand Refresh — Blue/Purple/Cyan Palette & UI Polish

**Milestone:** M17 — Onboarding Brand Refresh
**Duration:** 3 days
**Predecessor:** Sprint 22 (v2 Pipeline Stabilization)
**Requirement:** REQ-onboarding-brand-refresh
**Status:** PLANNED (2026-03-21) — First attempt reverted due to Tailwind v4 @theme color rendering issues. Needs investigation before re-implementing.

## Sprint Goal

Migrate the onboarding portal's visual identity from the teal-centric palette to the new blue/purple/cyan triad per the Figma design prototype, and refine UI patterns (inputs, buttons, progress screen) for a more premium, AI-forward feel.

## Tasks

### Day 1: Foundation + Quick Wins (Parallel Tracks A & B)

| ID | Task | Priority | Effort | Assignee | Status | Track |
|----|------|----------|--------|----------|--------|-------|
| TASK-328 | Migrate color palette from teal to blue/purple/cyan triad | P0 | M | `/dev` | Planned | A |
| TASK-331 | Add contextual CTA labels per onboarding step | P1 | S | `/dev` | Planned | B |

**Rationale:** These two tasks have zero dependency on each other. TASK-328 changes CSS variables and gradient definitions; TASK-331 changes button label strings. A single developer can work them sequentially in one sitting, or two devs can work in parallel.

### Day 2: Component Styling (Depends on TASK-328)

| ID | Task | Priority | Effort | Assignee | Status | Track |
|----|------|----------|--------|----------|--------|-------|
| TASK-329 | Update ProgressDots and button styles with gradient treatment | P0 | S | `/dev` | Planned | A |
| TASK-333 | Update selection components with new brand colors | P1 | S | `/dev` | Planned | A |
| TASK-330 | Restyle input fields with bottom-border and gradient focus underline | P1 | M | `/dev` | Planned | B |

**Rationale:** After the palette swap lands, these three tasks apply the new colors to specific component categories. TASK-329 and TASK-333 are both small and touch different files, so they can be done back-to-back quickly. TASK-330 is a bit more involved (touches every form step) and runs in a parallel track.

### Day 3: Enhancement + Polish

| ID | Task | Priority | Effort | Assignee | Status | Track |
|----|------|----------|--------|----------|--------|-------|
| TASK-332 | Enhance generation progress screen with gradient bar and animated messages | P1 | M | `/dev` | Planned | A |
| TASK-334 | Add animated hero element to onboarding start page | P2 | S | `/dev` | Planned | B |

**Rationale:** These are the higher-effort polish items. TASK-332 is the most impactful (the generation screen is what users stare at for 2-3 minutes). TASK-334 is a nice-to-have that creates a strong first impression — if time runs short, it can be deferred.

## Execution Plan

```
Day 1 (parallel — no dependencies between A and B):
  Track A: TASK-328 (Color Palette Migration)
    1. Update globals.css: replace teal scale with blue, add accent vars
    2. Update onboarding layout.tsx: deep navy background
    3. Update StepIcon.tsx: new gradient combos
    4. Grep sweep: verify no hardcoded teal hex codes remain
    → All components using bg-brand-*, text-brand-*, border-brand-*
      automatically get new colors after this

  Track B: TASK-331 (Contextual CTA Labels)
    1. Extend onboarding-steps.ts with nextLabel field
    2. Add getNextLabel() helper
    3. Update each step page's buttonLabel prop
    4. Update start page CTA text

Day 2 (parallel — both depend on TASK-328, independent of each other):
  Track A: TASK-329 + TASK-333 (Progress + Selection Components)
    1. Update ProgressDots with gradient active indicator
    2. Update StepLayout button styles (solid blue CTA, outlined Back)
    3. Verify DesignOptionCard, PageChip, tone cards auto-picked up
       new colors; fix any that didn't
    4. Update ColorSwatch default palette to triad colors
    5. Update progress page spinner/bar colors

  Track B: TASK-330 (Input Field Restyling)
    1. Add .input-onboarding utility class to globals.css
    2. Update name, idea, audience, follow-up, tone step inputs
    3. Add sparkle icon to idea textarea
    4. Verify all validation states still work

Day 3 (parallel — both depend on Day 1+2):
  Track A: TASK-332 (Progress Screen Enhancement)
    1. Replace spinner with rocket/sparkle icon
    2. Add rotating status messages with fade transition
    3. Add gradient progress bar
    4. Update completion state messaging

  Track B: TASK-334 (Hero Animation) — STRETCH GOAL
    1. Create CSS-only gradient bar animation
    2. Add to start page above heading
    3. Respect prefers-reduced-motion
```

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| Small (S) | 3 | TASK-329, TASK-331, TASK-333, TASK-334 |
| Medium (M) | 3 | TASK-328, TASK-330, TASK-332 |
| **Total** | **7 tasks** | 4S + 3M |

## Scope Boundaries

### In Scope
- Color palette migration (teal → blue/purple/cyan)
- Input field restyling (bottom-border pattern)
- Button and progress indicator updates
- Contextual CTA labels
- Progress screen enhancement
- Start page hero animation

### Explicitly Out of Scope
- **AI Understanding Card** — This is a feature addition (new component, state management, dynamic messaging), not a styling change. Requires its own requirement and sprint.
- **Light background for brand step** — Needs design discussion on visual continuity. Deferred.
- **Step flow changes** — The 11-step flow stays as-is per PO direction.
- **Font/page selector redesign** — Our existing components are functionally superior to the Figma prototype.
- **Dashboard or non-onboarding pages** — This sprint is scoped to the onboarding flow only. Dashboard will need its own color refresh pass.

### Stretch (If Time Permits)
- TASK-334 (hero animation) can be dropped without impacting the sprint goal

## Dependencies & Risks

1. **Sprint 22 must be complete** — If Sprint 22 pipeline stabilization work changes onboarding components, we'd be working on a moving target. Sprint 23 should start after Sprint 22 is merged.

2. **Cascade to non-onboarding pages** — The `globals.css` palette change (TASK-328) affects ALL pages using `brand-*` classes, not just onboarding. The dashboard, review page, and auth pages will automatically pick up the new colors. This is intentional but needs visual spot-checking.

3. **Test suite impact** — If any Playwright or unit tests assert on specific color values (unlikely but possible), they'll break after TASK-328. Run the full test suite after Day 1.

4. **`border-image` browser support** — The gradient underline in TASK-330 uses `border-image`, which has good but not universal support. Verify on Chrome, Firefox, Safari. Fallback: solid brand-500 underline.

## Definition of Done

### Color Palette (TASK-328)
- [ ] brand-500 resolves to `#4856FA` in computed styles
- [ ] accent-purple and accent-cyan available as Tailwind utilities
- [ ] No teal hex codes in onboarding files
- [ ] Deep navy background on all onboarding pages

### Buttons & Progress (TASK-329)
- [ ] Primary CTA: solid blue with white text
- [ ] Back button: outlined pill style
- [ ] Active progress dot: gradient bar
- [ ] Progress page uses new brand colors

### Input Fields (TASK-330)
- [ ] Bottom-border-only inputs on all form steps
- [ ] Gradient underline on focus
- [ ] Sparkle icon on idea textarea
- [ ] No form validation regressions

### CTA Labels (TASK-331)
- [ ] Each step shows contextual forward label
- [ ] Arrow icon on all forward CTAs
- [ ] Start page reads "Start Building"
- [ ] Final step reads "Build My Site"

### Selection Components (TASK-333)
- [ ] All selected states use blue accent
- [ ] Default color palette shows triad colors
- [ ] No teal accents in any selection UI

### Progress Screen (TASK-332)
- [ ] Rocket/sparkle icon during generation
- [ ] Rotating status messages with transitions
- [ ] Gradient progress bar
- [ ] "Your site is ready!" completion state

### Hero Animation (TASK-334)
- [ ] Animated gradient bars on start page
- [ ] prefers-reduced-motion respected
- [ ] CSS-only, no layout thrash

### Sprint-Level
- [ ] All 421+ unit tests pass
- [ ] No TypeScript compilation errors
- [ ] Visual spot-check: dashboard and auth pages still look correct with new palette
- [ ] Code committed with descriptive messages per task
- [ ] Sprint output report created
