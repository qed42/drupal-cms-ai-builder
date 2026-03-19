# TASK-268: Component Prop Validator with Manifest-Based Schema Enforcement

**Story:** US-048 (Content Quality), FR-205 (Component Selection from Space SDC)
**Priority:** P0
**Effort:** L
**Sprint:** 14

## Description

Build a post-generation validator that checks every component in a generated blueprint against the Space DS component manifest (`space-component-manifest.json`). The validator must:

1. **Validate component existence** — Reject any `component_id` not present in the manifest
2. **Validate prop names** — Strip any props not defined in the component's prop schema (e.g., `description` is NOT a valid prop on `space-hero-banner-style-01`)
3. **Validate prop types** — Check that prop values match expected types (string, object, array, enum values)
4. **Enforce required props** — Ensure all required props are present, filling defaults where available
5. **Return a validation report** — List of errors/warnings per section for retry feedback

## Implementation Notes

- Source of truth: `platform-app/src/lib/ai/space-component-manifest.json` (84 components with full prop specs)
- Create `platform-app/src/lib/blueprint/component-validator.ts`
- Validator should return `{ valid: boolean, errors: ValidationError[], sanitizedSections: PageSection[] }`
- Sanitized sections have invalid props stripped and required defaults injected
- This replaces the incomplete `REQUIRED_PROP_DEFAULTS` map in `component-tree-builder.ts`

## Acceptance Criteria

- [ ] Validator loads prop schema from space-component-manifest.json for each component
- [ ] Props not in schema are stripped with a warning logged
- [ ] Required props missing are filled from defaults or flagged as errors
- [ ] Enum props with invalid values are flagged
- [ ] Unknown component_ids are flagged as errors
- [ ] Returns both a clean/sanitized version and a list of violations
- [ ] Unit tests cover: valid component, invalid prop name, missing required prop, unknown component

## Root Cause

The provisioning error `'description' is not a prop on this version of the Component 'Space Hero Banner Style 01'` occurs because:
- The AI prompt in `page-generation.ts` line 109 explicitly suggests `description` as a hero prop
- `space-hero-banner-style-01` only accepts: `background_image`, `title`, `sub_headline`
- No validation exists between generation and Canvas import

## Dependencies

- None (standalone utility)
