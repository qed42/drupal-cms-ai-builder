# Sprint 03: Blueprint Generation & Dashboard

**Milestone:** M3 — Blueprint & Provisioning
**Duration:** 2 weeks (~10 dev days)
**Architecture:** v2 (Split Platform)

## Sprint Goal
When a user clicks "Visualize my site", generate a full site blueprint (pages, content, forms, brand tokens) using AI, show real-time generation progress, and provide a dashboard where users can see their site status.

## Tasks
| ID | Task | Story | Workstream | Status |
|----|------|-------|------------|--------|
| TASK-110 | Space Component Manifest (Static JSON) | US-013 | Next.js | Done |
| TASK-109 | Blueprint Generation (AI Content Pipeline) | US-012–018 | Next.js | Done |
| TASK-122 | Generation Progress UI | US-019 | Next.js | Done |
| TASK-117 | Platform Dashboard | Foundation | Next.js | Done |
| TASK-110a | Enrich Component Manifest Usage Hints for Blueprint Mapping | US-013 | Next.js | Done |

## Dependencies & Risks
- **TASK-110 → TASK-109:** Manifest must exist before blueprint generator can reference valid components. However, TASK-110 is a small task (static JSON) and can be completed first.
- **TASK-109 → TASK-122:** Progress UI polls blueprint generation status — generation API must exist.
- **TASK-117 independent:** Dashboard can be built in parallel with 109/122 (only needs auth + site status from DB).
- **Risk:** Blueprint generation is the heaviest AI task (XL) — needs careful prompt engineering to produce valid component layouts. Fallback templates recommended.
- **Risk:** Space theme component data — we don't have a running Drupal with Space theme yet. TASK-110 will create a representative static manifest based on common SDC component patterns. It will be replaced by a Drush export in Sprint 04.
- **Risk:** Blueprint output format must be parseable by the future Drupal blueprint parser (TASK-114). Define the format spec carefully.

## Architectural Notes
- TASK-110 is being **simplified** from a Drush command to a static JSON file maintained in the Next.js repo. The Drush export will come in Sprint 04 when Drupal is set up.
- TASK-113 (Content Type Configs), TASK-114 (Blueprint Parser), TASK-115 (Brand Token Service) are **deferred to Sprint 04** since they require a running Drupal instance.
- The fonts screen "Visualize my site" button should trigger `/api/provision/generate-blueprint` instead of redirecting to start.

## Deliverable
"Visualize my site" produces a complete blueprint bundle (site metadata, page layouts, generated content, forms, brand tokens). User sees a progress screen during generation. After completion, they land on a dashboard showing their site status.

## Definition of Done
- [ ] Component manifest JSON file with Space SDC component definitions
- [ ] Blueprint generator produces `site.md`, `pages/*.md`, `content/*.md`, `forms/contact.md`, `brand/tokens.json`
- [ ] Blueprint uses valid Space component IDs from manifest
- [ ] Blueprint generation completes in < 60 seconds
- [ ] Progress screen shows animated step-by-step progress during generation
- [ ] Completion screen shows success with "Continue to Dashboard" CTA
- [ ] Dashboard shows site name, status, subscription info
- [ ] Dashboard handles all site statuses (onboarding, provisioning, live)
- [ ] Playwright tests for generation, progress UI, and dashboard
- [ ] Code committed
