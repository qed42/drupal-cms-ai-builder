# Sprint 22: v2 Pipeline Stabilization — Layout Quality, Rendering Fixes, E2E Verification

**Milestone:** M16 — Pipeline Stabilization & Quality
**Duration:** 4 days
**Predecessor:** Sprint 21 (v2 Completion — DONE)

## Sprint Goal

Stabilize the v2 pipeline by fixing rendering bugs (NULL props, duplicate menu items, color misalignment), improving layout composition quality, enhancing footer navigation, and verifying the full pipeline end-to-end.

## Tasks

### Phase 0: Bug Fixes (Day 1) — No Dependencies, Parallelizable
| ID | Task | Priority | Effort | Assignee | Status | Parallel? |
|----|------|----------|--------|----------|--------|-----------|
| TASK-324 | Fix NULL image props breaking Canvas component rendering | P0 | M | `/dev` | Planned | Yes (A) |
| TASK-304 | Fix duplicate Home menu item in generated navigation | P1 | S | `/dev` | Planned | Yes (B) |
| TASK-327 | Align color palette generation with Space DS theme settings keys | P0 | M | `/dev` | Planned | Yes (C) |

### Phase 1: Layout & Composition Quality (Day 2) — TASK-324 must be done first
| ID | Task | Priority | Effort | Assignee | Status | Parallel? |
|----|------|----------|--------|----------|--------|-----------|
| TASK-323 | Enhance AI prompts and tree builder with compositional layout guidelines | P0 | L | `/dev` | Planned | Yes (A) |
| TASK-326 | Update footer generation to use menu items for navigation links | P1 | M | `/dev` | Planned | Yes (B) |

### Phase 2: E2E Verification (Day 3-4) — Depends on All Above
| ID | Task | Priority | Effort | Assignee | Status | Parallel? |
|----|------|----------|--------|----------|--------|-----------|
| TASK-321 | End-to-end v2 pipeline verification | P0 | L | `/qa` | Planned | No |

## Dependencies & Execution Plan

```
Day 1 (parallel — all independent bug fixes):
  Track A: TASK-324 (NULL image props)
    - Add filtering in component-tree-builder.ts to strip NULL/empty image props
    - Add defensive filtering in BlueprintImportService.php before Canvas save
    - Verify components fall back to their defaults when image props absent
  Track B: TASK-304 (duplicate Home menu)
    - Trace menu link creation in provisioning pipeline
    - Add deduplication check before inserting menu items
    - Verify single "Home" entry in generated nav
  Track C: TASK-327 (color palette alignment)
    - Update color generation to use Space DS native token names directly
    - Map all 24 settings: base_brand_color, accent_color_primary/secondary,
      10 background_color_N variants, state colors, fonts
    - Eliminate fragile intermediate mapping layer

Day 2 (parallel — independent of each other, but after TASK-324):
  Track A: TASK-323 (layout guidelines)
    - Encode 10 composition rules into AI prompts + tree builder:
      container wrapping, width strategy, background variety, section spacing,
      flexi column matching, anti-monotony, semantic HTML, icon validation,
      heading hierarchy, one h1 per page
    - Update page-generation.ts and component-tree-builder.ts
  Track B: TASK-326 (footer navigation)
    - Populate footer columns slot with nav links from page list
    - Add social media links via social_links slot
    - Use Phosphor icon names for social icons

Day 3-4:
  TASK-321 (E2E verification — deferred from Sprint 21)
    - Generate FRESH blueprint with v2 pipeline (do NOT reuse stale v1 blueprints)
    - Run full: onboarding → blueprint generation → provisioning → Drupal site
    - Verify v2 component trees render correctly in Canvas
    - Verify brand colors apply via space_ds.settings (using new TASK-327 alignment)
    - Verify header/footer render with all slots (including TASK-326 nav links)
    - Verify no NULL prop errors in Canvas rendering (TASK-324 fix)
    - Verify single Home menu item (TASK-304 fix)
    - Verify layout composition quality (TASK-323 rules)
    - File any bugs found as Sprint 22 bugs
```

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| Small (S) | 1 | TASK-304 |
| Medium (M) | 3 | TASK-324, TASK-327, TASK-326 |
| Large (L) | 2 | TASK-323, TASK-321 |
| **Total** | **6 tasks** | 1S + 3M + 2L |

## Out of Scope (Deferred to Sprint 23+)

| ID | Task | Reason |
|----|------|--------|
| TASK-301 | Contact page form component | XL effort, needs dedicated sprint |
| TASK-302 | Revise section count ranges | Depends on TASK-323 layout rules first |
| TASK-303 | Organism-level composition rules | Overlaps with TASK-323; evaluate after |
| TASK-305 | Wire underutilized components | Feature, not stabilization |
| TASK-307 | Blog page type | XL feature, post-stabilization |
| TASK-308 | Gallery organism | Feature, depends on TASK-305 |
| TASK-325 | Pexels image integration | Depends on TASK-324; post-stabilization |
| TASK-319 | Layout Architect Agent | Post-stabilization enhancement |
| BUG-S14-001 | Malformed props_json recovery | Open bug, lower priority than rendering |

## Risks

1. **NULL prop filtering scope** — TASK-324 may surface additional required props that need defaults beyond what TASK-322 covered. Mitigation: TASK-322's dynamic defaults map auto-derives from manifest, so only truly missing defaults would be an issue.

2. **Color token count** — TASK-327 maps 24 Space DS settings. If the AI generates fewer colors than needed, some backgrounds will fall back to defaults. Mitigation: set sensible defaults for all 24 tokens in the generation prompt.

3. **Layout rule conflicts** — TASK-323's 10 rules may conflict with each other (e.g., anti-monotony vs. consistent width strategy). Mitigation: prioritize rules and document precedence.

4. **E2E environment readiness** — TASK-321 requires a running DDEV environment with the latest v2 code deployed. Mitigation: verify DDEV setup before Day 3.

5. **Footer nav link ordering** — TASK-326 depends on page list being available at footer build time. Verify that blueprint generation order produces pages before footer.

## Definition of Done

### NULL Props Fix (TASK-324)
- [ ] NULL/empty image props stripped before Canvas save
- [ ] Components render with their defaults when no image provided
- [ ] No LogicException or rendering errors from NULL props

### Duplicate Menu Fix (TASK-304)
- [ ] Single "Home" menu item in generated navigation
- [ ] All other page menu items present and correct

### Color Alignment (TASK-327)
- [ ] All 24 Space DS color settings generated directly (no intermediate mapping)
- [ ] Brand colors visible via --sds-* CSS variables on generated site
- [ ] Background color variants provide visual variety across sections

### Layout Guidelines (TASK-323)
- [ ] 10 composition rules encoded in prompts and/or tree builder
- [ ] Generated pages show visual variety (background alternation, width variation)
- [ ] Heading hierarchy correct (single h1, proper h2-h4 nesting)
- [ ] Icon usage validated against Phosphor icon set

### Footer Navigation (TASK-326)
- [ ] Footer columns populated with page navigation links
- [ ] Social media links rendered in social_links slot
- [ ] Phosphor icon names used for social icons

### E2E Verification (TASK-321)
- [ ] Full pipeline runs without errors: onboarding → blueprint → provisioning → site
- [ ] Home page renders with v2 hero, flexi content sections, CTA
- [ ] Contact page renders with contact-cards
- [ ] Brand colors visible via Space DS theme settings
- [ ] Header/footer visible on all pages with correct content
- [ ] No duplicate menu items
- [ ] No NULL prop rendering errors
- [ ] Layout composition shows visual variety and correct structure

### Sprint-Level
- [ ] All unit tests pass (421+ tests)
- [ ] No TypeScript compilation errors
- [ ] Code committed with descriptive messages
- [ ] Sprint output report created
