# TASK-503: Designer Agent — Section-Level JSX/Tailwind Generation

**Story:** Code Components Initiative
**Priority:** P0
**Effort:** XL
**Milestone:** M26 — Code Component Generation

## Description

Implement the Designer Agent — an AI agent that generates React/Preact + Tailwind CSS v4 code components for each section in the ContentPlan. This is the core creative engine for code component mode.

## Technical Approach

- Create `runDesignerAgent(brief: SectionDesignBrief, brand: BrandTokens, prefs: DesignPreferences): Promise<CodeComponentOutput>`
- Build system prompt covering:
  - React/Preact component structure (export default, props destructuring)
  - Tailwind CSS v4 utility classes (responsive: `sm:`, `md:`, `lg:`)
  - Animation with `motion-safe:` / `motion-reduce:` variants
  - Brand token injection via CSS custom properties (`var(--color-primary)`)
  - Image props using Canvas `image` prop type
  - Available imports: `cn`, `clsx`, `cva`, `FormattedText`
  - Section-to-section visual rhythm (pass previous section summary)
- Use structured output (Zod schema) for reliable parsing
- Implement retry loop (max 2) with validator feedback on failure
- Support all section types: hero, features, testimonials, CTA, FAQ, team, gallery, stats, contact

## Acceptance Criteria

- [ ] Generates valid React/Preact components for 9+ section types
- [ ] Output passes `CodeComponentValidator` (TASK-502) checks
- [ ] Brand tokens applied via CSS custom properties
- [ ] Animations respect `prefers-reduced-motion` via Tailwind variants
- [ ] Responsive design using Tailwind breakpoints
- [ ] Retry with validator error feedback on validation failure
- [ ] Props defined with correct Canvas prop types (string, image, link, etc.)

## Dependencies
- TASK-501, TASK-502

## Files to Create

- `platform-app/src/lib/code-components/designer-agent.ts`
- `platform-app/src/lib/code-components/designer-prompt.ts`
- `platform-app/src/lib/code-components/section-templates/` (reference examples per section type)
