# TASK-482: Page Transitions via CSS View Transition API

**Status:** TODO
**Priority:** Medium
**Sprint:** 50
**Architecture:** architecture-onboarding-ux-modernization.md (ADR-5)
**Depends on:** TASK-481

## Description

Add smooth page transitions between onboarding steps. Currently steps swap content abruptly.

## Tasks

1. **Create transition utility** in `src/lib/view-transition.ts`:
   ```typescript
   export function navigateWithTransition(
     router: AppRouterInstance,
     path: string,
     direction: "forward" | "back" = "forward"
   ) {
     if (!document.startViewTransition) {
       router.push(path);
       return;
     }
     document.documentElement.dataset.transitionDir = direction;
     document.startViewTransition(() => router.push(path));
   }
   ```

2. **Add CSS rules** in `globals.css`:
   ```css
   ::view-transition-old(root) {
     animation: slide-out-left 200ms ease-out;
   }
   ::view-transition-new(root) {
     animation: slide-in-right 200ms ease-out;
   }
   [data-transition-dir="back"] ::view-transition-old(root) {
     animation: slide-out-right 200ms ease-out;
   }
   [data-transition-dir="back"] ::view-transition-new(root) {
     animation: slide-in-left 200ms ease-out;
   }
   @media (prefers-reduced-motion: reduce) {
     ::view-transition-old(root),
     ::view-transition-new(root) {
       animation: fade 150ms ease;
     }
   }
   ```

3. **Integrate in StepLayout.tsx** — replace `router.push()` calls with `navigateWithTransition()`
4. **Integrate in start page** — CTA button uses transition
5. **Integrate in review-settings** — back button uses reverse transition
6. **Test on Safari 18.2+, Chrome, Firefox** — verify fallback works

## Acceptance Criteria

- [ ] Steps slide left on forward navigation, right on back
- [ ] Unsupported browsers fall through to instant navigation
- [ ] `prefers-reduced-motion` shows fade-only
- [ ] No layout shift during transition
- [ ] Transition duration ≤ 200ms
