# Architecture: M28 — Live Blueprint Preview

**Date:** 2026-03-31
**Status:** Draft
**Milestone:** M28 — Live Blueprint Preview
**Stories:** US-111 through US-117
**Dependencies:** M26 (Code Component Generation), M27 (Design Rules Engine)

---

## 1. Problem Statement

Today the review page (`/onboarding/review`) shows a **structural** view of the generated site: collapsible component trees with prop key-value pairs for SDC mode, and syntax-highlighted JSX source for code_components mode. Users can read the data but they cannot see what their website will actually look like.

This creates three problems:

1. **Low confidence at approval time.** Users approve a blueprint they can only imagine visually, leading to disappointment after provisioning when the rendered Drupal site differs from expectations.
2. **Regeneration is blind.** When a user clicks "Regenerate Section", they cannot compare the old vs. new result visually — only by scanning prop diffs or re-reading JSX.
3. **Brand token disconnect.** Colors, fonts, and spacing defined during onboarding are never rendered until the Drupal site is live, so brand mismatches surface late.

**Goal:** Replace the structural preview with a live, interactive visual rendering of the component tree — showing the actual website as React components with brand tokens applied — before any Drupal provisioning happens.

---

## 2. Proposed Approach

### 2.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Review Page (Next.js)                                   │
│                                                          │
│  ┌─────────────┐  ┌──────────────────────────────────┐   │
│  │ Page Sidebar │  │  Preview Frame (iframe sandbox)  │   │
│  │             │  │                                    │  │
│  │ Home        │  │  ┌──────────────────────────────┐ │  │
│  │ About       │  │  │  PreviewRenderer (React)     │ │  │
│  │ Services    │  │  │                              │ │  │
│  │ Contact     │  │  │  <style>                     │ │  │
│  │             │  │  │    :root { brand tokens }    │ │  │
│  │             │  │  │  </style>                    │ │  │
│  │             │  │  │                              │ │  │
│  │             │  │  │  <Header />                  │ │  │
│  │             │  │  │  <Section1 />  ← click       │ │  │
│  │             │  │  │  <Section2 />    to edit     │ │  │
│  │             │  │  │  <Section3 />                │ │  │
│  │             │  │  │  <Footer />                  │ │  │
│  │             │  │  │                              │ │  │
│  │             │  │  └──────────────────────────────┘ │  │
│  │             │  │                                    │  │
│  │             │  │  postMessage ↕ parent              │  │
│  └─────────────┘  └──────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Edit Panel (slide-over)                             │ │
│  │  Props editor + Regenerate button + Code view        │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Two Rendering Modes

| Mode | Input | Rendering Strategy |
|------|-------|--------------------|
| `code_components` | JSX source from `_codeComponents.configs` | **SWC/Sucrase transpilation** of JSX to JS, eval inside sandboxed iframe via Function constructor |
| `design_system` | PageSection props + component_id | **Approximate HTML templates** mapped from SDC component IDs to lightweight React components |

### 2.3 Component Diagram

```
BlueprintBundle
  │
  ├── brand: BrandTokens ──→ CSS Custom Properties Stylesheet
  │                            --color-primary, --color-accent, etc.
  │                            --font-heading, --font-body
  │
  ├── pages[]: PageLayout[]
  │     │
  │     └── sections[]: PageSection[]
  │           │
  │           ├── [code_components] component_id: "js.*"
  │           │     └── _codeComponents.configs[machineName] → JSX string
  │           │           │
  │           │           ├── Transpile JSX → JS (Sucrase, client-side)
  │           │           ├── Create React component via Function constructor
  │           │           └── Render with props from section.props
  │           │
  │           └── [design_system] component_id: "sdc.*"
  │                 └── section.props + section.children
  │                       │
  │                       ├── Map component_id → ApproximateRenderer
  │                       └── Render HTML approximation with props
  │
  ├── header: HeaderConfig ──→ Header Component
  └── footer: FooterConfig ──→ Footer Component
```

---

## 3. Key Technical Decisions

### 3.1 Sandboxed iframe vs. Shadow DOM vs. SSR

| Approach | Security | Style Isolation | Performance | Complexity |
|----------|----------|-----------------|-------------|------------|
| **Sandboxed iframe** | Strong (origin isolation) | Complete (separate document) | Good (dedicated rendering context) | Medium |
| Shadow DOM | Weak (same JS context) | Partial (styles leak via inheritance) | Good | Low |
| Server-side render | Strong (no client eval) | Complete | Slow (round-trip per change) | High |

**Decision: Sandboxed iframe with `srcdoc`.**

Rationale:
- AI-generated JSX must run in an isolated context. An iframe with `sandbox="allow-scripts"` (no `allow-same-origin`) prevents the generated code from accessing the parent page's DOM, cookies, localStorage, or network.
- Style isolation is complete — Tailwind classes inside the iframe do not conflict with the platform app's styles.
- The `srcdoc` attribute lets us construct the full HTML document in memory without a separate server route, avoiding CORS and additional API endpoints.
- `postMessage` provides a structured communication channel between the preview and the parent for edit interactions.

Trade-off: iframes are heavier than inline rendering. For sites with 6-8 pages, we only render the active page's iframe, unmounting on page switch.

### 3.2 JSX Transpilation Strategy

AI-generated code components contain JSX syntax that browsers cannot execute directly. We need to transpile JSX to plain JavaScript before rendering.

| Option | Bundle Size | Speed | JSX Support | Risk |
|--------|-------------|-------|-------------|------|
| **Sucrase** (client-side) | ~30KB gzipped | ~5ms per file | Full JSX/TSX | Minimal — mature, focused transpiler |
| SWC (WASM) | ~2MB gzipped | ~1ms per file | Full JSX/TSX | Large initial download |
| Babel standalone | ~800KB gzipped | ~20ms per file | Full JSX/TSX | Slow, heavy |
| Custom regex-based | ~2KB | <1ms | Partial | Fragile, misses edge cases |

**Decision: Sucrase for client-side transpilation.**

Rationale:
- 30KB is acceptable for the review page (loaded once, cached).
- 5ms transpilation time is imperceptible per section.
- Sucrase supports all JSX patterns our Designer Agent produces.
- No WASM loading latency (unlike SWC-WASM).

The transpiled JS is then executed inside the iframe using a `Function` constructor pattern (not `eval`) with an explicit scope object containing React, available utilities (`cn`, `clsx`), and component props.

### 3.3 Brand Token Injection

Brand tokens from `BrandTokens` are injected as CSS custom properties at the `:root` level inside the iframe's `<style>` block:

```css
:root {
  --color-primary: #2563eb;
  --color-secondary: #1e40af;
  --color-accent: #f59e0b;
  --color-surface: #f8fafc;
  --color-text: #1e293b;
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

These CSS variables are already referenced in the Design Rules Engine tokens (`global.yaml`), so code components generated with design rules will automatically pick up the brand colors without any code changes.

For the `design_system` mode approximation, the same CSS variables power the template renderers.

### 3.4 Tailwind CSS in the Preview

Code components use Tailwind CSS v4 classes. Inside the iframe we need Tailwind to work.

| Option | Pros | Cons |
|--------|------|------|
| **Tailwind Play CDN** (`@tailwindcss/cdn`) | Zero build step, instant | 100KB+ download, runtime perf |
| Pre-built Tailwind CSS bundle | Fast rendering, small | Misses dynamic classes |
| Twind (Tailwind-in-JS) | On-demand class generation | Different engine, subtle differences |

**Decision: Tailwind Play CDN script tag inside iframe.**

Rationale:
- Code components use arbitrary Tailwind classes that cannot be statically analyzed at build time.
- The CDN script processes classes on the fly — matching how Canvas compiles components in production.
- The 100KB download is acceptable since the preview iframe loads once per review session.
- The iframe is sandboxed so the CDN script runs in isolation.

### 3.5 SDC Approximate Rendering

For `design_system` mode, we cannot render actual Drupal SDC components in React. Instead, we create approximate HTML renderers that map SDC component types to styled HTML:

```typescript
// Registry of approximate renderers
const SDC_RENDERERS: Record<string, React.FC<{ props: Record<string, unknown> }>> = {
  "hero": HeroApproximate,
  "section-heading": SectionHeadingApproximate,
  "card": CardApproximate,
  "button": ButtonApproximate,
  "container": ContainerApproximate,
  "flexi": FlexiApproximate,
  "accordion": AccordionApproximate,
  "slider": SliderApproximate,
  // ... ~15-20 component approximations
};
```

Each approximate renderer reads the same props the SDC component would receive, and produces a visually similar (though not pixel-perfect) HTML output styled with Tailwind classes. This gives users a "good enough" visual preview without requiring Drupal rendering.

Trade-off: SDC approximate renderers will drift from actual Drupal rendering over time as the design system evolves. This is acceptable because code_components mode is the primary path going forward, and SDC mode already has Drupal provisioning for exact rendering.

### 3.6 Section Interaction Model

Users can interact with the preview to edit sections:

```
User clicks section in iframe
  → iframe posts message: { type: "section-click", sectionIndex: 2 }
  → Parent opens Edit Panel with section's props
  → User modifies props or clicks "Regenerate"
  → Parent sends updated props: { type: "update-section", sectionIndex: 2, props: {...} }
  → iframe re-renders the section with new props
  → If regenerated: parent sends new JSX → iframe re-transpiles and renders
```

Each section in the iframe is wrapped in a `<div data-section-index="N">` with a click handler and a hover outline effect. This provides visual feedback for the interactive editing model.

---

## 4. Data Flow

### 4.1 Blueprint to Preview (Initial Load)

```
1. ReviewPage loads BlueprintBundle from API
   └── GET /api/blueprint/{siteId}
       └── Returns: { pages, brand, header, footer, _codeComponents }

2. ReviewPage selects active page (pages[activePageIndex])

3. ReviewPage constructs PreviewPayload:
   {
     page: PageLayout,
     brand: BrandTokens,
     header: HeaderConfig,
     footer: FooterConfig,
     codeComponentSources: Record<string, { jsx: string, css: string }>,
     generationMode: "design_system" | "code_components",
     designTokens: global.yaml tokens
   }

4. LivePreviewFrame receives PreviewPayload via props

5. LivePreviewFrame builds srcdoc HTML:
   a. <head>: Tailwind CDN, Google Fonts, brand token <style>
   b. <body>: React root mount point
   c. <script>: Sucrase transpiler, React UMD, preview renderer
   d. <script>: Serialized PreviewPayload as window.__PREVIEW_DATA__

6. iframe renders:
   a. Parse window.__PREVIEW_DATA__
   b. For each section:
      - code_components: Sucrase.transform(jsx) → Function() → React.createElement()
      - design_system: lookup SDC_RENDERERS[componentType] → render
   c. Mount React tree into #root
   d. Set up section click handlers → postMessage to parent
```

### 4.2 Section Edit Flow

```
1. User clicks section in iframe
2. iframe → postMessage({ type: "section-click", sectionIndex })
3. Parent opens EditPanel for sections[sectionIndex]
4. User edits a prop value (e.g., heading text)
5. Parent → postMessage({ type: "update-props", sectionIndex, props })
6. iframe updates component props → React re-renders that section
```

### 4.3 Section Regeneration Flow

```
1. User clicks "Regenerate" in EditPanel
2. Parent calls POST /api/blueprint/{siteId}/regenerate-section
   Body: { pageIndex, sectionIndex, guidance? }
3. API returns { section, previousSection } (existing endpoint)
4. For code_components: API also returns updated _codeComponents.configs
5. Parent updates local blueprint state
6. Parent → postMessage({
     type: "replace-section",
     sectionIndex,
     section: newSection,
     jsx?: newJsx,
     css?: newCss
   })
7. iframe transpiles new JSX, replaces the section component, re-renders
```

### 4.4 Page Navigation Flow

```
1. User clicks different page in sidebar
2. Parent updates activePageIndex
3. LivePreviewFrame receives new page prop
4. iframe srcdoc is rebuilt with new page's sections
   (Full iframe reload — simpler than incremental update)
```

---

## 5. Security Model

### 5.1 Threat Analysis

| Threat | Vector | Mitigation |
|--------|--------|------------|
| XSS from AI-generated JSX | `<script>`, event handlers, `javascript:` URLs | Iframe sandbox (no `allow-same-origin`), CSP inside iframe |
| Data exfiltration | `fetch()`, `XMLHttpRequest`, `WebSocket` | Iframe sandbox blocks network by default (no `allow-same-origin`) |
| DOM manipulation of parent | `window.parent.document` | Iframe sandbox origin isolation |
| Cookie/localStorage theft | `document.cookie`, `localStorage` | Iframe sandbox (no `allow-same-origin`) |
| Prototype pollution | `Object.prototype` manipulation | Isolated iframe context |
| Infinite loops / resource exhaustion | `while(true)`, recursive rendering | Iframe does not affect parent tab; can be killed by replacing srcdoc |

### 5.2 Iframe Sandbox Configuration

```html
<iframe
  sandbox="allow-scripts"
  referrerpolicy="no-referrer"
  srcdoc="..."
  title="Website Preview"
/>
```

Key sandbox restrictions:
- **`allow-scripts`**: Required for React rendering and Sucrase transpilation.
- **NO `allow-same-origin`**: Prevents access to parent page's origin, cookies, storage, and DOM.
- **NO `allow-forms`**: Prevents form submissions.
- **NO `allow-popups`**: Prevents window.open().
- **NO `allow-top-navigation`**: Prevents redirecting the parent frame.

### 5.3 Content Security Policy (Inside iframe)

The srcdoc HTML includes a CSP meta tag:

```html
<meta http-equiv="Content-Security-Policy"
  content="
    default-src 'none';
    script-src 'unsafe-inline' https://cdn.tailwindcss.com;
    style-src 'unsafe-inline' https://fonts.googleapis.com;
    font-src https://fonts.gstatic.com;
    img-src * data: blob:;
    connect-src 'none';
  "
/>
```

This allows:
- Inline scripts (required for our transpiled JSX)
- Tailwind CDN script
- Google Fonts CSS and font files
- Images from any source (stock photos, placeholders)
- **No network connections** (`connect-src: 'none'`) — blocks fetch/XHR/WebSocket

### 5.4 Pre-rendering Sanitization

Before injecting JSX into the iframe, we apply a lightweight sanitization pass:

```typescript
function sanitizeJsx(jsx: string): string {
  // Strip dangerous patterns that the validator should have caught
  // but defense-in-depth applies
  return jsx
    .replace(/\beval\s*\(/g, '/* blocked */(')
    .replace(/\bFunction\s*\(/g, '/* blocked */(')
    .replace(/\bfetch\s*\(/g, '/* blocked */(')
    .replace(/\bXMLHttpRequest/g, '/* blocked */')
    .replace(/\bimport\s*\(/g, '/* blocked */(')
    .replace(/\bdocument\.cookie/g, '/* blocked */')
    .replace(/\blocalStorage/g, '/* blocked */')
    .replace(/\bsessionStorage/g, '/* blocked */')
    .replace(/\bwindow\.parent/g, '/* blocked */')
    .replace(/\bwindow\.top/g, '/* blocked */');
}
```

This is defense-in-depth. The Code Component Validator (M26) already blocks these patterns during generation, but sanitization at render-time catches anything that slips through.

---

## 6. Performance Considerations

### 6.1 Rendering Pipeline

| Step | Time Budget | Strategy |
|------|-------------|----------|
| Sucrase load | ~50ms (cached) | Loaded once, cached by browser |
| Transpile all sections | ~30ms (5ms x 6 sections) | Sequential, fast enough |
| React mount | ~100ms | Single mount with all sections |
| Tailwind CDN process | ~200ms | Runs after mount, styles snap in |
| Google Fonts load | ~300ms | Non-blocking, FOUT acceptable |
| **Total initial render** | **~680ms** | Under 1s target |

### 6.2 Optimization Strategies

1. **Single iframe per page.** Only the active page is rendered; switching pages replaces the iframe content.
2. **Transpilation caching.** Transpiled JS is cached in a `Map<string, string>` keyed by JSX hash. If a section's JSX hasn't changed (e.g., on page re-visit), the cached transpiled version is reused.
3. **Lazy section rendering.** Sections below the fold are rendered with `IntersectionObserver` — they mount when scrolled into view.
4. **Debounced prop updates.** When editing props, iframe updates are debounced at 150ms to avoid jank during rapid typing.

### 6.3 Large Site Handling

For sites with 8 pages x 8 sections = 64 code components:
- Only the active page's 8 sections are in the iframe at any time.
- Page switching takes ~500ms (iframe rebuild).
- Total memory footprint is bounded by single-page rendering.

---

## 7. New Components and Files

### 7.1 New Files

| File | Purpose |
|------|---------|
| `platform-app/src/app/onboarding/review/components/LivePreviewFrame.tsx` | Sandboxed iframe wrapper, builds srcdoc, handles postMessage |
| `platform-app/src/app/onboarding/review/components/EditPanel.tsx` | Slide-over panel for section prop editing |
| `platform-app/src/app/onboarding/review/components/PreviewToolbar.tsx` | Viewport switcher (desktop/tablet/mobile), zoom controls |
| `platform-app/src/lib/preview/build-preview-html.ts` | Constructs the full srcdoc HTML document |
| `platform-app/src/lib/preview/transpile.ts` | Sucrase-based JSX transpilation with caching |
| `platform-app/src/lib/preview/sdc-renderers.ts` | Approximate HTML renderers for SDC components |
| `platform-app/src/lib/preview/brand-tokens-css.ts` | BrandTokens → CSS custom properties converter |
| `platform-app/src/lib/preview/types.ts` | PreviewPayload, PostMessage types |
| `platform-app/src/lib/preview/__tests__/transpile.test.ts` | Transpilation unit tests |
| `platform-app/src/lib/preview/__tests__/sdc-renderers.test.ts` | SDC renderer unit tests |
| `platform-app/src/lib/preview/__tests__/build-preview-html.test.ts` | srcdoc construction tests |

### 7.2 Modified Files

| File | Change |
|------|--------|
| `platform-app/src/app/onboarding/review/page.tsx` | Replace PagePreview with LivePreviewFrame in preview mode; add EditPanel |
| `platform-app/src/app/onboarding/review/components/PagePreview.tsx` | Retained for edit mode's structural view; add "Visual Preview" toggle |
| `platform-app/src/app/api/blueprint/[siteId]/regenerate-section/route.ts` | Return updated JSX/CSS in response for live preview refresh |
| `platform-app/package.json` | Add `sucrase` dependency |

---

## 8. User Stories

### US-111: Live Preview Frame for Code Components
Render code component JSX as live React components inside a sandboxed iframe with brand tokens applied.

### US-112: SDC Approximate Rendering
Create approximate HTML renderers for the top ~15 SDC components so design_system mode sites also get a visual preview.

### US-113: Brand Token Injection
Convert BrandTokens to CSS custom properties and inject into the preview, including Google Fonts loading.

### US-114: Responsive Preview Toolbar
Add viewport switcher (desktop/tablet/mobile widths) and zoom controls to the preview frame.

### US-115: Section Click-to-Edit
Enable clicking sections in the preview to open an edit panel, with bi-directional prop updates via postMessage.

### US-116: Live Regeneration with Visual Diff
When a section is regenerated, show the new version in the live preview immediately with a before/after comparison.

### US-117: Preview Security Hardening
Implement CSP, JSX sanitization, and iframe sandbox configuration with automated security tests.

---

## 9. Estimated Effort

| Story | Complexity | Effort (story points) | Sprint |
|-------|------------|----------------------|--------|
| US-111 | High | 8 | Sprint 56 |
| US-112 | Medium | 5 | Sprint 56 |
| US-113 | Low | 3 | Sprint 56 |
| US-114 | Low | 3 | Sprint 57 |
| US-115 | High | 8 | Sprint 57 |
| US-116 | Medium | 5 | Sprint 57 |
| US-117 | Medium | 5 | Sprint 56 |
| **Total** | | **37 SP** | **2 sprints** |

### Sprint Allocation

**Sprint 56 (Foundation):** US-111, US-112, US-113, US-117
- Deliverable: Users see a visual preview of their generated site with brand tokens. Security hardened.

**Sprint 57 (Interaction):** US-114, US-115, US-116
- Deliverable: Users can resize viewport, click sections to edit, and see regenerated sections live.

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Sucrase cannot transpile some AI-generated JSX patterns | Low | High | Validator (M26) already constrains JSX to safe subset; add Sucrase-specific lint rules |
| Tailwind CDN is slow or unavailable | Low | Medium | Bundle a fallback Tailwind CSS file with common classes; lazy-load CDN |
| SDC approximate renderers diverge from actual Drupal rendering | Medium | Low | Document as "approximate" in UI; code_components mode is primary path |
| iframe postMessage race conditions | Medium | Medium | Message queue with sequence numbers; acknowledge pattern |
| Large JSX components cause slow transpilation | Low | Low | Set size limits in validator (already capped at 6000 tokens) |
| Google Fonts blocked by corporate firewalls | Medium | Low | Fall back to system font stack; fonts are cosmetic |

### 10.1 Risk: AI-Generated Code Breaks at Runtime

The biggest risk is that AI-generated JSX transpiles successfully but throws runtime errors (undefined variables, invalid hook usage, etc.).

**Mitigation:** Each section is rendered inside an error boundary:

```typescript
function SectionErrorBoundary({ children, sectionIndex }) {
  // On error: render a styled error placeholder with "Regenerate" button
  // Does NOT crash the entire preview
}
```

This ensures a single broken section does not break the entire page preview.

---

## 11. Future Enhancements (Out of Scope for M28)

1. **Drag-and-drop section reordering** in the preview iframe.
2. **Inline text editing** — click text in the preview to edit it directly (ContentEditable).
3. **Animation preview toggle** — play/pause section entrance animations.
4. **Side-by-side comparison** — show current vs. regenerated version simultaneously.
5. **Export to static HTML** — download the preview as a standalone HTML file.

---

## 12. Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Should we support preview for mixed-mode blueprints (some pages SDC, some code_components)? | Recommend yes — both renderers are independent |
| 2 | Should the preview auto-refresh on prop edits or require a manual "Apply" action? | Recommend auto-refresh with 150ms debounce |
| 3 | Is Tailwind Play CDN stable enough for production use? | Needs spike — if not, evaluate Twind as fallback |
| 4 | Should we preload all pages' transpiled JS or only the active page? | Recommend active page only — keep memory bounded |

---

*Next step: Invoke `/drupal-architect` to break these stories into implementation-ready backlog tasks, or `/tpm sprint` to plan Sprint 56.*
