# TASK-312: Rebuild space-component-manifest.json from Space DS v2 theme

**Story:** Space DS v2 Migration
**Priority:** P0
**Estimated Effort:** M
**Milestone:** Space DS v2 Migration

## Description

The current `space-component-manifest.json` has 84 components from the old theme. The new Space DS v2 theme has 31 components with completely different props and slots schemas. Rebuild the manifest from the `.component.yml` files in the new theme.

## Technical Approach

1. **Parse all 31 `.component.yml` files** from `drupal-site/web/themes/contrib/space_ds/components/`
2. **Generate new manifest** preserving the existing JSON structure but with:
   - Updated component IDs matching new theme (`space_ds:space-*`)
   - Full props schema from each `.component.yml` (types, enums, defaults, required)
   - **Slots schema** — NEW: components now have named slots for child composition
   - Canvas image references (`$ref: json-schema-definitions://canvas.module/image`)
   - Group/category from component metadata
3. **Validate** that every component in the theme has a manifest entry
4. **Add slot metadata** to manifest — this is critical for the tree builder to know where children go

## Key Schema Changes

- Props with `contentMediaType: text/html` accept rich HTML content
- Props with `$ref: json-schema-definitions://canvas.module/image` are Canvas image objects (`{src, alt, width, height}`)
- Slots define named insertion points for child components (e.g., `content`, `column_one`, `slide_item`, `cta_content`)
- `thirdPartySettings.sdcStorybook.stories.preview` contains example compositions (useful for AI prompts)

## Acceptance Criteria

- [ ] Manifest contains exactly 31 components matching new theme
- [ ] All props with correct types, enums, defaults, and required flags
- [ ] All slots documented with names and expected child component types
- [ ] Canvas image ref type properly represented
- [ ] Old 53 deleted components NOT present in manifest
- [ ] Manifest validates against any existing JSON schema tests

## Dependencies
- None (first task in migration chain)

## Files/Modules Affected
- `platform-app/src/lib/ai/space-component-manifest.json` (complete rewrite)
