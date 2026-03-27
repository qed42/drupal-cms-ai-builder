# TASK-474: Resolve Color Token Conflict — Single Source of Truth

**Status:** TODO
**Priority:** High
**Sprint:** 47
**Architecture:** architecture-onboarding-ux-modernization.md (ADR-2)
**Depends on:** None

## Description

Two competing brand color definitions exist:
- `src/lib/brand.ts` exports `BRAND_COLORS` as teal (#14b8a6)
- `src/app/globals.css` defines `--color-brand-*` as indigo (#4F46E5)

Tailwind uses the CSS tokens. `BRAND_COLORS` from `brand.ts` is dead code — no component uses it for actual styling.

## Tasks

1. **Audit `BRAND_COLORS` usage** — grep for any imports of `BRAND_COLORS` from `brand.ts`. Remove the export if unused.
2. **Keep `BRAND` object** — name, tagline, description, url remain (they're used in UI copy).
3. **Remove `BG_GRADIENT` export** — the gradient is defined inline in `onboarding/layout.tsx`. Having it in both places is confusing.
4. **Add semantic color tokens** to `globals.css` `@theme inline`:
   ```css
   --color-success: #10b981;
   --color-warning: #f59e0b;
   --color-error: #ef4444;
   --color-info: #3b82f6;
   ```
5. **Audit hardcoded status colors** — replace recurring `emerald-400`, `amber-400`, `red-400` patterns in status badges (SiteCard, validation hints, pipeline progress) with `success`, `warning`, `error` tokens where they represent semantic status.
6. **Screenshot comparison** — visually verify no regressions on: auth pages, dashboard, progress page, idea page validation hints.

## Acceptance Criteria

- [ ] `BRAND_COLORS` and `BG_GRADIENT` removed from `brand.ts`
- [ ] `globals.css` has semantic status color tokens
- [ ] No visual regressions (before/after screenshots match)
- [ ] All components compile without errors
