# TASK-465: Initialize shadcn/ui with Dark Theme Configuration

**Story:** US-092
**Priority:** P0
**Estimated Effort:** S
**Milestone:** M24 — UI Component System

## Description

Set up shadcn/ui in the platform-app with Tailwind v4, configure the CSS variable theme to match the existing dark glass-morphism aesthetic, and install the `cn()` utility.

## Technical Approach

1. Install dependencies: `tailwind-merge`, `clsx`, `class-variance-authority`
2. Run `npx shadcn@latest init` — select New York style, dark mode, custom colors
3. Create `src/lib/utils.ts` with `cn()` helper (clsx + twMerge)
4. Configure `components.json` to point shadcn output to `src/components/ui/`
5. Map existing `@theme inline` color tokens to shadcn CSS variables in `globals.css`:
   - brand-500 → `--primary`
   - accent-500 → `--accent`
   - white/5 → `--card`, white/10 → `--border`
   - Derive `--muted`, `--destructive`, `--ring` from existing palette
6. Verify Tailwind v4 `@theme inline` and shadcn CSS variables coexist without conflicts
7. Install one test component (Button) to validate the setup end-to-end

## Acceptance Criteria

- [ ] `components.json` configured for project paths and dark theme
- [ ] `cn()` utility available at `@/lib/utils`
- [ ] CSS variables defined in globals.css match existing brand/accent colors
- [ ] shadcn Button renders correctly with dark theme
- [ ] Existing components unaffected — no visual regression
- [ ] `npm run build` succeeds without errors

## Dependencies

- None (foundation task)

## Files Affected

- `platform-app/package.json` (new deps)
- `platform-app/src/app/globals.css` (CSS variables)
- `platform-app/src/lib/utils.ts` (new — cn helper)
- `platform-app/src/components/ui/button.tsx` (new — validation)
- `platform-app/components.json` (new — shadcn config)
