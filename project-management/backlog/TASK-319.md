# TASK-319: Layout Architect Agent — Visual Composition Intelligence

**Priority:** P1
**Effort:** XL
**Epic:** AI Pipeline Enhancement
**Milestone:** Post-M15 (after Space DS v2 migration stabilizes)
**Dependencies:** TASK-312, TASK-313, TASK-314 (v2 foundation must be stable first)

## Problem Statement

The current pipeline conflates layout decisions with content generation. The AI picks components and writes copy in a single step, which biases toward "safe" repetitive layouts (e.g., 3x `text-media` sections in a row) rather than visually engaging compositions. There is no spatial reasoning — no concept of visual weight distribution, above-the-fold impact, grid variety, or background rhythm.

With v2's compositional model (flexi grids + atoms in slots), the layout possibility space has expanded significantly. Without design-aware orchestration, the pipeline will default to safe patterns and underutilize the design system.

## Goal

Introduce a **Layout Architect phase** between Plan and Generate that produces a structural wireframe per page — selecting components, defining grid configurations, and annotating visual weight — before any content is written. This separates "what goes where" from "what it says," enabling more creative, visually diverse page compositions.

## Proposed Architecture

### New Pipeline Phase

```
Research → Plan → LAYOUT ARCHITECT → Generate → Build Tree
```

The Layout Architect receives:
- Research brief (industry, tone, audience)
- Content plan (section types, counts, purposes)
- Page design rules (preferred components, rhythm)
- Component manifest (available components, slots, grid options)

It produces a **PageWireframe** per page:

```typescript
interface PageWireframe {
  slug: string;
  sections: SectionWireframe[];
}

interface SectionWireframe {
  type: string;                    // "hero" | "features" | "testimonials" | etc.
  component_id: string;           // Selected Space DS component
  layout?: {
    grid: string;                 // "50-50" | "33-33-33" | "66-33" | "full"
    childComponents: string[];    // Atoms to place in slots
  };
  visualWeight: "heavy" | "medium" | "light";
  background: "primary" | "neutral" | "accent" | "image";
  containerWidth: "full-width" | "boxed-width";
}
```

### Design Intelligence the Agent Should Encode

1. **Visual weight rhythm** — Enforce heavy/medium/light alternation, not just as a text hint but as a structural constraint on component selection
2. **Grid variety** — Avoid repeating the same column split across consecutive sections (e.g., don't do three 50-50 splits in a row)
3. **Above-the-fold optimization** — Hero + first content section should create maximum visual impact
4. **Background alternation** — Strategic use of colored backgrounds, image backgrounds, and neutral sections to create visual breathing room
5. **Component diversity** — Penalize repeated component usage; prefer using the breadth of the design system
6. **Industry-aware composition** — A law firm's "trust signals" layout differs from a restaurant's "atmosphere showcase"
7. **Section transition flow** — Consider how sections connect visually (e.g., a stats section transitions better into a CTA than into another stats section)

### What It Does NOT Do

- Write copy (stays in Generate phase)
- Pick colors/fonts (stays in Brand Tokens)
- Define pixel-level spacing (theme-level concern)
- Override page design rules (it works within them, not around them)

## Acceptance Criteria

- [ ] New pipeline phase executes between Plan and Generate
- [ ] Produces valid `PageWireframe` for each page in the content plan
- [ ] Generate phase receives wireframe and fills content into pre-selected components (no component re-selection)
- [ ] Component tree builder consumes wireframe grid configs directly
- [ ] Measurable improvement in layout diversity across generated sites (no two same-industry sites should have identical section sequences)
- [ ] No regression in pipeline latency beyond +20s per site (target: one AI call per page for layout)

## Technical Notes

- Prompt should include few-shot examples of good vs. bad compositions using actual Space DS v2 components
- Consider a scoring/self-critique step where the agent evaluates its own wireframe against rhythm and diversity heuristics before returning
- The wireframe schema should be strict enough that the Generate phase can't override component choices — this enforces the separation of concerns
- Temperature: ~0.5-0.6 (needs more creativity than Plan phase but still constrained)

## Open Questions

- Should the Layout Architect also handle multi-page consistency (e.g., ensuring the About page doesn't duplicate the Home page's layout)?
- Should wireframes be exposed to the user for approval in the review step, or kept internal?
- How to handle pages with very few sections (FAQ, Contact) where layout variety is inherently limited?
