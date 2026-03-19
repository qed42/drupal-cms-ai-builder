# Sprint 14: Blueprint Validation & AI Regeneration

**Milestone:** M8 — Content Review & Editing
**Duration:** 1 week

## Sprint Goal
Eliminate blueprint provisioning failures by adding manifest-based component prop validation with retry, then deliver AI regeneration features for the review page.

## Priority Context
A P0 provisioning bug was discovered: the AI generates invalid props (e.g., `description` on `space-hero-banner-style-01` which only accepts `title`, `sub_headline`, `background_image`). This causes Canvas import to throw `OutOfRangeException` and the entire site provisioning to fail. The root cause is twofold:
1. The page generation prompt hardcodes incorrect prop examples
2. No prop-level validation exists between generation and Canvas import

A component prop validator must be built and integrated BEFORE regeneration features, since regeneration would multiply the same invalid-prop problem.

## Tasks

### Phase 1: Bug Fixes & Validation Foundation (Days 1-2)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-270 | Fix Sprint 13 QA Bugs (BUG-S13-001/002/003) | Sprint 13 QA | S | Done |
| TASK-268 | Component Prop Validator (manifest-based schema enforcement) | FR-205 | L | Done |
| TASK-269 | Integrate Validator into Generate Pipeline + Fix Prompt | FR-205 | M | Done |

### Phase 2: AI Regeneration Features (Days 3-5)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-233 | Per-Section AI Regeneration | US-048 | L | Done |
| TASK-234 | Per-Page Regeneration | US-049 | M | Done |
| TASK-235 | Page Add/Remove from Review | US-050 | M | Done |

### Deferred to Sprint 15
| ID | Task | Reason |
|----|------|--------|
| TASK-237 | Version Comparison Diff View | Lower priority than validation fix |
| TASK-239 | Download Menu (JSON + Markdown ZIP) | Lower priority than validation fix |
| TASK-221 | Phase Retry & Re-run | Partially addressed by TASK-269 retry logic |

## Dependencies & Risks

### Dependency Chain
```
TASK-270 (bug fixes) → no dependencies, do first
TASK-268 (validator) → no dependencies, can parallel with TASK-270
TASK-269 (pipeline integration) → depends on TASK-268
TASK-233 (section regen) → depends on TASK-269 (regen must use validator)
TASK-234 (page regen) → depends on TASK-233
TASK-235 (page add/remove) → depends on TASK-234
```

### Risks
- **Component manifest drift**: `space-component-manifest.json` has 84 components but `canvas-component-versions.ts` only maps 74. Need to reconcile during TASK-268
- **Prompt regression**: Fixing the hardcoded prop examples in `page-generation.ts` may change AI output quality — test with multiple industries
- **Regeneration consistency**: Per-section regeneration must maintain style/tone consistency with surrounding sections (existing research brief + plan context must be passed)
- **Two generation paths**: Both `page-generation.ts` (per-page) and `page-layout.ts` (batch) exist — validator must cover both paths

## Definition of Done

### Phase 1 (Validation)
- [ ] Sprint 13 bugs verified fixed
- [ ] Component validator strips invalid props and flags errors
- [ ] Validator integrated into generate pipeline with retry on validation failure
- [ ] `page-generation.ts` prompt uses manifest-derived prop examples
- [ ] No blueprint can reach approval/provisioning with invalid component props
- [ ] Unit tests cover validator edge cases

### Phase 2 (Regeneration)
- [ ] "Regenerate" button on each section with optional guidance input
- [ ] Section regeneration completes within 15 seconds
- [ ] "Undo" restores previous version after regeneration
- [ ] Page regeneration rebuilds entire page from brief/plan
- [ ] Add page generates new content consistent with existing site
- [ ] Remove page prompts confirmation and updates blueprint
- [ ] All regenerated content passes through component validator
- [ ] All code committed with passing tests
