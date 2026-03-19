# Sprint 04 QA Report

**Date:** 2026-03-18
**Status:** Pass (with minor open issues) — 6/10 bugs fixed, 4 Minor open (deferred)

## Retest Summary (Round 2)

All 5 Major bugs fixed and verified. BUG-006 (Minor) also fixed as part of ConfigureSiteCommands rewrite. PHP lint passes on all files. TypeScript compiles clean.

### Retest Results

| Bug | Status | Verification |
|-----|--------|-------------|
| BUG-001 | **Fixed** | `importPages()` now uses `$frontPagePath` (slug-based) at line 189 |
| BUG-002 | **Fixed** | `?PluginManagerInterface` injected via constructor; `@?plugin.manager.webform.handler` in services.yml |
| BUG-003 | **Fixed** | `ModuleHandlerInterface` added to ImportConfigCommands constructor; `$this->moduleHandler` used |
| BUG-004 | **Fixed** | `runPathautoUpdate()` uses persistent `$context` with do/while loop until `$context['finished'] >= 1` |
| BUG-005 | **Fixed** | `AliasTypeManager` injected via `#[Autowire(service:)]` constructor param |
| BUG-006 | **Fixed** | Unused `CacheTagsInvalidatorInterface` removed from constructor |

### Remaining Minor Bugs (deferred)

| Bug | Task | Description |
|-----|------|-------------|
| BUG-007 | TASK-115 | Dead ternary in BrandTokenService (cosmetic) |
| BUG-008 | TASK-115 | Double file read in applyTokens() (perf, not functional) |
| BUG-009 | TASK-111 | Settings.php template quote escaping (edge case) |
| BUG-010 | TASK-111 | Unnecessary dynamic import (style) |

## Test Results by Task

| Task | Criteria Checked | Passed | Failed | Notes |
|------|-----------------|--------|--------|-------|
| TASK-123 | 5 | 5 | 0 | Spike output documented, DDEV running, Space DS confirmed |
| TASK-109b | 3 | 3 | 0 | Component tree builder compiles, maps IDs, generates UUIDs |
| TASK-113 | 2 | 2 | 0 | 101 config YAMLs present, submodule .info.yml correct |
| TASK-115 | 4 | 4 | 0 | Core functionality correct; 2 minor deferred |
| TASK-114 | 8 | 8 | 0 | All bugs fixed — front page, DI, component trees |
| TASK-112 | 11 | 11 | 0 | All bugs fixed — DI, pathauto batch, idempotency |
| TASK-111 | 13 | 13 | 0 | Core flow correct; 2 minor deferred |

## Acceptance Criteria Checklist

### Definition of Done
- [x] Drupal CMS 2.0 running on DDEV with Canvas + Space DS theme
- [x] Spike findings documented (CLI install, Canvas tree format, Space DS compat, multisite)
- [x] Content type configs install cleanly per industry
- [x] Blueprint import service saves pre-built component trees to canvas_page entities
- [x] Brand token service generates CSS custom properties for Space DS
- [x] All 4 Drush commands functional and idempotent
- [x] Provisioning engine: creates DB → installs Drupal CMS → Space DS → runs Drush → callbacks
- [x] Provisioning engine rollback works on failure
- [ ] Playwright tests for provisioning status API — **deferred to Sprint 05**
- [ ] Code committed — **ready to commit**

## Notes

1. **Sprint 04 is functionally complete.** All 7 tasks delivered, all Major bugs resolved.
2. **4 Minor bugs deferred** — cosmetic/performance issues that don't affect functionality.
3. **E2E Playwright tests deferred to Sprint 05** — requires integration test harness with DDEV context.
4. **Config schema file recommended** — `config/schema/ai_site_builder.schema.yml` should be created in a future sprint to avoid config validation warnings.
5. Sprint is ready for commit and handoff to `/tpm sprint` for Sprint 05 planning.
