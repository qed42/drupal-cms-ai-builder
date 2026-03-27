# TASK-466: Migrate Buttons to shadcn Button Component

**Story:** US-092
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M24 — UI Component System

## Description

Replace all ad-hoc button implementations across onboarding and dashboard pages with the shadcn `Button` component. Define variant and size mappings that match the existing visual style.

## Technical Approach

1. Customize `src/components/ui/button.tsx` variants:
   - `default` — primary brand gradient (current CTA style)
   - `secondary` — white/10 background with border (current secondary style)
   - `ghost` — transparent with hover (back buttons, text actions)
   - `destructive` — red variant for delete actions
   - Sizes: `sm`, `default`, `lg`, `icon`
2. Audit all button instances across the codebase:
   - Onboarding: StepLayout next/back buttons, start page CTA, theme/design option buttons
   - Dashboard: AddNewSiteButton, SiteCard action buttons, ViewToggle
   - Auth: login/register submit buttons
3. Replace each `<button className="...">` with `<Button variant="..." size="...">`
4. Preserve loading spinner patterns — Button supports `disabled` + children swap
5. Remove orphaned Tailwind button classes

## Component Specification

```tsx
// Variant mapping from current patterns
<Button variant="default">        // gradient bg, white text (CTAs)
<Button variant="secondary">      // bg-white/10, border (secondary actions)
<Button variant="ghost">          // transparent (back, cancel)
<Button variant="ghost" size="icon"> // icon-only buttons (close, toggle)
```

## Acceptance Criteria

- [ ] All `<button>` elements in onboarding pages use shadcn Button
- [ ] All `<button>` elements in dashboard pages use shadcn Button
- [ ] All `<button>` elements in auth pages use shadcn Button
- [ ] Button sizing is consistent: sm (compact UI), default (forms), lg (CTAs)
- [ ] Loading states preserved (spinner + disabled)
- [ ] Keyboard focus rings match brand color
- [ ] No visual regression in existing flows

## Dependencies

- TASK-465

## Files Affected

- `platform-app/src/components/ui/button.tsx` (customize variants)
- `platform-app/src/components/onboarding/StepLayout.tsx`
- `platform-app/src/components/dashboard/AddNewSiteButton.tsx`
- `platform-app/src/components/dashboard/SiteCard.tsx`
- `platform-app/src/components/dashboard/ViewToggle.tsx`
- `platform-app/src/app/onboarding/start/page.tsx`
- `platform-app/src/app/(auth)/login/page.tsx`
- `platform-app/src/app/(auth)/register/page.tsx`
