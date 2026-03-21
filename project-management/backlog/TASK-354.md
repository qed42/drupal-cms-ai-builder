# TASK-354: Cross-Browser QA & Color Verification

**Story:** US-063
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M18 — UX Revamp

## Description
Comprehensive cross-browser testing of the entire UX revamp. Verify that the new color palette, split-pane layout, AI insight cards, preview pane, and animations work correctly across Chrome, Firefox, and Safari on desktop and mobile viewports.

## Technical Approach
1. Create Playwright test suite for visual regression:
   - Capture screenshots of each onboarding step at desktop (1440px) and mobile (375px) viewports
   - Compare color rendering: verify `bg-brand-500` computed style matches expected hex
   - Test split-pane layout at breakpoint boundary (1024px)
2. Manual test checklist:
   - Chrome (latest): all steps, desktop + mobile
   - Firefox (latest): all steps, desktop + mobile
   - Safari (latest): all steps, desktop + mobile (CSS custom property edge cases)
3. Specific color verification:
   - Inspect computed styles for `bg-brand-*` classes in each browser
   - Verify WCAG AA contrast ratios for text on brand colors
4. Layout verification:
   - Split-pane renders at ≥1024px, single-column at <1024px
   - No horizontal overflow on any viewport width
5. Animation verification:
   - `prefers-reduced-motion` test
   - No janky transitions

## Acceptance Criteria
- [ ] All steps render correctly in Chrome, Firefox, Safari
- [ ] Color palette matches expected hex values across all browsers
- [ ] Split-pane breakpoint works correctly
- [ ] No horizontal overflow at any viewport width
- [ ] WCAG AA contrast ratios met for all text/background combinations
- [ ] Playwright visual regression tests pass

## Dependencies
- TASK-343 (color palette), TASK-353 (animations)

## Files/Modules Affected
- `platform-app/tests/` (new test files)
