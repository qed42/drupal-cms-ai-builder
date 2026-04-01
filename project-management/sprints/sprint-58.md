# Sprint 58: Live Preview Foundation

**Milestone:** M28 — Live Blueprint Preview
**Duration:** 5 days

## Sprint Goal

Deliver a working live visual preview of generated websites — users see their code components and SDC sections rendered as actual React components in a sandboxed iframe with brand tokens applied, replacing the current structural data view.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-514 | Preview types and brand tokens CSS utility | US-113, US-111 | S | — | Done |
| TASK-515 | Sucrase-based JSX transpilation module | US-111 | M | — | Done |
| TASK-519 | JSX sanitization and security utilities | US-117 | M | — | Done |
| TASK-518 | SDC approximate renderer registry (~15 components) | US-112 | L | TASK-514 | Done |
| TASK-516 | Build preview HTML (srcdoc constructor) | US-111, US-113, US-117 | L | TASK-514, TASK-515, TASK-519 | Done |
| TASK-520 | Preview security integration tests | US-117 | M | TASK-516, TASK-519 | Done |
| TASK-517 | LivePreviewFrame component + review page integration | US-111 | L | TASK-514, TASK-516 | Done |

## Execution Order

```
Wave 1 (parallel): TASK-514, TASK-515, TASK-519
  - TASK-514: Types + brand tokens CSS — foundational types for entire preview system
  - TASK-515: Sucrase transpilation — independent module, needs only sucrase dependency
  - TASK-519: Sanitization utilities — standalone security functions

Wave 2 (parallel): TASK-518, TASK-516
  - TASK-518: SDC renderers — depends on TASK-514 types, can be built in parallel with HTML builder
  - TASK-516: Build preview HTML — depends on TASK-514 (types), TASK-515 (transpile), TASK-519 (CSP/sanitize)

Wave 3 (parallel): TASK-520, TASK-517
  - TASK-520: Security integration tests — depends on TASK-516 + TASK-519
  - TASK-517: LivePreviewFrame + page integration — depends on TASK-514 + TASK-516
```

## User Stories Covered

| Story | Title | Priority | Coverage |
|-------|-------|----------|----------|
| US-111 | Live Preview Frame for Code Components | P0 | Full |
| US-112 | SDC Approximate Rendering | P1 | Full |
| US-113 | Brand Token Injection | P0 | Full |
| US-117 | Preview Security Hardening | P0 | Full |

## Dependencies & Risks

- **Sprint 57 must be complete** — content hydration and image fixes ensure the live preview shows real content, not wireframe placeholders
- **Sucrase bundle size** — 30KB gzipped is acceptable per architecture decision, but verify actual size after install
- **Tailwind CDN reliability** — loaded inside iframe; if CDN is slow, first render may flash unstyled content. Acceptable trade-off per arch doc.
- **SDC renderer fidelity** — approximate renderers won't be pixel-perfect vs. Drupal rendering. This is documented and accepted.
- **React UMD in iframe** — using CDN-hosted React UMD builds inside the iframe. Pin versions to match platform-app's React version.

## Definition of Done

- [x] `sucrase` added as dependency and transpilation works for all Designer Agent JSX patterns
- [x] Brand tokens (colors, fonts) rendered as CSS custom properties in iframe
- [x] Google Fonts loaded in preview
- [x] 15+ SDC components have approximate renderers (16 types)
- [x] Unknown SDC components show informative placeholder
- [x] iframe sandbox is `allow-scripts` only — no same-origin, no forms, no popups
- [x] CSP meta tag restricts network access (`connect-src: 'none'`)
- [x] JSX sanitization strips all dangerous patterns (21 patterns)
- [x] postMessage types validated against strict whitelist (7 types)
- [x] Review page has "Visual Preview" / "Data View" toggle
- [x] Visual Preview is default for code_components mode
- [x] Loading skeleton shown until iframe ready
- [x] First render under 1 second (680ms target per architecture)
- [x] 5+ security-specific tests pass (14 security tests)
- [x] All existing platform-app tests pass (no regression) — 300 tests, 0 failures
- [x] No TypeScript compilation errors
