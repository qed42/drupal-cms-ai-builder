# TASK-310: Contact page form section — wire form tree builder into page design rules

**Story:** REQ-space-ds-component-gap-analysis §3.1 (Contact Form gap)
**Priority:** P0
**Estimated Effort:** S
**Milestone:** Component Coverage Expansion

## Description

TASK-301 built `buildFormTree()` in `component-tree-builder.ts` but the contact page design rule still says "No organism-level composition patterns needed" and doesn't reference the form section. This task closes the gap by:

1. Adding a `form` section type to the contact page design rule
2. Ensuring the form section is marked as **required**
3. Updating compositionGuidance to reference the form composition pattern

## Technical Approach

1. **Update contact page rule in `page-design-rules.ts`:**
   - Add `form` section as required, position: "middle", after the text section
   - `preferredComponents: ["space_ds:space-form"]`
   - Increase `sectionCountRange` from `[4, 5]` to `[4, 6]` to accommodate form
   - Remove `space_ds:space-testimony-card` from `avoidComponents` (may be useful for trust)
   - Update `compositionGuidance` to: "FORM: MUST include a contact form section composed from space-form, space-input, space-select, and space-textarea atoms via buildFormTree(). This is the primary conversion point of the contact page."

2. **Update `formatRulesForGeneration()` fallback map:**
   - Add `form` → `["space_ds:space-form"]`

3. **Verify `buildFormTree()` is called** during contact page generation in the provisioning pipeline

## Acceptance Criteria

- [ ] Contact page design rule includes required `form` section
- [ ] `compositionGuidance` documents the form composition pattern
- [ ] `formatRulesForGeneration()` includes `form` section type mapping
- [ ] Generated contact pages include a form section in the component tree
- [ ] Existing contact page tests updated to expect form section

## Dependencies
- TASK-301 (buildFormTree — already complete)

## Files/Modules Affected
- `platform-app/src/lib/ai/page-design-rules.ts`
