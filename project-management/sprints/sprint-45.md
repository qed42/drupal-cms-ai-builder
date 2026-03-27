# Sprint 45: shadcn/ui Adoption — Foundation Primitives

**Milestone:** M24 — UI Component System
**Duration:** 2 days
**Predecessor:** Sprint 44 (AWS Deployment)

## Sprint Goal

Initialize shadcn/ui with the project's dark theme, then migrate all buttons, form inputs, cards, and badges to shared primitives — eliminating inconsistent sizing and adding keyboard accessibility. Add Sonner toasts to surface errors currently hidden in `console.log`.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-465 | Initialize shadcn/ui with dark theme configuration | US-092 | S | None | DONE |
| TASK-466 | Migrate buttons to shadcn Button component | US-092 | M | TASK-465 | DONE |
| TASK-467 | Migrate form inputs to shadcn Input/Textarea/Select | US-092 | M | TASK-465 | TODO |
| TASK-468 | Migrate cards and badges to shadcn Card/Badge/Skeleton | US-092 | M | TASK-465 | TODO |
| TASK-469 | Add toast notification system (Sonner) | US-092 | S | TASK-465 | DONE |
| TASK-470 | Migrate SiteCard menu to shadcn DropdownMenu | US-092 | S | TASK-465 | TODO |

## Execution Order

```
Wave 1:            TASK-465
  - Foundation: install deps, configure theme, create cn() util, validate with one component
  - Must complete first — all other tasks import from components/ui/

Wave 2 (parallel): TASK-466, TASK-467, TASK-468, TASK-469, TASK-470
  - All 5 tasks are independent once shadcn is initialized
  - Each installs its own shadcn component(s) and migrates usages
  - Can be worked in parallel or sequentially with no conflicts
  - Recommended sequence if solo: 469 (quick win) → 466 (most impactful) → 470 (a11y fix) → 467 (inputs) → 468 (cards)
```

## Dependencies & Risks

- **Tailwind v4 compatibility** — shadcn has v4 support but verify during TASK-465 init. Fallback: manually copy component source instead of using CLI.
- **Dark theme mismatch** — shadcn defaults to light theme. Every component needs CSS variable overrides. Mitigated by defining all variables in TASK-465 before any component installation.
- **Glass-morphism style** — Current cards use `bg-white/5 backdrop-blur` which is outside shadcn's default palette. Custom `glass` variant needed in Card component.
- **FontSelector complexity** — Native `<select>` → shadcn `Select` is the riskiest migration (TASK-467). The font list is long; may need virtualized scrolling. If blocked, defer to next sprint and keep native select.
- **No regressions** — Button and input changes touch every onboarding step. Visual check all 13 steps after Wave 2.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| S | 3 | TASK-465, TASK-469, TASK-470 |
| M | 3 | TASK-466, TASK-467, TASK-468 |
| **Total** | **6 tasks** | |

## Definition of Done

- [ ] shadcn/ui initialized — `components.json` configured, `cn()` utility available
- [ ] CSS variables in globals.css map brand/accent to shadcn's primary/accent tokens
- [ ] All `<button>` elements use `<Button>` with consistent variant/size props
- [ ] All text inputs/textareas use shadcn `Input`/`Textarea` with uniform focus rings
- [ ] FontSelector uses shadcn `Select` with keyboard arrow navigation
- [ ] SiteCard overflow menu uses `DropdownMenu` with focus trap and Escape handling
- [ ] Cards and badges use shared `Card`/`Badge` components with consistent radius/padding
- [ ] Skeleton component replaces custom animate-pulse patterns
- [ ] `<Toaster />` in root layout — errors surface as visible toasts
- [ ] All 13 onboarding steps visually verified (no regression)
- [ ] `npm run build` succeeds with zero TypeScript errors
- [ ] Bundle size increase < 30KB gzipped (check with `@next/bundle-analyzer`)
