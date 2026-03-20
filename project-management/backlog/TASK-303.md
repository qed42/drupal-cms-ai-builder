# TASK-303: Add organism-level component composition rules to page generation

**Type:** Enhancement
**Priority:** P1 — High
**Severity:** Medium
**Found:** Sprint 18 QA — Visual Review (2026-03-20)

## Description

Generated pages use flat, repetitive component stacking instead of composing components into organism-level patterns. For example:
- **Testimonials** are rendered as individual cards stacked vertically instead of being grouped into a carousel/slider organism
- **FAQ items** are placed as separate text blocks instead of being structured as accordion items within an accordion container
- **Team members** are listed individually instead of being composed into a team grid organism
- **Feature cards** are stacked linearly instead of grouped into a features grid

The Space DS manifest already has organism-level components (carousels, accordions, team grids, feature grids) — but the page generation prompts and component tree builder don't guide the AI to use them as containers for related content.

## Root Cause

The component tree builder treats each section independently. There are no composition rules that say "when you have 3+ testimonials, wrap them in a carousel" or "FAQ items must be children of an accordion component."

## Acceptance Criteria

- [ ] Testimonial cards are composed into a carousel/slider organism (not stacked vertically)
- [ ] FAQ items are structured as accordion items within an accordion container component
- [ ] Team members are placed inside a team grid organism
- [ ] Feature/service cards are grouped into grid layouts (2-3 columns)
- [ ] Composition rules are defined in page-design-rules or a dedicated composition config
- [ ] Page generation prompt includes explicit organism composition guidance
- [ ] Component tree builder enforces parent-child relationships for known organism patterns

## Composition Rules to Implement

| Content Type | Wrong Pattern (current) | Correct Pattern (target) |
|-------------|------------------------|--------------------------|
| Testimonials | Stack of `space-testimony-card` | `space-testimony-carousel` or `space-testimony-slider` wrapping cards |
| FAQ items | Stack of `space-text-media` | `space-accordion` wrapping `space-accordion-item` children |
| Team members | Stack of cards | `space-team-*` organism wrapping member entries |
| Features | Vertical list of `space-feature-card` | `space-features-grid` or similar grid organism |
| Pricing tiers | Stacked `space-pricing-card` | Side-by-side pricing comparison layout |

## Files to Modify

1. `platform-app/src/lib/ai/page-design-rules.ts` — Add `compositionRules` per page type defining organism wrappers
2. `platform-app/src/lib/ai/prompts/page-layout.ts` — Add organism composition guidance to layout prompt
3. `platform-app/src/lib/ai/prompts/page-generation.ts` — Add explicit instructions for using organism containers
4. `platform-app/src/lib/blueprint/component-tree-builder.ts` — Enforce organism wrapping during tree build

## Technical Notes

- Review `space-component-manifest.json` for available organism components — grep for `carousel`, `slider`, `accordion`, `team`, `grid`
- The accordion components have multiple variants (Variation-1 through Variation-4) — pick the most appropriate default
- Carousel/slider organisms need to be verified in Canvas for prop compatibility
- This change works synergistically with TASK-302 (higher section counts) — more sections means more opportunity for organism grouping
