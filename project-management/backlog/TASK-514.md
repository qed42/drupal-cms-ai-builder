# TASK-514: Preview types and brand tokens CSS utility

**Story:** US-113, US-111
**Priority:** P0
**Estimate:** S
**Status:** To Do

## Description

Create the foundational types and the brand-tokens-to-CSS converter for the live preview system.

### Deliverables

1. **`platform-app/src/lib/preview/types.ts`** — Define:
   - `PreviewPayload` interface (page, brand, header, footer, codeComponentSources, generationMode, designTokens)
   - `PostMessageType` union type: `section-click | section-hover | ready | error | update-props | replace-section | update-section`
   - `PreviewMessage` discriminated union for all postMessage payloads
   - `ViewportSize` type: `desktop | tablet | mobile`
   - `ViewportConfig` with width/label mappings

2. **`platform-app/src/lib/preview/brand-tokens-css.ts`** — Functions:
   - `brandTokensToCss(brand: BrandTokens): string` — converts brand colors, fonts to CSS custom properties block
   - `googleFontsLink(fonts: string[]): string` — generates Google Fonts `<link>` URL
   - Design rules tokens (container, typography, card, button, spacing) also emitted as CSS custom properties

3. **Unit tests** for brand token CSS generation (various font/color combinations, edge cases like missing optional tokens).

## Dependencies

- None (foundational)

## Acceptance Criteria

- [ ] PreviewPayload type covers both code_components and design_system modes
- [ ] PostMessage types are strict discriminated unions (not loose strings)
- [ ] brandTokensToCss produces valid CSS custom properties
- [ ] Google Fonts URL generation handles multiple fonts and deduplication
- [ ] Design rules tokens (from M27) included in CSS output
- [ ] Unit tests pass
