# TASK-470: Migrate SiteCard Menu to shadcn DropdownMenu

**Story:** US-092
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M24 — UI Component System

## Description

Replace the SiteCard's custom overflow menu (manual click-outside handler, no focus trap, no keyboard navigation) with shadcn `DropdownMenu` built on Radix UI. This is the highest-impact accessibility fix in the dashboard.

## Technical Approach

1. Install: `npx shadcn@latest add dropdown-menu`
2. Customize for dark theme:
   - Background: `bg-gray-900 border-white/10`
   - Item hover: `bg-white/10`
   - Separator: `bg-white/10`
3. Refactor SiteCard menu:
   - Replace custom `showMenu` state + `useEffect` click-outside listener
   - Use `DropdownMenu` → `DropdownMenuTrigger` → `DropdownMenuContent` → `DropdownMenuItem`
   - Map existing actions: "Visit Site", "Edit Blueprint", "Delete" (with destructive variant)
   - Add `DropdownMenuSeparator` before destructive action
4. Accessibility gains (automatic from Radix):
   - Focus trap within menu when open
   - Arrow key navigation between items
   - Escape to close + focus returns to trigger
   - Type-ahead to jump to items
   - Proper `role="menu"` / `role="menuitem"` semantics

## Acceptance Criteria

- [ ] SiteCard menu uses shadcn DropdownMenu
- [ ] Keyboard: open with Enter/Space, navigate with arrows, close with Escape
- [ ] Focus returns to trigger button on close
- [ ] Delete action styled as destructive
- [ ] Menu closes on item selection
- [ ] Custom click-outside handler removed (Radix handles this)
- [ ] Visual style matches dark theme

## Dependencies

- TASK-465

## Files Affected

- `platform-app/src/components/ui/dropdown-menu.tsx` (new)
- `platform-app/src/components/dashboard/SiteCard.tsx`
