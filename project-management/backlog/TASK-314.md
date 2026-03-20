# TASK-314: Rewrite component-tree-builder.ts for slot-based composition

**Story:** Space DS v2 Migration
**Priority:** P0
**Estimated Effort:** XL
**Milestone:** Space DS v2 Migration

## Description

The component tree builder currently creates flat lists of organisms wrapped in containers. The new Space DS v2 requires **slot-based composition** where sections are built from `space-flexi` layouts with child components placed into named column slots. This is the most complex migration task.

## Technical Approach

### 1. New tree structure

Old output:
```json
[
  { "component_id": "space-hero-banner-style-01", "parent_uuid": null, "slot": null, "inputs": {...} },
  { "component_id": "space-container", "parent_uuid": null, "slot": null },
  { "component_id": "space-text-media-with-checklist", "parent_uuid": "container-uuid", "slot": "content" }
]
```

New output:
```json
[
  { "component_id": "space-hero-banner-style-02", "parent_uuid": null, "slot": null, "inputs": {...} },
  { "component_id": "space-container", "parent_uuid": null, "slot": null, "inputs": { "background_color": "option-1", "width": "boxed-width", "padding_top": "large" } },
  { "component_id": "space-section-heading", "parent_uuid": "container-uuid", "slot": "content", "inputs": { "title": "...", "alignment": "center" } },
  { "component_id": "space-flexi", "parent_uuid": "container-uuid", "slot": "content", "inputs": { "column_width": "50-50", "gap": "large" } },
  { "component_id": "space-heading", "parent_uuid": "flexi-uuid", "slot": "column_one", "inputs": { "text": "...", "tag_name": "h2" } },
  { "component_id": "space-text", "parent_uuid": "flexi-uuid", "slot": "column_one", "inputs": { "text": "<p>...</p>" } },
  { "component_id": "space-image", "parent_uuid": "flexi-uuid", "slot": "column_two", "inputs": { "src": "...", "alt": "..." } }
]
```

### 2. Core builder functions

```typescript
// Section-level builders
buildHeroSection(section: PageSection): ComponentTreeItem[]
buildContentSection(section: PageSection): ComponentTreeItem[]  // text+image via flexi
buildFeaturesSection(section: PageSection): ComponentTreeItem[]  // grid via flexi
buildStatsSection(section: PageSection): ComponentTreeItem[]  // stats-kpi row
buildTestimonialsSection(section: PageSection): ComponentTreeItem[]  // slider
buildTeamSection(section: PageSection): ComponentTreeItem[]  // flexi + user-cards
buildFaqSection(section: PageSection): ComponentTreeItem[]  // accordion
buildCtaSection(section: PageSection): ComponentTreeItem[]  // cta-banner
buildContactSection(section: PageSection): ComponentTreeItem[]  // contact-cards
buildLogoSection(section: PageSection): ComponentTreeItem[]  // logo-section
buildGallerySection(section: PageSection): ComponentTreeItem[]  // slider + imagecards
buildBlogListingSection(section: PageSection): ComponentTreeItem[]  // flexi + imagecards

// Layout helpers
wrapInContainer(children: ComponentTreeItem[], options: ContainerOptions): ComponentTreeItem[]
createFlexiGrid(columns: FlexiColumn[], options: FlexiOptions): ComponentTreeItem[]
createSliderCarousel(items: ComponentTreeItem[], options: SliderOptions): ComponentTreeItem[]
```

### 3. Remove old builder logic

- Remove `SKIP_CONTAINER` set (no longer relevant)
- Remove `VARIANT_FAMILIES` map (no variant swapping needed)
- Remove flat organism wrapping logic
- Remove old `buildFormTree()` (form atoms don't exist in theme)

### 4. Add header/footer builders

```typescript
buildHeaderTree(siteData: SiteData): ComponentTreeItem[]  // space-header with logo, nav, CTA slots
buildFooterTree(siteData: SiteData): ComponentTreeItem[]  // space-footer with brand, social, columns
```

### 5. Visual rhythm via container backgrounds

Implement section background alternation:
- Hero sections: no container (full-width organisms)
- Odd content sections: `transparent` or `white`
- Even content sections: `option-1` or `option-2`
- CTA: `base-brand` or `black`
- This creates visual rhythm without needing different organism styles

## Acceptance Criteria

- [ ] All section types produce valid Canvas component trees with correct parent-child-slot relationships
- [ ] Flexi layouts use appropriate column widths for each section pattern
- [ ] Slider carousel works for testimonials, portfolios, blog listings
- [ ] Header and footer trees include all required slots
- [ ] Container backgrounds alternate for visual rhythm
- [ ] All component IDs match new manifest
- [ ] Output structure compatible with `BlueprintImportService.php`
- [ ] Tests cover all section builders

## Dependencies
- TASK-312 (manifest — need component IDs and prop schemas)
- TASK-313 (page design rules — defines what sections each page needs)

## Files/Modules Affected
- `platform-app/src/lib/blueprint/component-tree-builder.ts` (complete rewrite)
- `platform-app/src/lib/blueprint/types.ts` (if type definitions need updating)
