# Sprint 58 Output: Live Preview Foundation

**Date:** 2026-03-31
**Status:** Complete — all 7 tasks done
**Test Suite:** 300 tests across 18 test files (96 new)
**TypeScript:** 0 errors

## Test Results

| Task | Description | Tests | Passed | Failed |
|------|-------------|-------|--------|--------|
| TASK-514 | Preview types + brand tokens CSS | 13 new | 13 | 0 |
| TASK-515 | Sucrase JSX transpilation | 7 new | 7 | 0 |
| TASK-519 | JSX sanitization + security utilities | 32 new | 32 | 0 |
| TASK-518 | SDC approximate renderer registry | 12 new | 12 | 0 |
| TASK-516 | Build preview HTML (srcdoc) | 18 new | 18 | 0 |
| TASK-520 | Security integration tests | 14 new | 14 | 0 |
| TASK-517 | LivePreviewFrame + review page | 0 (component) | — | — |
| — | All regression tests | 204 | 204 | 0 |

## New Files

| File | Purpose | Lines |
|------|---------|-------|
| `platform-app/src/lib/preview/types.ts` | PreviewPayload, PostMessage, Viewport types | ~100 |
| `platform-app/src/lib/preview/brand-tokens-css.ts` | BrandTokens → CSS custom properties converter | ~70 |
| `platform-app/src/lib/preview/transpile.ts` | Sucrase JSX transpilation with caching | ~55 |
| `platform-app/src/lib/preview/sanitize.ts` | JSX sanitization, CSP, postMessage validation | ~95 |
| `platform-app/src/lib/preview/sdc-renderers.ts` | 16 SDC approximate renderers + registry | ~300 |
| `platform-app/src/lib/preview/build-preview-html.ts` | srcdoc HTML constructor | ~160 |
| `platform-app/src/app/onboarding/review/components/LivePreviewFrame.tsx` | Sandboxed iframe wrapper component | ~85 |
| `platform-app/src/lib/preview/__tests__/brand-tokens-css.test.ts` | 13 tests | ~90 |
| `platform-app/src/lib/preview/__tests__/transpile.test.ts` | 7 tests | ~75 |
| `platform-app/src/lib/preview/__tests__/sanitize.test.ts` | 32 tests | ~130 |
| `platform-app/src/lib/preview/__tests__/sdc-renderers.test.ts` | 12 tests | ~55 |
| `platform-app/src/lib/preview/__tests__/build-preview-html.test.ts` | 18 tests | ~100 |
| `platform-app/src/lib/preview/__tests__/security.test.ts` | 14 tests | ~100 |

## Modified Files

| File | Change |
|------|--------|
| `platform-app/src/app/onboarding/review/page.tsx` | Added LivePreviewFrame import, Visual/Data toggle, PreviewPayload construction, brand/generationMode extraction |
| `platform-app/package.json` | Added `sucrase` dependency |

## Architecture Highlights

### Security Model (3-layer defense-in-depth)
1. **Pre-rendering sanitization** — 21 dangerous patterns stripped from JSX before embedding
2. **iframe sandbox** — `allow-scripts` only (no same-origin, forms, popups, top-navigation)
3. **CSP meta tag** — `connect-src: 'none'` blocks all network; `default-src: 'none'`

### Rendering Pipeline
- **code_components mode**: JSX → Sucrase transpile → scoped execution → React render
- **design_system mode**: component_id → SDC renderer lookup → React render
- Both modes: brand tokens as CSS custom properties, Tailwind CDN, Google Fonts

### SDC Renderer Registry (16 components)
hero, section-heading, card, button, container, flexi, accordion, slider, contact-card, logo, tabs, list, text-block, image, footer, header

### Review Page Integration
- Visual Preview / Data View toggle in preview mode header
- Visual Preview is default when code_components are present
- Loading skeleton until iframe posts "ready" message
- Section click events bridge iframe → parent via postMessage

## Bugs Filed

None.

## Pipeline Flow (unchanged from Sprint 57)

```
Research → Plan → Generate → Hydrate → Enhance → Provision
```

## Next Steps

Sprint 59 should cover the remaining M28 stories:
- US-114: Responsive Preview Toolbar (viewport switcher)
- US-115: Section Click-to-Edit (EditPanel)
- US-116: Live Regeneration with Visual Diff
