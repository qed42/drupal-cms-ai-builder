# TASK-529: Fix Canvas LinkUrl null crash for link-type props

**Story:** BUG-057
**Sprint:** 57
**Effort:** S
**Status:** Done

## Problem

Canvas `LinkUrl::getCastedValue()` throws `TypeError: Return value must be of type string, null returned` when a code component has a `format: uri` prop with no valid input value.

## Root Cause

Two paths produce invalid link prop inputs:

1. **Optional link props with null default omitted from inputs** — The AI prompt instructs `default: null` for link props. In `generate-code-components.ts`, when `p.default === null` and `p.required === false`, the prop is filtered out entirely. Canvas config YAML still declares the prop with `format: uri`, but the component tree has no input for it. Canvas's `LinkUrl::getValue()` returns null.

2. **Empty string link defaults bypass sanitizer** — If AI generates `default: ""`, it passes the `!== null` check and is included as `""`. The provisioning sanitizer's condition `value && !VALID_URL_PATTERN.test(value)` treats empty string as falsy, so it passes through. Canvas gets `""` for a `format: uri` prop.

## Fix (two layers)

### Layer 1: Source (generate-code-components.ts)
Link props are now always included with a valid URL regardless of required/optional status. Validates the AI-generated default is actually a URL before using it; falls back to `https://example.com`.

### Layer 2: Sanitizer (08-import-blueprint.ts)
Changed `value && !VALID_URL_PATTERN.test(value)` to `!value || !VALID_URL_PATTERN.test(value)` so empty strings are caught and replaced with the safe placeholder.

## Files Changed

- `platform-app/src/lib/pipeline/phases/generate-code-components.ts` — Link prop handling moved before other checks; always provides valid URL
- `provisioning/src/steps/08-import-blueprint.ts` — Empty string gap closed in URL sanitizer

## Acceptance Criteria

- [x] Optional link props with null defaults produce valid URL in component tree inputs
- [x] Empty string link defaults are replaced with placeholder URL
- [x] All existing tests pass (36 prompt tests, 50 rules tests)
- [x] TypeScript compilation clean
