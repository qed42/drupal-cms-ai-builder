# TASK-471: Add shadcn Dialog and Sheet Components

**Story:** US-092
**Priority:** P2
**Estimated Effort:** S
**Milestone:** M24 — UI Component System (Phase 2)

## Description

Install shadcn Dialog and Sheet components. These are foundational for future modals, confirmation dialogs, and mobile slide-out panels. Provides focus trap, Escape handling, and overlay out of the box via Radix.

## Technical Approach

1. Install: `npx shadcn@latest add dialog sheet --yes`
2. Customize for dark theme: `bg-slate-900 border-white/10` on content panels
3. Verify TypeScript compilation

## Acceptance Criteria

- [ ] Dialog and Sheet components available in `components/ui/`
- [ ] Dark theme styling applied
- [ ] TypeScript compiles cleanly

## Dependencies

- TASK-465 (DONE)

## Files Affected

- `platform-app/src/components/ui/dialog.tsx` (new)
- `platform-app/src/components/ui/sheet.tsx` (new)
