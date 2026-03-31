# TASK-516: Build preview HTML (srcdoc constructor)

**Story:** US-111, US-113, US-117
**Priority:** P0
**Estimate:** L
**Status:** To Do

## Description

Create the function that constructs the full HTML document used as the iframe's `srcdoc`. This is the core rendering pipeline that assembles brand tokens, Tailwind CDN, Google Fonts, React UMD, Sucrase, section renderers, and security policies into a single HTML string.

### Deliverables

1. **`platform-app/src/lib/preview/build-preview-html.ts`** — Function:
   - `buildPreviewHtml(payload: PreviewPayload): string`
   - Constructs `<head>`:
     - CSP `<meta>` tag (from security spec)
     - Tailwind CDN `<script>` tag
     - Google Fonts `<link>` tags
     - Brand tokens `<style>` block (from TASK-514)
     - Base styles for section hover outlines, error placeholders
   - Constructs `<body>`:
     - React + ReactDOM UMD script tags (from CDN, pinned versions)
     - Serialized `PreviewPayload` as `window.__PREVIEW_DATA__`
     - Preview renderer script that:
       - Parses `__PREVIEW_DATA__`
       - For `code_components`: transpiles JSX via Sucrase, creates components via Function constructor
       - For `design_system`: uses SDC approximate renderers
       - Wraps each section in `<div data-section-index="N">` with click/hover handlers
       - Error boundaries per section
       - Mounts React tree into `#root`
       - Posts `{ type: "ready" }` message to parent on mount complete
   - Section click handlers post `{ type: "section-click", sectionIndex }` to parent
   - Section hover handlers add/remove outline class

2. **Unit tests** (`platform-app/src/lib/preview/__tests__/build-preview-html.test.ts`):
   - Output contains CSP meta tag
   - Output contains brand token CSS variables
   - Output contains Tailwind CDN script
   - Output contains serialized preview data
   - Output contains React UMD scripts
   - code_components mode includes Sucrase script
   - design_system mode includes SDC renderer code

## Dependencies

- TASK-514 (types, brand-tokens-css)
- TASK-515 (transpile module — for Sucrase CDN URL reference)
- TASK-519 (security policies — CSP meta tag content)

## Acceptance Criteria

- [ ] Generated HTML is a valid complete document (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`)
- [ ] CSP meta tag matches security spec from architecture
- [ ] Brand tokens injected as CSS custom properties at `:root`
- [ ] Tailwind CDN loaded for class processing
- [ ] Google Fonts loaded via `<link>` tags
- [ ] React + ReactDOM UMD loaded from CDN
- [ ] Preview data serialized safely (JSON.stringify with HTML entity escaping)
- [ ] Section wrappers include data-section-index and click/hover handlers
- [ ] Error boundaries prevent single section failure from crashing page
- [ ] "ready" postMessage sent after mount
- [ ] Unit tests pass
