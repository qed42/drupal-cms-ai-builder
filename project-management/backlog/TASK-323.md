# TASK-323: Enhance AI prompts and tree builder with compositional layout guidelines

**Priority:** P0
**Estimated Effort:** L
**Milestone:** M15 — Space DS v2 Theme Migration

## Description

Add comprehensive layout composition guidelines to the AI generation prompts and enforce them in the component tree builder. These rules ensure visually polished, semantically correct page layouts.

## Guidelines to Encode

### Container & Layout Rules
1. **Always wrap in space-container** — Every section must be inside a space-container
2. **Width strategy:** Use `boxed-width` for content needing gutter space (most sections). Use `full-width` for full-bleed layouts (heroes, CTA banners, image backgrounds)
3. **Background color variety** — Use container `background_color` prop to create visual rhythm between sections
4. **Section spacing** — Add `margin_top: "small"` between consecutive containers to prevent sections from visually colliding
5. **Flexi inside containers** — Use space-flexi for multi-column layouts inside containers. Column count in `column_width` prop MUST match the number of child slots used (e.g., `33-33-33` = 3 children in column_one/two/three)

### Anti-Monotony Rules
6. **No consecutive duplicate components** — Never place the same component type directly below itself
7. **Alternating image alignment** — When two image+text sections appear near each other, alternate the image position (left/right) using different column_width patterns (e.g., `66-33` then `33-66`)

### Semantic HTML Rules
8. **Heading hierarchy** — Hero title = h1, section headings = h2, subsection headings = h3. Never skip heading levels
9. **One h1 per page** — Only the hero section gets h1; all other headings are h2+

### Icon Validation
10. **Phosphor Icons only** — All icon names must be valid Phosphor Icons from https://phosphoricons.com/. Common safe values: `rocket`, `star`, `phone`, `envelope`, `map-pin`, `clock`, `shield-check`, `heart`, `users`, `chart-line`, `lightbulb`, `gear`, `house`, `arrow-right`

## Technical Approach

### AI Prompt Updates
- Update `platform-app/src/lib/ai/prompts/page-layout.ts` — Add layout composition rules to system prompt
- Update `platform-app/src/lib/ai/prompts/content-generation.ts` — Add icon name validation guidance

### Tree Builder Updates
- Update `platform-app/src/lib/blueprint/component-tree-builder.ts`:
  - Ensure `margin_top: "small"` is added to containers that follow other containers
  - Validate column_width matches child count in composed sections
  - Add heading level logic: h1 for heroes, h2 for section headings, h3 for subsections

### Page Design Rules Updates
- Update `platform-app/src/lib/ai/page-design-rules.ts`:
  - Add anti-monotony constraint to composition guidance
  - Add image alternation guidance to text-image patterns
  - Add heading level mapping per section type

## Acceptance Criteria

- [ ] All sections wrapped in space-container (except full-width organisms already at root)
- [ ] Container width set appropriately (boxed-width for content, full-width for heroes/CTAs)
- [ ] Consecutive containers have margin_top spacing
- [ ] Flexi column_width matches number of child components
- [ ] No consecutive duplicate component types in generated pages
- [ ] Image+text sections alternate image position when adjacent
- [ ] Heading hierarchy follows h1→h2→h3 semantic order
- [ ] All icon names are valid Phosphor Icons
- [ ] AI prompts include these guidelines explicitly

## Files Affected
- `platform-app/src/lib/ai/prompts/page-layout.ts`
- `platform-app/src/lib/ai/prompts/content-generation.ts`
- `platform-app/src/lib/blueprint/component-tree-builder.ts`
- `platform-app/src/lib/ai/page-design-rules.ts`
