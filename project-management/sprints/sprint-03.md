# Sprint 03: Blueprint Generation & Drupal Foundation

**Milestone:** M3 — Blueprint & Provisioning
**Duration:** 2 weeks (~10 dev days)
**Architecture:** v2 (Split Platform)

## Sprint Goal
Build the AI blueprint generation pipeline and prepare Drupal for provisioning — content type configs, component manifest export, blueprint parser, and brand token service.

## Tasks
| ID | Task | Story | Workstream | Status |
|----|------|-------|------------|--------|
| TASK-110 | Space Component Manifest (Static Export) | US-013 | Drupal | Not Started |
| TASK-109 | Blueprint Generation (AI Content Pipeline) | US-012–018 | Next.js | Not Started |
| TASK-113 | Content Type Configs (v2) | US-012 | Drupal | Not Started |
| TASK-114 | Blueprint Parser Service | US-013 | Drupal | Not Started |
| TASK-115 | Brand Token Service (v2) | US-016 | Drupal | Not Started |

## Dependencies & Risks
- **TASK-110 before TASK-109:** Manifest must exist before blueprint generator can reference valid components
- **TASK-113 before TASK-114:** Parser creates entities of configured types
- **TASK-115 independent:** Can be built in parallel
- **Parallel workstreams:** Next.js (109) and Drupal (110, 113, 114, 115) can progress simultaneously
- **Risk:** Blueprint generation is the heaviest AI task (XL) — needs careful prompt engineering to produce valid component layouts
- **Risk:** Canvas PHP API — need to validate how to programmatically create layouts via code (not UI)

## Deliverable
"Visualize my site" produces a complete blueprint (markdown files + assets). Drupal is ready to receive and parse blueprints with content types, brand tokens, and the parser service all functional.

## Definition of Done
- [ ] Component manifest exported as JSON from Space theme
- [ ] Blueprint generator produces valid site.md, pages/*.md, content/*.md, forms/*.md, brand/tokens.json
- [ ] Blueprint content uses only valid Space SDC component IDs
- [ ] Content type configs install cleanly per industry
- [ ] Blueprint parser correctly reads all markdown formats
- [ ] Brand token service generates valid CSS from tokens.json
- [ ] Integration tests: generate blueprint → parse → validate structure
- [ ] Code committed
