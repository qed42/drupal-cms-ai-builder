# Sprint 04: Drupal CMS Foundation & Blueprint Import

**Milestone:** M3 — Blueprint & Provisioning
**Duration:** 2 weeks (~10 dev days)
**Architecture:** v2 (Split Platform) — **Drupal CMS 2.0 baseline + Space DS theme**

## Sprint Goal
Set up Drupal CMS 2.0 with Space DS theme, validate provisioning assumptions, and implement all Drush commands for importing blueprints (with pre-built Canvas component trees) from the platform JSON format. Achieve the end-to-end flow: blueprint JSON → Drupal site provisioned and accessible.

## Architecture Decisions

### Drupal CMS 2.0 Baseline
Use `composer create-project drupal/cms` instead of `drupal/recommended-project`. Gives us Canvas, Webform, Pathauto, Metatag, Media, AI modules — 57 pre-configured modules. Only `ai_site_builder` custom module needs enabling per-site.

### Space DS Theme (retained)
Space DS is battle-tested for SDC + Canvas compatibility. The 84-component manifest from Sprint 03 remains valid. No theme migration needed.

### Component Trees Generated During Onboarding
The Next.js blueprint generator produces Canvas-ready component tree structures during the onboarding journey. The blueprint JSON includes `component_tree` per page. Drupal just receives and saves the pre-built trees — no component placement logic on the Drupal side. This is deterministic, fast, and keeps the AI complexity in the Next.js layer.

## Tasks
| ID | Task | Story | Workstream | Effort | Status |
|----|------|-------|------------|--------|--------|
| TASK-123 | Drupal CMS Foundation Spike | Foundation | Drupal | M | Done |
| TASK-109b | Blueprint Generator — Canvas Component Tree Output | US-013 | Next.js | M | Done |
| TASK-113 | Content Type Config Definitions (v2) | US-012 | Drupal | L | Done |
| TASK-115 | Brand Token Service (v2) | US-016 | Drupal | M | Done |
| TASK-114 | Blueprint Import Service (JSON→Entities) | US-013 | Drupal | M | Done |
| TASK-112 | Drupal Drush Commands | US-012, US-013, US-016 | Drupal | XL | Done |
| TASK-111 | Provisioning Engine (Core Orchestrator) | Foundation | Provisioning | L | Done |

## Execution Order & Dependencies

```
Phase 0 — Spike (Days 1-2):
└── TASK-123: Drupal CMS setup, Space DS + Canvas validation,
    Canvas component tree format documentation, CLI install test, multisite test
    └── BLOCKER: All subsequent tasks depend on spike findings

Phase 1 — Parallel (Days 3-5):
├── TASK-109b: Blueprint generator → Canvas component tree output (Next.js, depends on TASK-123 tree format)
├── TASK-113: Content type YAML configs (Drupal, depends on TASK-123 for Drupal CMS context)
└── TASK-115: Brand token CSS service (Drupal, depends on TASK-123 for Space DS theming context)

Phase 2 (Days 6-7):
└── TASK-114: Blueprint import service
    └── Depends on: TASK-113 (content types), TASK-109b (component tree in blueprint)
    └── Simplified: saves pre-built component trees, no Canvas placement logic

Phase 3 (Days 8-9):
└── TASK-112: Drush commands — import-config, import-blueprint, apply-brand, configure-site
    └── Depends on: TASK-113, TASK-114, TASK-115

Phase 4 (Day 10):
└── TASK-111: Provisioning engine orchestrator
    └── Depends on: TASK-112, TASK-123 (CLI install method)
```

## Critical Context from Sprint 03

### Blueprint Format is JSON with Component Trees
Sprint 03 implemented blueprints as JSON stored in Prisma `Blueprint.payload`. For Sprint 04, the blueprint schema expands to include `component_tree` per page:

```json
{
  "site": { "name", "tagline", "industry", ... },
  "brand": { "colors": {}, "fonts": {}, "logo_url?" },
  "pages": [{
    "slug": "home",
    "title": "Home",
    "component_tree": { /* Canvas-ready structure */ },
    "sections": [{ "component_id": "space_ds:space-hero-banner-style-01", "props": {} }]
  }],
  "content": { "services?": [], "team_members?": [], ... },
  "forms": { "contact": { "fields": [] } }
}
```

`component_tree` is the Canvas entity format (schema documented in TASK-123 spike). `sections` is retained as human-readable reference but not used for Canvas import.

### Blueprint Generator Update (TASK-109b)
After TASK-123 documents the Canvas component tree format, TASK-109b updates the Next.js blueprint generator to produce `component_tree` in addition to `sections`. Runs in parallel with TASK-113 and TASK-115 during Phase 1.

## Dependencies & Risks
- **Sprint 03 must be complete:** Blueprint JSON format defined and generator working ✅
- **Risk: Drupal CMS CLI install** — Installer designed for web UI. Spike resolves this.
- **Risk: Canvas component tree format** — Undocumented internal structure. Spike must reverse-engineer and document it for the Next.js generator to produce valid trees.
- **Risk: Sprint scope** — 6 tasks is manageable. If behind by Day 8, defer TASK-111 to Sprint 04b.
- **Parallel opportunity:** TASK-113 and TASK-115 are independent after spike completion.

## Deliverable
Complete Drupal-side pipeline: given a blueprint JSON (with pre-built Canvas component trees), the Drush commands create a fully functional Drupal CMS site with Space DS-themed pages, content entities, forms, and brand styling. Provisioning engine automates the end-to-end flow.

## Definition of Done
- [ ] Drupal CMS 2.0 running on DDEV with Canvas + Space DS theme
- [ ] Spike findings documented (CLI install, Canvas tree format, Space DS compat, multisite)
- [ ] Content type configs install cleanly per industry
- [ ] Blueprint import service saves pre-built component trees to canvas_page entities
- [ ] Brand token service generates CSS custom properties for Space DS
- [ ] All 4 Drush commands functional and idempotent
- [ ] Provisioning engine: creates DB → installs Drupal CMS → Space DS → runs Drush → callbacks
- [ ] Provisioning engine rollback works on failure
- [ ] End-to-end test: blueprint JSON → provision → site accessible with Space DS theme
- [ ] Playwright tests for provisioning status API + dashboard status updates
- [ ] Code committed
