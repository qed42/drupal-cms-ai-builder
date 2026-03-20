# Sprint 21: Space DS v2 Completion — Prop Safety, Header/Footer, Test Cleanup, E2E Verification

**Milestone:** M15 — Space DS v2 Theme Migration
**Duration:** 4 days
**Predecessor:** Sprint 20 (v2 Foundation — DONE)

## Sprint Goal

Complete the v2 migration by fixing required-prop validation failures, adding header/footer generation, fixing legacy tests, and running end-to-end verification from onboarding through Drupal site provisioning.

## Tasks

### Phase 0: Blocker Fix (Day 1) — Must complete before E2E
| ID | Task | Priority | Effort | Assignee | Status | Parallel? |
|----|------|----------|--------|----------|--------|-----------|
| TASK-322 | Blueprint generation required props audit & fix | P0 | L | `/dev` | Planned | No (blocker) |

### Phase 1: Independent Work (Day 2) — No Dependencies Between Them
| ID | Task | Priority | Effort | Assignee | Status | Parallel? |
|----|------|----------|--------|----------|--------|-----------|
| TASK-320 | Update legacy test files for v2 component IDs (16 failures) | P1 | M | `/dev` | Planned | Yes (A) |
| TASK-317 | Add header/footer generation to provisioning pipeline | P1 | L | `/dev` | Planned | Yes (B) |

### Phase 2: Integration & Verification (Day 3-4) — Depends on Phase 0 + Phase 1
| ID | Task | Priority | Effort | Assignee | Status | Parallel? |
|----|------|----------|--------|----------|--------|-----------|
| TASK-321 | End-to-end v2 pipeline verification | P0 | L | `/qa` | Planned | No |

## Dependencies & Execution Plan

```
Day 1 (sequential — blocker):
  TASK-322 (required props audit & fix)
    Part 1: Audit manifest for ALL required props across 31 components
    Part 2: Expand REQUIRED_PROP_DEFAULTS map with every required prop
    Part 3: Cross-verify manifest required flags against .component.yml files
    Part 4: Add defensive validation in createItem() to auto-inject defaults
    Verify: Re-import existing blueprint bp-IMJona without LogicException

Day 2 (parallel — both independent of each other):
  Track A: TASK-320 (test cleanup)
    - Fix 16 failing unit tests across 6 files
    - Replace v1 component assertions with v2 equivalents
    - Ensure all unit tests pass
  Track B: TASK-317 (header/footer)
    - Add buildHeaderTree() and buildFooterTree() to component-tree-builder.ts
    - Update blueprint schema with header/footer data
    - Update BlueprintImportService for header/footer Canvas entities
    - Generate footer content in AI content generation phase

Day 3-4:
  TASK-321 (E2E verification)
    - Generate FRESH blueprint (do NOT reuse stale blueprints with deprecated field names)
    - Run full onboarding → blueprint generation → provisioning → Drupal site
    - Verify v2 component trees render correctly in Canvas
    - Verify brand colors apply via space_ds.settings
    - Verify header/footer render with all slots
    - Verify flexi grid layouts produce correct visual output
    - File any bugs found as Sprint 21 bugs
```

## Known Bugs (Pre-Sprint)

1. **`background` → `background_color`** — Code fix applied in TASK-314, but stale blueprints on disk still contain the deprecated name. TASK-322 adds normalization. TASK-321 must generate fresh blueprints.
2. **`icon_size` missing on `space-icon`** — Required prop not in `REQUIRED_PROP_DEFAULTS`. Fixed by TASK-322.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| Medium (M) | 1 | TASK-320 |
| Large (L) | 3 | TASK-322, TASK-317, TASK-321 |
| **Total** | **4 tasks** | 1M + 3L |

## Out of Scope (Deferred)

| ID | Task | Reason |
|----|------|--------|
| TASK-307 | Blog page type | Feature, not migration |
| TASK-308 | Gallery organism with slider | Feature, not migration |
| TASK-309 | Map embed for contact pages | Feature, not migration |
| TASK-319 | Layout Architect Agent | Post-migration enhancement |

## Risks

1. **Manifest accuracy** — If `required` flags in the manifest don't match the actual `.component.yml` files, TASK-322's defaults map will be wrong. Part 3 of TASK-322 mitigates this with cross-verification.

2. **Canvas slot depth** — v2 trees are 4-5 levels deep. If Canvas/XB module has depth limits, sections may not render. Mitigation: TASK-321 E2E test catches this early.

3. **Header/footer placement** — Unclear whether Canvas expects header/footer as block content in regions or as inline page components. TASK-317 needs to investigate Canvas layout architecture first.

4. **Component version hashes** — 14 new components have placeholder "0000000000000000" hashes. The import service resolves real versions at runtime, but if a component entity doesn't exist in the Drupal registry, it falls back to the placeholder. Verify all 31 components are registered after theme install.

5. **Stale blueprints** — Existing blueprints on disk were generated with v1 code and contain deprecated field names. TASK-321 MUST generate fresh blueprints rather than reusing old ones.

## Definition of Done

### Required Props Fix (TASK-322)
- [ ] Every required prop for all 31 components has a default in REQUIRED_PROP_DEFAULTS
- [ ] createItem() auto-injects defaults for missing required props
- [ ] Manifest required flags verified against .component.yml source files
- [ ] Existing blueprint imports without LogicException errors

### Test Cleanup (TASK-320)
- [ ] 0 unit test failures (currently 16)
- [ ] Tests validate v2 behavior, not just pass trivially

### Header/Footer (TASK-317)
- [ ] Header renders with logo, navigation menu, CTA button
- [ ] Footer renders with brand info, social links, nav columns, copyright
- [ ] Mobile hamburger menu works
- [ ] Blueprint JSON includes header/footer data

### E2E Verification (TASK-321)
- [ ] Full pipeline runs without errors: onboarding → blueprint → provisioning → Drupal site
- [ ] Home page renders with v2 hero, flexi content sections, CTA
- [ ] Contact page renders with contact-cards
- [ ] Brand colors visible via --sds-* CSS variables
- [ ] Header/footer visible on all pages

### Sprint-Level
- [ ] All unit tests pass
- [ ] No TypeScript compilation errors
- [ ] Code committed with descriptive messages
- [ ] Sprint 20+21 together deliver a fully functional v2 pipeline
