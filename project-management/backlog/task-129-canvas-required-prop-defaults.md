# TASK-129: Add Required Prop Defaults for Space DS Components

**Story:** US-019 (Provisioning Pipeline)
**Priority:** P0
**Estimated Effort:** S
**Milestone:** M4 — Site Editing

## Description
Canvas validates required props on save. Space DS components like `space-cta-banner-type-1` require `width` and `alignment` props, but the AI blueprint generator only produces content props (title, description). This causes step 8 (Import Blueprint) to fail with `LogicException: The property width is required`.

## Root Cause
The component tree builder (`component-tree-builder.ts`) passes AI-generated props directly without injecting schema-required defaults.

## Fix
Added a `REQUIRED_PROP_DEFAULTS` map in `component-tree-builder.ts` that supplies default values for required layout/display props per component. Defaults are merged under AI-generated props (AI props take precedence if provided).

Components covered:
- `space-cta-banner-type-1`: `width: boxed-width`, `alignment: left-align`
- `space-cta-banner-type-2`: `width: boxed-width`, `image_type: large-image`
- `space-cta-banner-type-3`: `width: boxed-width`
- `space-container`: `width: boxed-width`

## Files Changed
- `platform-app/src/lib/blueprint/component-tree-builder.ts` — added `REQUIRED_PROP_DEFAULTS` map and merge logic
