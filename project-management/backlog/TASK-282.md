# TASK-282: Enrich Space DS component manifest with layout wrapper rules

**Type:** Feature
**Priority:** P1 — High (components render without proper containment, breaking page layout)
**Estimated Effort:** Medium (4-6 hours)
**Dependencies:** None
**Affects:** All AI-generated page layouts

## Problem

Space DS organisms have specific layout requirements that are not captured in the component manifest or communicated to the AI during content generation:

1. **Most organisms must be placed inside a `space-container` with `width: "boxed-width"`** to render at the correct max-width with proper horizontal centering. Without this, components stretch to full viewport width.
2. **Hero banners are the exception** — they use their own internal `container relative mx-auto` and are designed to be full-width sections with background images.
3. **CTA banners have their own `width` prop** — they can be either boxed or full-width, controlled via their own prop rather than needing a container wrapper.

**Current behavior:** The component tree builder (`component-tree-builder.ts`) places all sections as root-level items (`parent_uuid: null`). There is no container wrapping. The AI has no knowledge of these layout rules.

**Expected behavior:** Non-hero organisms should be wrapped in a `space-container` component in the Canvas component tree, with the container as the parent and the organism nested in its `content` slot.

## Technical Analysis

### How `space-container` works (from Twig template):

```twig
<div class="space-container {{ bg_class }}">
  <div class="{{ modifier_class }} {{ width == 'boxed-width' ? 'container relative mx-auto' : '' }}">
    {% block content %}{{ content }}{% endblock %}
  </div>
</div>
```

When `width: "boxed-width"`, the container applies `container relative mx-auto` which constrains content to Tailwind's container max-width breakpoints.

### Layout rules by component category:

| Component Type | Needs Container? | Container Width | Notes |
|----------------|-----------------|-----------------|-------|
| Hero banners (all 11 styles) | No | N/A | Full-width by design, have internal `container mx-auto` |
| CTA banners (types 1-3) | No | N/A | Have their own `width` prop (boxed-width/full-width) |
| Text-media (all 5 variants) | Yes | boxed-width | No internal container, renders full-width without wrapper |
| Team sections (all 6 variants) | Yes | boxed-width | Has internal `container mx-auto` for team members but intro section is unwrapped |
| Accordion (base) | Yes | boxed-width | Has own `container_width` prop but still needs outer container |
| Accordion-with-image (v1-v3) | Yes | boxed-width | No internal container |
| Slider | Yes | boxed-width | No internal container |
| Sticky jump link | Yes | boxed-width | No internal container |
| Sidebar links | Yes | boxed-width | Fixed-width component, needs container for positioning |

## Acceptance Criteria

1. The component manifest (`space-component-manifest.json`) includes a `layout` field for each organism specifying:
   - `requires_container`: boolean — whether the component needs a `space-container` wrapper
   - `default_container_width`: "boxed-width" | "full-width" — the recommended container width
   - `default_container_padding`: object with top/bottom defaults (e.g., `{ top: "large", bottom: "large" }`)
2. The export script (`export-component-manifest.mjs`) has a `LAYOUT_RULES` map that drives the layout field generation
3. The component tree builder (`component-tree-builder.ts`) wraps organisms that `require_container` in a `space-container` parent with:
   - Proper `parent_uuid` / `slot` hierarchy (container is parent, organism is child in `content` slot)
   - `width: "boxed-width"` as default input
   - Reasonable padding defaults (top/bottom: "large")
4. The page generation prompt (`page-generation.ts`) mentions layout rules so the AI understands the containment model
5. Hero banners and CTA banners are NOT wrapped (they handle their own width)
6. Generated Canvas component trees render correctly in Drupal with proper boxed-width containment
7. **Anti-monotony constraint:** The component tree builder must not place two consecutive sections using the same `component_id`. If the AI generates back-to-back identical component types (e.g., two `space-text-media-default` in a row), the tree builder should substitute the second instance with an alternate variant from the same component family (e.g., `space-text-media-reversed`). If no variant exists, insert a visual break component (e.g., a divider or alternate background container) between them.
8. The page generation prompt (`page-generation.ts`) includes an explicit instruction: "Do not use the same component type for two consecutive sections. Alternate between variants to create visual rhythm."

## Implementation Notes

### Manifest enrichment (`export-component-manifest.mjs`):

```javascript
const LAYOUT_RULES = {
  // Hero banners — full-width, no container
  "space-hero-banner-style-01": { requires_container: false },
  // ... all 11 hero styles

  // CTA banners — own width prop, no container
  "space-cta-banner-type-1": { requires_container: false },
  // ... all 3 CTA types

  // Text-media — needs container
  "space-text-media-default": { requires_container: true, default_container_width: "boxed-width" },
  // ... all 5 text-media variants

  // Team sections — needs container
  "space-team-section-simple-1": { requires_container: true, default_container_width: "boxed-width" },
  // ... all 6 team variants

  // Default for any unlisted organism: requires_container: true
};
```

### Component tree builder changes (`component-tree-builder.ts`):

For each section where `requires_container: true`:
1. Create a `space-container` ComponentTreeItem with a new UUID
2. Set `component_id: "sdc.space_ds.space-container"`, `parent_uuid: null`
3. Set `inputs: { width: "boxed-width", padding_top: "large", padding_bottom: "large" }`
4. Create the organism ComponentTreeItem with `parent_uuid` pointing to the container's UUID and `slot: "content"`

### Canvas component version:

Ensure `space-container` has an entry in `canvas-component-versions.ts`. Check if it's already there.

## Files to Modify

- `platform-app/scripts/export-component-manifest.mjs` — Add `LAYOUT_RULES` map, output `layout` field
- `platform-app/src/lib/ai/space-component-manifest.json` — Regenerated with layout metadata
- `platform-app/src/lib/blueprint/component-tree-builder.ts` — Wrap organisms in containers
- `platform-app/src/lib/blueprint/canvas-component-versions.ts` — Verify space-container version hash exists
- `platform-app/src/lib/ai/prompts/page-generation.ts` — Add layout context to AI prompt
- `platform-app/src/lib/blueprint/types.ts` — Extend manifest types if needed
