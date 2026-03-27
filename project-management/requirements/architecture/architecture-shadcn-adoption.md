# Architecture: shadcn/ui Adoption for Platform App

**Date:** 2026-03-26
**Status:** Proposed
**User Story:** US-092

## Context

The platform-app has 23 custom components built with raw Tailwind utility classes and zero UI library dependencies. While functional, the current approach has accumulated:

- **Accessibility gaps**: No focus traps, no keyboard navigation on menus/selects, no dialog primitives
- **Inconsistent primitives**: Button sizing varies (`px-4 py-2` vs `px-6 py-3` vs `px-4 py-2.5`), border-radius uses 4 different values, spacing rhythm is ad-hoc
- **Missing error UI**: Errors are console.log-only with no user-facing toast/notification system
- **Native HTML limitations**: `<select>` in FontSelector lacks styling control and keyboard UX

## Decision

Adopt **shadcn/ui** as the primitive component layer for the platform-app's own UI chrome (onboarding wizard, dashboard, auth pages). This does NOT affect the Drupal-facing design system adapters (Space DS, Mercury, CivicTheme).

### Why shadcn/ui specifically

| Criteria | shadcn/ui | Alternatives |
|----------|-----------|-------------|
| Ownership | Copy-paste source — components live in YOUR repo | MUI/Chakra: npm dependency with version coupling |
| Accessibility | Built on Radix UI primitives (WCAG 2.1 AA) | Headless UI: smaller primitive set, no form controls |
| Tailwind integration | First-class, CSS variable theming | MUI: fights Tailwind; Chakra: own styling system |
| Bundle size | Tree-shakeable, only import what you use | Ant Design: 300KB+ base |
| Tailwind v4 support | Yes, via CSS variables | Most alternatives untested on v4 |
| Customization | Full control — it's your source code | Component libs: override API or CSS hacks |

### What NOT to adopt

- **Form library** (react-hook-form): Forms are simple textareas/selects. Not needed until multi-field validation appears.
- **shadcn for Drupal adapters**: Output-side components generate Canvas trees, not platform UI.
- **Full theme replacement**: Keep the dark glass-morphism aesthetic. Map existing brand/accent tokens to shadcn CSS variables.

## Color Token Mapping

```css
/* Current @theme inline tokens → shadcn CSS variables */
:root {
  /* Map brand palette to primary */
  --primary: 239 84% 67%;              /* brand-500 (#4F46E5) in HSL */
  --primary-foreground: 0 0% 100%;

  /* Map accent palette */
  --accent: 187 92% 69%;               /* accent-500 (#06B6D4) in HSL */
  --accent-foreground: 0 0% 100%;

  /* Derive from existing opacity neutrals */
  --background: 224 71% 4%;            /* dark bg */
  --foreground: 0 0% 100%;
  --card: 0 0% 100% / 0.05;           /* bg-white/5 */
  --card-foreground: 0 0% 100%;
  --border: 0 0% 100% / 0.10;         /* border-white/10 */
  --muted: 0 0% 100% / 0.05;
  --muted-foreground: 0 0% 100% / 0.60;
  --destructive: 0 84% 60%;           /* red-500 */
  --ring: 239 84% 67%;                /* brand-500 for focus rings */
  --radius: 0.75rem;                  /* rounded-xl default */
}
```

## Adoption Phases

### Phase 1 — Foundation Primitives (Sprint 45)

| Component | Replaces | Reason |
|-----------|----------|--------|
| `Button` | 8+ ad-hoc button patterns | Consistent sizing, variants, a11y |
| `Input` / `Textarea` | Raw inputs across idea, name, audience, follow-up | Focus ring consistency, label association |
| `Select` | Native `<select>` in FontSelector | Keyboard nav, custom styling, search |
| `Card` | Inconsistent card patterns in dashboard + onboarding | Unified padding, border, radius |
| `Badge` | PageChip, status badges | Variant system (default/secondary/destructive) |
| `Skeleton` | Custom animate-pulse divs | Consistent loading states |
| `Sonner` (toast) | Missing — errors go to console.log | User-facing error/success feedback |

### Phase 2 — Interactive Primitives (Sprint 46)

| Component | Replaces | Reason |
|-----------|----------|--------|
| `Dialog` / `Sheet` | No modal/sheet primitives exist | Focus trap, escape handling, overlay |
| `DropdownMenu` | SiteCard overflow menu (manual click-outside) | Keyboard nav, focus management |
| `RadioGroup` | DesignOptionCard button-based selection | Proper radio semantics + a11y |
| `Tabs` | Future dashboard sections | Keyboard arrow-key navigation |
| `Tooltip` | `title` attributes on ColorSwatch, ViewToggle | Accessible, styled, delay-aware |

### Components to KEEP as-is

These are domain-specific product components that define the app's identity. shadcn primitives compose *inside* them:

- `StepLayout` — orchestrates onboarding step structure
- `ProgressStepper` / `PipelineProgress` — domain-specific progress visualization
- `InferenceCard` — AI inference display (unique to this product)
- `ArchiePanel` — AI persona panel
- `FileUploadZone` — custom drag-drop with AI analysis
- `GenerationProgress` — real-time pipeline status
- `StrategyPreview` — expandable AI research display
- `StepIcon` — custom SVG gradient icons

## File Structure

```
platform-app/
  src/
    components/
      ui/                    # ← shadcn components land here
        button.tsx
        input.tsx
        textarea.tsx
        select.tsx
        card.tsx
        badge.tsx
        skeleton.tsx
        dialog.tsx
        dropdown-menu.tsx
        radio-group.tsx
        tooltip.tsx
        sonner.tsx           # toast notifications
      onboarding/            # ← existing domain components (unchanged dir)
      dashboard/             # ← existing domain components (unchanged dir)
    lib/
      utils.ts               # ← cn() helper (clsx + tailwind-merge)
```

## Migration Pattern

Each component migration follows:

1. Install shadcn component via CLI: `npx shadcn@latest add button`
2. Customize component source to match dark theme
3. Find-and-replace usages in consuming components
4. Verify a11y with keyboard-only navigation
5. Visual regression check

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Dark theme mismatch | CSS variable overrides in globals.css; test each component visually |
| Tailwind v4 incompatibility | shadcn supports v4; test during TASK-465 setup |
| Bundle size increase | Radix primitives are 2-5KB each; monitor with bundle analyzer |
| Migration breaks existing UI | Component-by-component replacement; no big-bang rewrite |

## Success Criteria

- [ ] All interactive elements are keyboard-navigable
- [ ] Focus traps work on dialogs/menus
- [ ] Button/Card/Input sizing is consistent across all pages
- [ ] User-facing error toasts replace console.log errors
- [ ] No visual regression in existing onboarding flow
- [ ] Bundle size increase < 30KB gzipped
