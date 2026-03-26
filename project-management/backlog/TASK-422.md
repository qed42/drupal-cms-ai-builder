# TASK-422: Remove hardcoded "Welcome" fallback from Mercury hero tree-builder

**Story:** US-074
**Priority:** P0
**Estimated Effort:** S
**Milestone:** M21 — Content Quality Hardening

## Description
The Mercury `buildHeroSection()` function has a hardcoded `|| "Welcome"` fallback at line 874 of `tree-builders.ts`. When the AI generates the heading as a child component in `hero_slot` (the correct pattern), but doesn't also set `heading_text` on the hero's own props, the tree-builder ignores the child heading and injects "Welcome" instead.

## Root Cause
```typescript
// tree-builders.ts:874
heading_text: heroInputs.heading_text || "Welcome",
```
This fallback fires when `heroInputs.heading_text` is undefined — which happens whenever the AI correctly outputs the heading as a child component rather than a top-level prop.

## Technical Approach
1. In `packages/ds-mercury/src/tree-builders.ts`, `buildHeroSection()` function:
   - When `!hasHeadingChild` AND `heroInputs.heading_text` is falsy, use the site's business name or tagline as fallback — not "Welcome"
   - Accept an optional `fallbackHeadline` parameter (string) that the caller provides from onboarding data (business name + tagline)
   - Last-resort fallback: use the page title (still better than "Welcome")
2. Update `component-tree-builder.ts` to pass business context when calling `buildHeroSection()`
3. If a heading child IS present in the children array, ensure its `heading_text` is preserved — the current code already handles this at lines 885-918, so no change needed there

## Acceptance Criteria
- [ ] Hero billboard never renders "Welcome" as heading text
- [ ] When AI provides a heading child in hero_slot, the child's heading_text is used as-is
- [ ] When no heading child exists and no heading_text prop is on the hero, fallback uses business name or page title
- [ ] Existing sites with properly-generated headings are unaffected (no regression)

## Files Affected
- `packages/ds-mercury/src/tree-builders.ts` (modify `buildHeroSection`)
- `platform-app/src/lib/blueprint/component-tree-builder.ts` (pass fallback context)
