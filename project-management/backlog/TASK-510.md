# TASK-510: Add Heading Hierarchy, Color Patterns & Intra-Section Spacing Rules

**Story:** US-109 — P1 Design Quality
**Priority:** P1
**Effort:** M
**Milestone:** M27 — Design Rules Engine

## Description

Extend the design rules YAML definitions with P1 quality rules that address remaining visual consistency gaps:

1. **Heading hierarchy** — Add a composition rule specifying h1 (hero only), h2 (section titles), h3 (card/feature titles), h4 (sub-headings)
2. **Color usage pattern** — Add a visual rule specifying when to use `--color-primary` (CTAs, key headings) vs `--color-accent` (hover states, decorative elements)
3. **Intra-section spacing** — Add spacing tokens for internal element rhythm: heading→subtitle (mb-4), subtitle→content (mb-6), content→CTA (mb-8 or mb-12)

## Technical Approach

1. **Extend `global.yaml`**: Add `headingHierarchy` to composition rules, `colorUsagePattern` to visual rules, and `intraSpacing` to tokens
2. **Extend types**: Add new fields to `CompositionRules` and `TokenRules` interfaces
3. **Extend prompt compiler**: Emit the heading hierarchy and color patterns in appropriate sections; emit intra-spacing in the tokens section
4. **Industry overrides**: Healthcare might use more generous spacing; portfolio might use tighter spacing for editorial density

## Acceptance Criteria

- [ ] Heading hierarchy rule defined in global.yaml and emitted in prompt
- [ ] Color usage pattern defined and emitted in prompt
- [ ] Intra-section spacing tokens defined and emitted in prompt
- [ ] Industry-specific overrides where appropriate
- [ ] Tests updated for new rules
- [ ] No regression in existing 37 tests

## Dependencies

- Design tokens implementation (TASK-509 or earlier)
