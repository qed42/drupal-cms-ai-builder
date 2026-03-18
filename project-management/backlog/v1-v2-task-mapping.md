# v1 → v2 Task Mapping

**Date:** 2026-03-18
**Context:** Architecture pivot from Drupal monolith to Next.js Platform + Drupal Multisite

## Superseded Tasks (v1 — No Longer Applicable)

These v1 tasks were built for the Drupal monolith architecture and are replaced by v2 tasks:

| v1 Task | Status | Replaced By | Reason |
|---------|--------|-------------|--------|
| TASK-001: Core Module Scaffold | Done | — | Module still exists but scope reduced |
| TASK-002: SiteProfile Entity | Done | Platform DB `sites` + `onboarding_sessions` tables | Entity not needed; data lives in Next.js |
| TASK-003: Industry Taxonomy | Done | TASK-104 (AI inference) | Industry inferred from description, not selected from taxonomy |
| TASK-004: Registration Form | Done | TASK-101 (NextAuth) | Auth moved to Next.js |
| TASK-005: Trial Activation | Done | TASK-120 (Stripe) | Trial/subscription in Next.js |
| TASK-006: Wizard Framework | Done | TASK-102 (Next.js wizard) | Onboarding moved to Next.js |
| TASK-007: Wizard Step 1 | Done | TASK-103 (Screen 1) | Reimagined per Figma designs |
| TASK-008: Wizard Step 2 | Done | TASK-104 (AI inference) | No explicit industry selection in v2 |
| TASK-009: Wizard Step 3 | Done | TASK-107 + TASK-108 (Brand + Fonts) | Split into brand assets + fonts screens |
| TASK-010: Wizard Step 4 | Done | TASK-103 (Screens 2-3) | Reimagined as "big idea" + "audience" |
| TASK-011: Industry Analyzer Agent | Done | TASK-104 (Next.js AI) | Industry analysis moved to Next.js |
| TASK-012: Wizard Step 5 | Done | TASK-105 (Page map) | Replaced by AI-suggested page map |
| TASK-013: Save & Resume | Not started | TASK-102 (built into framework) | Persistence built into Next.js wizard |
| TASK-016: Generation Pipeline Queue | Not started | TASK-111 (Provisioning engine) | No Drupal queue; provisioning engine orchestrates |
| TASK-020: Generation Progress UI | Not started | TASK-122 (Next.js progress) | UI moved to Next.js |
| TASK-029: Publish Service | Not started | — | Site is live when provisioned; no separate publish step |
| TASK-030: Trial Expiry | Not started | TASK-120 (Stripe) | Handled in Next.js |
| TASK-031: Subscription Integration | Not started | TASK-120 (Stripe) | Handled in Next.js |
| TASK-034: Node Access & Data Isolation | Done | Multisite DB isolation | No ACL needed |

## Carried Forward (Modified)

| v1 Task | v2 Task | Changes |
|---------|---------|---------|
| TASK-014: Content Types | TASK-113 | Removed field_site_profile; per-industry selective install |
| TASK-015: Component Manifest | TASK-110 | Now exports static JSON for Next.js AI prompts |
| TASK-017: Page Builder Agent | TASK-112 (part of Drush commands) | Runs during provisioning, not in queue |
| TASK-018: Content Generator Agent | TASK-112 + TASK-119 | Runs during provisioning + section regen |
| TASK-019: Brand Token Service | TASK-115 | Reads from tokens.json, not SiteProfile entity |
| TASK-021: Canvas Editor Config | TASK-118 | Simplified (no multi-tenant permissions) |
| TASK-022: Section AI Regen | TASK-119 | Same concept, same implementation |
| TASK-026: Form Generator | TASK-112 (part of blueprint import) | Forms defined in blueprint, not by AI agent |
| TASK-027: Form Submissions | TASK-121 | Same concept, simpler (Webform defaults) |

## New Tasks (v2 Only)

| Task | Description | Layer |
|------|-------------|-------|
| TASK-100 | Next.js App Scaffold | Next.js |
| TASK-101 | Authentication (NextAuth) | Next.js |
| TASK-102 | Onboarding Wizard Framework | Next.js |
| TASK-103 | Wizard Screens 1-3 | Next.js |
| TASK-104 | AI Industry Inference & Page Suggestion | Next.js |
| TASK-105 | Wizard Screen 4 — Page Map | Next.js |
| TASK-106 | Wizard Screen 5 — Design Source | Next.js |
| TASK-107 | Wizard Screen 6 — Brand Assets + Color Extraction | Next.js |
| TASK-108 | Wizard Screen 7 — Font Selection | Next.js |
| TASK-109 | Blueprint Generation (AI Content Pipeline) | Next.js |
| TASK-110 | Space Component Manifest (Static Export) | Drupal → Next.js |
| TASK-111 | Provisioning Engine | Provisioning |
| TASK-112 | Drupal Drush Commands | Drupal |
| TASK-116 | Auto-Login System (JWT) | Next.js + Drupal |
| TASK-117 | Platform Dashboard | Next.js |
| TASK-122 | Provisioning Status UI | Next.js |

## Tasks Still Valid (Unchanged or Future)

| v1 Task | Status | Notes |
|---------|--------|-------|
| TASK-023: Page Add & Remove | Not started | Still valid — Canvas feature on Drupal site |
| TASK-024: Component Swap | Not started | P2, future |
| TASK-025: Media Management | Not started | P2, future |
| TASK-028: Draft Mode & Preview | Not started | May not be needed (site is live when provisioned) |
| TASK-032: SSL Provisioning | Not started | Infrastructure task, still valid |
| TASK-033: Custom Domain | Not started | P2, future |
