# Sprint 24: Bug Sprint — Canvas Rendering, Component Drift & Generation Quality

**Milestone:** M16 — Pipeline Stabilization & Quality
**Duration:** 1 day (2026-03-21)
**Predecessor:** Sprint 22 (v2 Pipeline Stabilization)

## Sprint Goal

Fix Canvas rendering crashes, eliminate ghost component references, harden the component tree builder with prop defaults, and improve AI generation quality by increasing token budgets and clarifying prompt instructions.

## Status: COMPLETE

## Bugs Fixed

### BUG-001: Review page shows "No editable text content" for composed sections
- **Root cause:** `getEditableFields()` only checked top-level props; Type B sections with children were ignored
- **Fix:** Replaced flat field view with collapsible component tree UI showing full Canvas hierarchy (container > flexi > children) with slot badges and all props visible
- **Files:** `platform-app/src/app/onboarding/review/components/PagePreview.tsx`

### BUG-002: "Unknown component testimonials-carousel" error during generation
- **Root cause:** AI placed pattern names (e.g., `testimonials-carousel`) in `component_id` instead of `pattern` field. Prompt mixed pattern names and component IDs without differentiation.
- **Fix (3-layer):**
  1. Validator auto-remaps known pattern names from `component_id` to `pattern` field (defensive fallback)
  2. Generation prompt now clearly separates Type A (component_id) from Type B (pattern field) in section type mapping
  3. Prompt explicitly states `component_id=""` is MUST for composed sections
- **Files:** `component-validator.ts`, `page-design-rules.ts`, `page-generation.ts`

### BUG-003: Plan phase fails section count validation on first attempt
- **Root cause:** Fixed 6000 token budget was insufficient for 5-6 page sites with 5-9 sections each
- **Fix:** Dynamic token budget: `6000 + (pageCount * 1500)`, capped at 16000. Added final section count checklist at end of prompt.
- **Files:** `platform-app/src/lib/pipeline/phases/plan.ts`, `platform-app/src/lib/ai/prompts/plan.ts`

### BUG-004: Generation token budget too low for content density
- **Root cause:** Base 4000 tokens with 500/section cap at 10000
- **Fix:** Doubled: base 8000, 1000/section, cap 20000
- **Files:** `platform-app/src/lib/pipeline/phases/generate.ts`

### BUG-005: Ghost component IDs across codebase
- **Root cause:** References to v1 components (hero-banner-style-01/03-11, text-media-*, pricing-card, people-card-*, etc.) persisted after Space DS v2 migration
- **Fix:** Full audit and cleanup across 6 files. `markdown-renderer.ts` label map replaced with 31 manifest-valid entries. `generator.ts`, `image-intent.ts`, `add-page/route.ts` ghost refs replaced with valid equivalents.
- **Files:** `markdown-renderer.ts`, `generator.ts`, `image-intent.ts`, `add-page/route.ts`, `sprint-13-unit.test.ts`, `page-design-rules.test.ts`

### BUG-006: Canvas "[canvas:image/src] NULL value found" render crashes
- **Root cause:** Image props with null/undefined sub-properties (src, alt, width, height) passed through to Canvas templates
- **Fix:**
  1. Null string props replaced with `""` instead of deleted
  2. Null sub-properties in image objects replaced with `""`
  3. Built `MANIFEST_IMAGE_PROPS` index; all image-type props auto-filled with placeholder image if empty/null
- **Files:** `component-tree-builder.ts`

### BUG-007: Missing prop defaults causing Canvas warnings/errors
- **Fix:** Added `PROP_OVERRIDES` for:
  - Space Heading: `alignment: "none"`
  - Space Button: `variant: "primary"`
  - Space CTA Banner: `width: "full-width"`, `alignment: "stacked"`
  - Space Flexi: `margin_top: "small"`
- **Files:** `component-tree-builder.ts`

### BUG-008: `_none` prop values not recognized by Canvas
- **Fix:** Sanitize all `_none` values to `"none"` in `createItem()`
- **Files:** `component-tree-builder.ts`

### BUG-009: Empty columns in multi-column layouts
- **Fix:** After placing children, iterate column slots and fill empty ones with placeholder `space-text`
- **Files:** `component-tree-builder.ts`

### BUG-010: Mixed component types in multi-column layouts
- **Fix:** For 2+ column layouts, detect mixed types and normalize to dominant component type
- **Files:** `component-tree-builder.ts`

### BUG-011: Space Stats KPI sub_headline misused for numbers
- **Fix:** If `sub_headline` looks like a number, swap with `title`
- **Files:** `component-tree-builder.ts`

### BUG-012: Space Text rich_text missing trailing newline
- **Fix:** Append `\n` if not already present
- **Files:** `component-tree-builder.ts`

### BUG-013: Consecutive sections with same background merge visually
- **Fix:** Reordered `SECTION_BACKGROUNDS` cycle to `["white", "option-1", "transparent", "option-2"]`
- **Files:** `component-tree-builder.ts`

### BUG-014: Width prop confusion in generation prompt
- **Fix:** Added explicit rule: "Width is controlled at container level, NOT on individual components"
- **Files:** `page-generation.ts`

## Files Changed (14)
- `platform-app/src/app/onboarding/review/components/PagePreview.tsx`
- `platform-app/src/lib/ai/page-design-rules.ts`
- `platform-app/src/lib/ai/prompts/page-generation.ts`
- `platform-app/src/lib/ai/prompts/plan.ts`
- `platform-app/src/lib/blueprint/component-tree-builder.ts`
- `platform-app/src/lib/blueprint/component-validator.ts`
- `platform-app/src/lib/blueprint/generator.ts`
- `platform-app/src/lib/blueprint/markdown-renderer.ts`
- `platform-app/src/lib/images/image-intent.ts`
- `platform-app/src/lib/pipeline/phases/generate.ts`
- `platform-app/src/lib/pipeline/phases/plan.ts`
- `platform-app/src/app/api/blueprint/[siteId]/add-page/route.ts`
- `platform-app/tests/page-design-rules.test.ts`
- `platform-app/tests/sprint-13-unit.test.ts`
