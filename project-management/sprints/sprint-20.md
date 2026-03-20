# Sprint 20: Space DS v2 Migration — Foundation

**Milestone:** M15 — Space DS v2 Theme Migration
**Duration:** 5 days
**Predecessor:** Sprint 19 (Bug Bash — DONE)

## Sprint Goal

Rebuild the AI generation foundation for the new Space DS v2 theme: component manifest, page design rules, brand token service, and component tree builder. This sprint makes the pipeline compile and produce valid v2 component trees.

## Context

Space DS theme upgraded from v1 (84 pre-composed components) to v2 (31 compositional components). The entire generation pipeline references deleted components and must be rewritten. See `project-management/requirements/architecture/space-ds-v2-migration.md` for full analysis.

**Key paradigm shift:** Old model picked pre-built organisms. New model composes sections from `space-flexi` grid layouts + atoms in named slots.

**Previous tasks invalidated:** TASK-305 through TASK-311 (from gap analysis) are mostly invalidated by the theme change. TASK-308 (gallery/slider) and TASK-309 (map) remain valid in concept but are deferred.

## Tasks

### Phase 1: Data Foundation (Day 1) — No Dependencies
| ID | Task | Priority | Effort | Assignee | Status | Parallel? |
|----|------|----------|--------|----------|--------|-----------|
| TASK-312 | Rebuild space-component-manifest.json from v2 theme (31 components) | P0 | M | `/dev` | Planned | Yes (A) |
| TASK-315 | Migrate BrandTokenService to write space_ds.settings config | P0 | M | `/dev` | Planned | Yes (B) |

### Phase 2: AI Pipeline Rewrite (Day 2-3) — Depends on TASK-312
| ID | Task | Priority | Effort | Assignee | Status | Parallel? |
|----|------|----------|--------|----------|--------|-----------|
| TASK-313 | Rewrite page-design-rules.ts for compositional model | P0 | L | `/dev` | Planned | Yes (A) |
| TASK-316 | Update AI generation prompts for compositional model | P0 | L | `/dev` | Planned | Yes (B) |

### Phase 3: Tree Builder & Import (Day 4-5) — Depends on TASK-312, TASK-313
| ID | Task | Priority | Effort | Assignee | Status | Parallel? |
|----|------|----------|--------|----------|--------|-----------|
| TASK-314 | Rewrite component-tree-builder.ts for slot-based composition | P0 | XL | `/dev` | Planned | Yes (A) |
| TASK-318 | Update BlueprintImportService for nested slot trees | P0 | L | `/dev` | Planned | Yes (B) |

## Dependencies & Execution Plan

```
Day 1 (parallel — no dependencies):
  Track A: TASK-312 (manifest rebuild)
    - Parse all 31 .component.yml files from new theme
    - Generate JSON manifest with props, slots, enums, image refs
    - Remove all 53 deleted components
  Track B: TASK-315 (brand tokens)
    - Rewrite BrandTokenService.php to write space_ds.settings config
    - Map color token keys → theme setting keys
    - Remove CSS file generation
    - Keep logo handling

Day 2-3 (parallel — both depend on TASK-312):
  Track A: TASK-313 (page design rules)
    - Rewrite all 10 page type rules with v2 component IDs
    - Define composition patterns (text-image-split, features-grid, etc.)
    - Update formatRulesForPlan() and formatRulesForGeneration()
    - Map 4 hero types to appropriate page types
  Track B: TASK-316 (AI prompts)
    - Update page-layout prompt with composition patterns
    - Update content-generation prompt for atom-level content
    - Remove form generation prompt (form atoms gone)
    - Add section heading pattern guidance

Day 4-5 (parallel — depend on 312, 313):
  Track A: TASK-314 (component tree builder) — CRITICAL PATH
    - Build section-level builders (hero, content, features, stats, etc.)
    - Implement flexi grid composition helpers
    - Implement slider carousel helpers
    - Implement container background alternation for visual rhythm
    - Remove old SKIP_CONTAINER, VARIANT_FAMILIES, buildFormTree
  Track B: TASK-318 (Drupal import service)
    - Verify N-level nested slot trees import correctly
    - Handle Canvas image objects for $ref image props
    - Handle multiple children in same slot (slider items)
    - Update component version lookup for new components
```

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| Medium (M) | 2 | TASK-312, TASK-315 |
| Large (L) | 3 | TASK-313, TASK-316, TASK-318 |
| Extra-Large (XL) | 1 | TASK-314 |
| **Total** | **6 tasks** | 2M + 3L + 1XL |

## Out of Scope (Deferred to Sprint 21)

| ID | Task | Reason |
|----|------|--------|
| TASK-317 | Header/footer generation in provisioning pipeline | Depends on TASK-314, lower priority |
| TASK-307 | Blog page type (updated for v2 imagecard) | Feature, not migration |
| TASK-308 | Gallery organism with slider | Feature, not migration |
| TASK-309 | Map embed for contact pages | Feature, not migration |

## Risks

1. **TASK-314 is the critical path** — It's XL effort and everything downstream depends on it. If it slips, Sprint 21 tasks are blocked. Mitigation: Start TASK-314 early on Day 3 if TASK-313 finishes fast.

2. **Canvas slot nesting depth** — The new component trees are 4-5 levels deep (page → container → flexi → column → atom). Verify Canvas/XB module supports this depth. If not, may need to flatten.

3. **Missing pricing components** — DECIDED: Drop pricing page type entirely. Remove from PageType union in TASK-313.

4. **Missing form components** — DECIDED: Use Drupal core Contact module for contact form. Provisioning enables `contact` module, creates contact form entity, places block on contact page. Contact info display uses `space-contact-card` molecules. See `memory/sprint20_decisions.md`.

5. **BlueprintImportService slot handling** — May already support named slots, or may need significant refactoring. TASK-318 should audit first before rewriting.

6. **Test coverage** — All existing tests reference v1 component IDs. Every test file touching component IDs will break. Budget time for test updates within each task.

## Definition of Done

### Manifest (TASK-312)
- [ ] Manifest contains exactly 31 components matching `drupal-site/web/themes/contrib/space_ds/components/`
- [ ] All props with correct types, enums, defaults, required flags
- [ ] All slots documented with names and expected child types
- [ ] Canvas image ref type (`$ref`) properly represented

### Brand Tokens (TASK-315)
- [ ] Colors from blueprint written to `space_ds.settings` config (not CSS file)
- [ ] Theme generates correct `--sds-*` CSS variables after config set
- [ ] Logo still applied via theme settings
- [ ] Drush apply-brand command works with new approach

### Page Design Rules (TASK-313)
- [ ] All 10 page types reference only v2 component IDs
- [ ] Zero references to deleted components
- [ ] Composition patterns defined for all section types
- [ ] formatRulesForPlan() and formatRulesForGeneration() produce valid output
- [ ] classifyPageType() unchanged and working

### AI Prompts (TASK-316)
- [ ] Prompts generate composition patterns (not flat organism IDs)
- [ ] Content generation targets individual atoms
- [ ] No references to deleted components in any prompt

### Component Tree Builder (TASK-314)
- [ ] All section types produce valid Canvas trees with parent-child-slot relationships
- [ ] Flexi layouts use correct column widths per pattern
- [ ] Slider carousel works for testimonials, blog, portfolio
- [ ] Container backgrounds alternate for visual rhythm
- [ ] Output compatible with BlueprintImportService

### Blueprint Import (TASK-318)
- [ ] N-level nested trees import into Canvas correctly
- [ ] Named slots (column_one, slide_item, cta_content, etc.) map correctly
- [ ] Canvas image objects created for image props
- [ ] HTML content preserved for rich text props

### Sprint-Level
- [ ] End-to-end: onboarding → blueprint → provisioning → Drupal site with v2 components
- [ ] All tests updated for v2 component IDs
- [ ] No TypeScript compilation errors
- [ ] Code committed with descriptive messages
