# TASK-479: Composite Step — Style Page (Merge theme + design + tone)

**Status:** TODO
**Priority:** High
**Sprint:** 48
**Architecture:** architecture-onboarding-ux-modernization.md (ADR-1, §3.2)
**Depends on:** TASK-474

## Description

Merge the `theme`, `design`, and `tone` steps into a single `/onboarding/style` page. All aesthetic choices — visual theme, design source, and brand voice — belong together as one "how should it look and feel?" decision.

## Tasks

1. **Create `src/app/onboarding/style/page.tsx`** with three sections:

   **Section 1: Visual Theme**
   - RadioGroup with theme cards (3 options, grid)
   - Heading: "Pick your visual style"
   - Reuse existing theme card rendering from `theme/page.tsx`

   **Section 2: Design Source**
   - RadioGroup with 2 options (AI choose vs. Figma — Figma still disabled)
   - Heading: "Design approach"
   - Compact, inline below theme selection

   **Section 3: Brand Voice**
   - Tone cards in 2-column grid with radio selection
   - Differentiator text input
   - Collapsible "Advanced options" (reference URLs, existing copy)
   - Heading: "Set your brand voice"

2. **Layout:** Use split mode with ArchiePanel showing:
   - Before selection: contextual tips
   - After theme + tone selected: combined inference card showing "Your site personality"

3. **Update routing:**
   - Replace `theme`, `design`, `tone` with single `style` step
   - Add redirects from old URLs
   - Update `onboarding-steps.ts`

4. **Remove old pages:**
   - `src/app/onboarding/theme/page.tsx`
   - `src/app/onboarding/design/page.tsx`
   - `src/app/onboarding/tone/page.tsx`

5. **Update tests** — rewrite affected specs

## Acceptance Criteria

- [ ] Single page collects theme, design source, and tone
- [ ] Theme cards, tone cards render correctly
- [ ] Advanced options (URLs, existing copy) remain collapsible
- [ ] Continue validates: theme selected AND tone selected
- [ ] Session save includes all three data groups
- [ ] Old URLs redirect properly
