# TASK-476: ArchiePanel Contextual Tips System

**Status:** TODO
**Priority:** Medium
**Sprint:** 47
**Architecture:** architecture-onboarding-ux-modernization.md (ADR-3, §3.4)
**Depends on:** None

## Description

The ArchiePanel right column shows a sparkle emoji + "I'll share my thoughts as you type…" as placeholder. This wastes 50% of screen real estate on desktop. Replace with contextual tips that guide the user for each step.

## Tasks

1. **Define `StepTip` type** in `onboarding-steps.ts`:
   ```typescript
   export type StepTip = {
     icon: string;   // lucide icon name
     title: string;
     body: string;
   };
   ```
2. **Add tips to step definitions** — 2-3 tips per step:
   - `idea`: "Be specific", "Mention your audience", "You can change this later"
   - `audience`: "Think about pain points", "Age/location helps", "AI will suggest more"
   - `pages`: "3-12 pages recommended", "You can add custom pages", "AI structures by industry"
   - `brand`: "Upload a logo for color extraction", "Brand kit PDF works too", "Colors can be adjusted"
   - `fonts`: "Heading font sets the tone", "Body font for readability", "Custom upload supported"
   - `images`: "Your photos replace stock images", "AI analyzes content", "Up to 20 images"
   - `follow-up`: "Specific answers = specific content", "Skip if unsure", "AI fills gaps"
   - `tone`: "Tone applies to all pages", "Add differentiators", "Reference URLs help"
3. **Create `TipsRenderer` component** in `src/components/onboarding/TipsRenderer.tsx`:
   - Stagger-fade animation (each tip fades in 100ms after the previous)
   - Layout: vertical stack with icon (lucide) + title (white/70) + body (white/40)
   - Footer: "You can always come back and change this" (white/30, text-xs)
   - Respects `prefers-reduced-motion`
4. **Update `ArchiePanel.tsx`** to accept `tips` prop and render `TipsRenderer` when empty
5. **Update StepLayout.tsx** — pass current step's tips to ArchiePanel

## Acceptance Criteria

- [ ] ArchiePanel shows relevant tips when no inference card is active
- [ ] Tips fade in with stagger animation
- [ ] Tips disappear when inference card appears
- [ ] Tips are defined for all split-layout steps
- [ ] Reduced-motion: no animation, instant display
