# TASK-477: Quick Wins — Hover States, Accessibility, Micro-Animations

**Status:** TODO
**Priority:** Medium
**Sprint:** 47
**Architecture:** architecture-onboarding-ux-modernization.md §Quick Wins

## Description

Collection of low-effort, high-impact polish improvements identified in the design review.

## Tasks

### Hover States
1. Add `hover:scale-[1.02] transition-transform duration-200` to interactive cards:
   - `DesignOptionCard.tsx` (design selection)
   - Theme cards in `theme/page.tsx`
   - Tone cards in `tone/page.tsx`
   - Page cards in `pages/page.tsx`
   - SiteCard in dashboard

### Accessibility
2. Add `role="button" tabIndex={0}` to `FileUploadZone.tsx` drag-and-drop div
3. Add keyboard handler (`onKeyDown` for Enter/Space) to trigger file picker
4. Ensure all upload zones are reachable via Tab key

### Micro-Animations
5. Add scale-bounce on ProgressStepper dot when completing a step:
   - CSS: `@keyframes step-complete { 0% { transform: scale(1) } 50% { transform: scale(1.4) } 100% { transform: scale(1) } }`
   - Apply via class when step transitions from active → completed
6. Add checkmark animation on progress page completion:
   - The emerald checkmark icon should scale-in with a slight bounce (200ms)

### Skeleton Loading
7. Add `Skeleton` component usage when AI suggestions load in:
   - `audience/page.tsx` (suggestion pills area)
   - `pages/page.tsx` (page cards during initial load)

## Acceptance Criteria

- [ ] Cards have subtle scale on hover (no visual regression)
- [ ] Upload zones keyboard-accessible (Tab + Enter opens file picker)
- [ ] Step completion has brief animation
- [ ] AI loading areas show skeleton instead of just spinner text
- [ ] All animations respect `prefers-reduced-motion`
