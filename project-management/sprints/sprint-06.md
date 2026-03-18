# Sprint 06: Site Editing & AI Regeneration

**Milestone:** M4 — Site Editing
**Duration:** 2 weeks (~10 dev days)
**Architecture:** v2 (Split Platform)

## Sprint Goal
Enable site owners to manage pages, regenerate sections with AI, and ensure multi-tenant data isolation across provisioned sites.

## Context

Sprint 05/05b delivered end-to-end provisioning: onboarding → blueprint → Drupal site goes live → dashboard with "Edit Site" → auto-login to Canvas editor. The Drupal module (`ai_site_builder`) has:
- `BlueprintImportService` — creates pages, menus, webforms from blueprint
- `BrandTokenService` — applies colors, fonts, logo
- `AutoLoginService` — JWT-based auto-login
- Canvas editor configured with Space DS components (TASK-118)
- site_owner role with editing permissions (TASK-118)

This sprint adds **content management capabilities** for site owners and the **security foundation** for multisite isolation.

## Tasks
| ID | Task | Story | Workstream | Effort | Status |
|----|------|-------|------------|--------|--------|
| TASK-034 | Node Access & Data Isolation | Foundation | Drupal | M | Not Started |
| TASK-023 | Page Add & Remove | US-020 | Drupal | M | Not Started |
| TASK-119 | Section-Level AI Regeneration | US-021 | Drupal | L | Not Started |

## Task Details

### TASK-034: Node Access & Data Isolation (P0 — Security)
**Backlog:** `backlog/task-034-node-access-data-isolation.md`

Per-site data isolation via Drupal's node access grants system:
- `SiteContextService` — detects current site from HTTP host
- `hook_node_access_records()` / `hook_node_grants()` — realm-based access
- `field_site_id` on content entities, populated during provisioning
- Query filtering to scope all content to current site
- Admin bypass for uid=1 / administrator role

**Key files to create/modify:**
- `src/Service/SiteContextService.php` — new
- `ai_site_builder.module` — add access hooks
- `BlueprintImportService.php` — ensure site_id field is set during import

### TASK-023: Page Add & Remove
**Backlog:** `backlog/task-023-page-add-remove.md`

Page lifecycle management from Canvas editor:
- "Add Page" action → creates node with default component tree + menu link + URL alias
- "Delete Page" with confirmation → removes node + menu link
- Front page deletion prevention
- site_owner permissions for page CRUD

**Key files to create/modify:**
- `src/Controller/PageManagementController.php` — new (or REST resource)
- `ai_site_builder.routing.yml` — add page management routes
- `ai_site_builder.module` — page event hooks

### TASK-119: Section-Level AI Regeneration
**Backlog:** `backlog/task-119-section-ai-regeneration.md`

AI content regeneration within Canvas editor:
- **First:** Investigate `canvas_ai` module capabilities (pre-installed via Drupal CMS)
- If `canvas_ai` provides section regeneration → configure + prompt tune
- If not → custom Canvas toolbar action + AI prompt + component input replacement
- Site context (industry, tone, audience) from blueprint metadata

**Investigation required before implementation:**
1. Does `canvas_ai` provide section-level regeneration UI?
2. What AI provider does it use? Can we configure OpenAI?
3. Does Canvas support custom toolbar plugins?

## Execution Order

```
Phase 1 — Parallel (Days 1-5):
├── TASK-034: Node access & data isolation
│   └── P0 security prerequisite — must land before editing features go live
│   └── Per-site node access grants, query filtering
│   └── Test: content from site A not visible on site B
└── TASK-023: Page add & remove
    └── Canvas page CRUD from editor UI
    └── Menu link auto-update on page add/remove
    └── Test: add page → appears in nav; delete page → removed from nav

Phase 2 (Days 6-10):
└── TASK-119: Section-level AI regeneration
    └── Day 6: canvas_ai investigation spike (½ day)
    └── Days 6-10: Implementation based on spike findings
    └── Test: regenerate section → content changes, layout preserved
```

## Dependencies & Risks
- **Sprint 05b must be complete:** ✅ End-to-end provisioning working, sites go live automatically
- **TASK-119 depends on TASK-118 (Sprint 05, ✅ Done):** Canvas editor configured with Space DS components
- **TASK-034 is P0 security:** Without data isolation, site owners could see each other's content in multisite
- **Risk:** Canvas section toolbar extensibility — verify Canvas supports custom toolbar actions. `canvas_ai` submodule may already provide this
- **Risk:** `canvas_ai` investigation may change TASK-119 scope significantly (larger or smaller)
- **Note:** `canvas_ai` is pre-installed via Drupal CMS recipe — TASK-119 can leverage existing AI agents

## Deliverable
Site owners can add/remove pages, regenerate page sections with AI guidance, and each site's content is fully isolated from other tenants.

## Definition of Done
- [ ] Node access grants enforce per-site data isolation
- [ ] Content queries scoped to current site only
- [ ] Admin users can see all content (bypass)
- [ ] Site owner can add new pages from Canvas editor
- [ ] New pages get URL alias + menu link automatically
- [ ] Site owner can remove pages (with confirmation, not front page)
- [ ] "Regenerate with AI" available on Canvas sections
- [ ] AI regeneration preserves component type and layout
- [ ] User guidance text influences regeneration output
- [ ] Playwright tests for page management and data isolation
- [ ] Code committed
