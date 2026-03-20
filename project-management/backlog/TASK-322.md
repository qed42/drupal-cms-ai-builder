# TASK-322: Blueprint Generation Required Props Audit & Fix

**Priority:** P0 (Blocker — provisioning fails on missing required props)
**Effort:** L (Large)
**Milestone:** M15 — Space DS v2 Theme Migration
**Dependencies:** TASK-312 (manifest), TASK-314 (tree builder) — both DONE
**Sprint:** Sprint 21

## Problem

Blueprint import fails with `LogicException` when Canvas validates component trees that are missing required props. Two failures observed so far:

1. **`background` → `background_color`** — deprecated prop name on `space-container` (fixed in code, but stale blueprints still fail)
2. **`icon_size` missing on `space-icon`** — required prop not set when tree builder generates icon components

Root cause: `REQUIRED_PROP_DEFAULTS` in `component-tree-builder.ts` only covers 3 components but the manifest has **20+ required props** across 15+ components. When the AI omits any required prop, Canvas's `ComponentTreeItem::preSave()` throws a `LogicException`.

## Scope

### Part 1: Comprehensive Required Props Audit

Parse `space-component-manifest.json` and catalog every required prop with its default/fallback:

| Component | Required Prop | Type | Default | Currently Covered? |
|-----------|--------------|------|---------|-------------------|
| space-container | width | string | "boxed-width" | YES |
| space-heading | tag_name | string | "h2" | YES |
| space-section-heading | tag_name | string | "h2" | YES |
| space-button | text | string | "Learn More" | NO |
| space-button | url | string | "#" | NO |
| space-button | variant | string | "primary" | NO |
| space-button | size | string | "medium" | NO |
| space-content | content | string | "" | NO |
| space-icon | icon | string | "rocket" | NO |
| space-icon | icon_size | string | "medium" | NO |
| space-heading | text | string | "Heading" | NO |
| space-heading | text_size | string | "heading-2" | NO |
| space-stats-kpi | keynumber | integer | 0 | NO |
| space-stats-kpi | subheading | string | "Metric" | NO |
| space-cta-banner-type-1 | title | string | "Get Started" | NO |
| space-cta-banner-type-1 | description | string | "" | NO |
| space-cta-banner-type-1 | tag_name | string | "h2" | NO |
| space-cta-banner-type-1 | width | string | "full-width" | NO |
| space-cta-banner-type-1 | alignment | string | "center" | NO |
| space-hero-banner-style-02 | title | string | "Welcome" | NO |
| space-hero-banner-style-02 | sub_headline | string | "" | NO |
| space-detail-page-hero-banner | title | string | "" | NO |
| space-footer | brand_name | string | "" | NO |
| space-footer | brand_slogan | string | "" | NO |
| space-footer | brand_description | string | "" | NO |
| space-footer | copyright | string | "" | NO |

### Part 2: Fix — Expand REQUIRED_PROP_DEFAULTS

Update `REQUIRED_PROP_DEFAULTS` in `component-tree-builder.ts` to include **every required prop** for every component in the manifest, using sensible defaults from the manifest's `default` or `examples` fields.

### Part 3: Manifest Accuracy Verification

Cross-reference `space-component-manifest.json` against the actual `.component.yml` files in the theme to ensure:
- `required` flags are accurate (not marking optional props as required or vice versa)
- `default` values match upstream component definitions
- `enum` values are complete

### Part 4: Defensive Validation in Tree Builder

Add a validation step in `createItem()` that:
1. Looks up the component's props from the manifest
2. For any required prop not present in inputs, injects the default
3. Logs a warning when a required prop is missing (for prompt debugging)

This ensures ANY component tree survives Canvas validation, even if AI halluccinates or omits props.

## Files Affected

- `platform-app/src/lib/blueprint/component-tree-builder.ts` — expand REQUIRED_PROP_DEFAULTS, add validation
- `platform-app/src/lib/ai/space-component-manifest.json` — verify/correct required flags and defaults
- `platform-app/src/lib/blueprint/component-validator.ts` — may need updates for new validation

## Acceptance Criteria

- [ ] Every required prop for all 31 components has a fallback default in REQUIRED_PROP_DEFAULTS
- [ ] `createItem()` automatically injects defaults for missing required props
- [ ] Manifest `required` flags verified against actual `.component.yml` files
- [ ] Existing blueprint `bp-IMJona` imports without `LogicException`
- [ ] Fresh blueprint generation produces trees with all required props populated
- [ ] No more `icon_size`, `tag_name`, `background`, or any required prop errors on import

## Technical Notes

- The `REQUIRED_PROP_DEFAULTS` approach is a safety net — the AI prompts should still be encouraged to generate all props. But the tree builder must be the last line of defense.
- Consider generating the defaults map programmatically from the manifest at build time rather than hardcoding — this prevents drift when the manifest is updated.
- The `background` → `background_color` rename is already fixed in code but stale blueprints on disk still have the old name. This task should also add a migration/normalization step for legacy field names.
