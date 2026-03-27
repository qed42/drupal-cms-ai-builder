# TASK-473: Add shadcn Tooltip Component

**Story:** US-092
**Priority:** P3
**Estimated Effort:** S
**Milestone:** M24 — UI Component System (Phase 2)

## Description

Replace native `title` attributes on ColorSwatch and ViewToggle with shadcn Tooltip for accessible, styled, delay-aware tooltips.

## Technical Approach

1. Install: `npx shadcn@latest add tooltip --yes`
2. Wrap existing `title`-using elements with `<TooltipProvider>` + `<Tooltip>` + `<TooltipTrigger>` + `<TooltipContent>`
3. Remove `title` attributes (replaced by TooltipContent)
4. Add `<TooltipProvider>` to root layout or wrap locally

## Acceptance Criteria

- [ ] ColorSwatch shows styled tooltip on hover
- [ ] ViewToggle buttons show "Grid view" / "List view" tooltips
- [ ] Tooltips are keyboard accessible (show on focus)
- [ ] Dark theme styling applied

## Dependencies

- TASK-465 (DONE)

## Files Affected

- `platform-app/src/components/ui/tooltip.tsx` (new)
- `platform-app/src/components/onboarding/ColorSwatch.tsx`
- `platform-app/src/components/dashboard/ViewToggle.tsx`
