# TASK-467: Migrate Form Inputs to shadcn Input/Textarea/Select

**Story:** US-092
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M24 — UI Component System

## Description

Replace raw `<input>`, `<textarea>`, and `<select>` elements with shadcn equivalents. The biggest win is FontSelector's native `<select>` → shadcn `Select` with keyboard navigation, search, and custom styling.

## Technical Approach

1. Install shadcn components: `npx shadcn@latest add input textarea select label`
2. Customize components for dark theme:
   - Background: `bg-white/5` (matching current card bg)
   - Border: `border-white/10`, focus: `ring-brand-500`
   - Text: `text-white`, placeholder: `text-white/40`
3. Migrate `<textarea>` instances:
   - `idea/page.tsx` — business idea input
   - `audience/page.tsx` — audience description
   - `name/page.tsx` — business name (if textarea)
   - `follow-up/page.tsx` — dynamic question inputs
   - `tone/page.tsx` — differentiator inputs
4. Migrate FontSelector from native `<select>` to shadcn `Select`:
   - Add `SelectTrigger`, `SelectContent`, `SelectItem`
   - Support scrollable font list with search/filter
   - Keyboard arrow navigation, type-ahead
5. Migrate `<input type="color">` in ColorSwatch — keep native (shadcn has no color picker)
6. Add `<Label>` component for proper label-input association where missing

## Acceptance Criteria

- [ ] All text inputs/textareas use shadcn components
- [ ] FontSelector uses shadcn Select with keyboard navigation
- [ ] Focus ring color matches brand-500
- [ ] Label-input association via htmlFor/id on all form fields
- [ ] Tab order is correct across all onboarding steps
- [ ] Character count and validation feedback preserved

## Dependencies

- TASK-465

## Files Affected

- `platform-app/src/components/ui/input.tsx` (new)
- `platform-app/src/components/ui/textarea.tsx` (new)
- `platform-app/src/components/ui/select.tsx` (new)
- `platform-app/src/components/ui/label.tsx` (new)
- `platform-app/src/components/onboarding/FontSelector.tsx`
- `platform-app/src/app/onboarding/idea/page.tsx`
- `platform-app/src/app/onboarding/audience/page.tsx`
- `platform-app/src/app/onboarding/name/page.tsx`
- `platform-app/src/app/onboarding/follow-up/page.tsx`
- `platform-app/src/app/onboarding/tone/page.tsx`
