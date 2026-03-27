# TASK-472: Migrate DesignOptionCard to shadcn RadioGroup

**Story:** US-092
**Priority:** P2
**Estimated Effort:** M
**Milestone:** M24 — UI Component System (Phase 2)

## Description

Replace the button-based selection pattern in DesignOptionCard (used on theme and design steps) with shadcn RadioGroup for proper radio semantics and keyboard arrow-key navigation.

## Technical Approach

1. Install: `npx shadcn@latest add radio-group --yes`
2. Read `src/components/onboarding/DesignOptionCard.tsx` and the theme/design step pages
3. Wrap options in `<RadioGroup>` with `<RadioGroupItem>` per option
4. Preserve visual card appearance using custom styling on RadioGroupItem
5. Ensure arrow key navigation works between options

## Acceptance Criteria

- [ ] Theme and design steps use RadioGroup for option selection
- [ ] Arrow key navigation between options
- [ ] Selected state visually matches current design
- [ ] Screen readers announce selection correctly

## Dependencies

- TASK-465 (DONE)

## Files Affected

- `platform-app/src/components/ui/radio-group.tsx` (new)
- `platform-app/src/components/onboarding/DesignOptionCard.tsx`
- `platform-app/src/app/onboarding/theme/page.tsx`
- `platform-app/src/app/onboarding/design/page.tsx`
