# TASK-342: Live Preview UX Research — Split-Pane & Side-Panel Patterns

**Date:** 2026-03-21
**Author:** Visual Designer (AI Agent)
**Status:** Research Complete

---

## 1. Competitive Audit: Preview Patterns in Website Builders

### 1.1 Webflow

| Attribute | Detail |
|-----------|--------|
| **Split ratio** | ~25/75 (left panel / canvas). The left panel is a narrow settings sidebar (~280-320px fixed width); the canvas takes remaining space. |
| **Preview content** | Live rendered output at all times. No skeleton/wireframe intermediate — every change is rendered in real-time on the canvas. |
| **Update trigger** | Immediate on every input change (no debounce visible). CSS property changes apply frame-by-frame. Text edits are inline on canvas. |
| **Mobile handling** | Panel collapses to icons-only rail (~48px) on smaller viewports. Canvas remains full-width. No bottom sheet pattern. Webflow is desktop-only for editing (min ~1280px). |

**Key takeaway:** Webflow treats the canvas as the primary artifact and the panel as secondary tooling. Users edit *on* the canvas, not in a form.

### 1.2 Framer

| Attribute | Detail |
|-----------|--------|
| **Split ratio** | ~20/60/20 (left layers panel / canvas / right properties panel). Canvas is always center-stage. Panels are fixed-width (~240px each). |
| **Preview content** | Live rendered output. Framer also has a dedicated "Preview" mode (full-screen, no panels) toggled by a play button. |
| **Update trigger** | Immediate for visual properties (drag, color, spacing). Text edits are inline. Component prop changes apply on blur or enter. |
| **Mobile handling** | Desktop-only editor (min ~1024px). Panels can be individually toggled closed. No responsive collapse — Framer shows a "use desktop" message on tablets. |

**Key takeaway:** Framer separates "editing" from "preview" modes. The editing canvas is live but chrome-heavy; preview mode strips all UI.

### 1.3 Squarespace

| Attribute | Detail |
|-----------|--------|
| **Split ratio** | ~30/70 (left panel / preview). Panel width is fixed at ~340px; preview fills remaining space. During style editing, panel can expand to ~400px. |
| **Preview content** | Live page preview at all times. Initial load shows a skeleton shimmer (content placeholders) for ~500ms, then hydrates. Style changes (fonts, colors) apply instantly. Content changes apply on panel close or field blur. |
| **Update trigger** | **Debounced** for text fields (~400-500ms after last keystroke). Instant for toggles, color pickers, and dropdowns. Save is explicit (though auto-draft exists). |
| **Mobile handling** | Squarespace editor works on tablets (iPad) with a collapsible panel — tap outside panel to collapse, tap edit button to re-expand. No editor on phones; users get the "use a computer" prompt. |

**Key takeaway:** Squarespace balances live preview with a distinct form panel. The debounced text update pattern prevents jank during typing. Tablet support via collapsible panel is notable.

### 1.4 Wix

| Attribute | Detail |
|-----------|--------|
| **Split ratio** | ~20/80 (narrow left toolbar + floating panels / canvas). Wix uses floating modal-style panels (~320px wide) over the canvas rather than a true split. |
| **Preview content** | Live canvas during editing. Separate "Preview" toggle (top bar) hides all editing UI and shows the page as visitors see it. During editing, selected elements show blue outlines and handles. |
| **Update trigger** | Immediate for drag/resize. Text editing is inline on canvas. Property panel changes (colors, fonts) apply on selection/blur. Wix debounces nothing visible — changes are frame-immediate. |
| **Mobile handling** | Wix has a dedicated "Mobile Editor" mode (separate viewport, not responsive collapse). The desktop editor requires min ~1280px. On tablets, Wix redirects to a simplified mobile editor. |

**Key takeaway:** Wix avoids fixed split-pane entirely. Floating panels over a full-width canvas preserve maximum preview real estate. The trade-off is potential occlusion.

### 1.5 WordPress Block Editor (Gutenberg)

| Attribute | Detail |
|-----------|--------|
| **Split ratio** | ~75/25 (content area / right settings sidebar). The content area is the editable canvas; the sidebar is a fixed ~280px panel for block settings and document settings. |
| **Preview content** | Near-WYSIWYG in the editor canvas. Blocks render with actual theme styles (via `theme.json` integration). A separate "Preview" button opens a new tab with the actual front-end render. |
| **Update trigger** | Immediate for block content (inline editing). Sidebar changes (spacing, color, typography) apply instantly via React state. No debounce on individual fields. Auto-save drafts every 60 seconds. |
| **Mobile handling** | On tablets, the sidebar collapses and becomes a bottom sheet (triggered by the settings gear icon). On phones (<600px), the sidebar is hidden entirely; block settings are accessed via a bottom sheet on block selection. |

**Key takeaway:** Gutenberg's bottom-sheet pattern on mobile is the closest precedent to our needs. The 75/25 desktop split prioritizes content over settings, which is the inverse of our onboarding (where input is primary).

---

## 2. Pattern Comparison Matrix

| Builder | Split Type | Ratio | Update Trigger | Skeleton Phase | Mobile Pattern |
|---------|-----------|-------|---------------|----------------|----------------|
| Webflow | Fixed sidebar + canvas | 25/75 | Immediate | None | Desktop-only |
| Framer | 3-panel (layers/canvas/props) | 20/60/20 | Immediate + blur | None | Desktop-only |
| Squarespace | Fixed panel + preview | 30/70 | Debounced ~400ms | Shimmer on load | Collapsible panel (tablet) |
| Wix | Floating panels over canvas | ~20/80 effective | Immediate | None | Separate mobile editor |
| WordPress | Content + sidebar | 75/25 | Immediate | None | Bottom sheet (tablet/mobile) |

**Industry consensus:**
- Desktop: fixed-width panel (280-400px) paired with a fluid preview area
- Update triggers: immediate for visual properties, debounced for text input
- Mobile: either unsupported, or bottom sheet / collapsible panel
- No major builder uses a true 50/50 split

---

## 3. Feasibility Assessment for Our Onboarding

### Context Recap

- 11 steps: start, name, idea, audience, pages, design, brand, fonts, follow-up, tone, review-settings
- Current layout: centered single-column (`max-w-xl mx-auto`) on `slate-950` background
- Preview = CSS-only SiteSkeletonPreview (browser chrome, nav from page names, brand gradients, heading font)
- Preview is relevant only for steps 5-8 (pages, design, brand, fonts) — the "split tier"
- Steps 1-4 (start, name, idea, audience) are conversational inputs with no visual output yet
- Steps 9-11 (follow-up, tone, review) are summary/confirmation

### 3.1 Desktop (>=1024px): 45/55 Split-Pane

**Feasibility: HIGH**

The current `StepLayout` renders a centered column (`max-w-xl mx-auto`). For split-tier steps, we replace this with a two-column grid:

```
grid grid-cols-[45fr_55fr] — input column left, preview column right
```

Why 45/55 (not 50/50):
- The preview needs more horizontal space to render a realistic site skeleton at a useful width
- 45% on a 1280px screen = 576px for input — more than enough for our form fields (current max-w-xl = 576px)
- 55% = 704px for preview — enough for a ~640px skeleton with padding
- Industry precedent: Squarespace (30/70) and Gutenberg (75/25) show asymmetric splits are standard

**Concern:** Our input forms are currently centered with generous vertical whitespace. In a split layout, they should left-align within their column and vertically center. This is a layout change but not a component rewrite.

### 3.2 Tablet (768-1023px): Collapsible Side Panel

**Feasibility: MEDIUM**

Options evaluated:
1. **Collapsible right panel** (Squarespace pattern): Preview panel slides in/out with a toggle. Default: collapsed. User taps "Preview" to see current state.
2. **Bottom drawer** (WordPress pattern): Preview appears as a half-height drawer from the bottom.

**Recommendation:** Collapsible side panel, because:
- Our preview is a CSS skeleton (lightweight, fast to render)
- Bottom drawer competes with the form's submit button and progress dots
- Side panel can use the same 45/55 component, just with the preview default-collapsed and a toggle button

### 3.3 Mobile (<768px): No Preview Pane — AiInsightChip Instead

**Feasibility: HIGH**

On mobile, the split preview provides almost no value:
- A 320px-wide site skeleton preview is too small to be meaningful
- The onboarding form needs full width for usability (touch targets, readability)
- Users on mobile are in "input mode," not "design evaluation mode"

**Replacement:** `AiInsightChip` — small inline confirmation badges that appear contextually:
- After picking pages: "6 pages selected — Home, About, Services..."
- After brand colors: a small color dot row showing the selected palette
- After fonts: a text sample in the chosen heading font

This provides feedback without consuming layout space.

---

## 4. Wireframe Layout Options (ASCII)

### Option A — "Split Canvas" (45/55, input left, preview right)

**Desktop (>=1024px):**
```
+------------------------------------------------------------------+
| Logo            [step 5/11]            Progress: ●●●●◉○○○○○○     |
+------------------------------------------------------------------+
|                    |                                              |
|   PAGE MAP         |   +----[browser chrome]------------------+  |
|                    |   | ← → ◉  yoursite.com                 |  |
|   Which pages do   |   +-------------------------------------+  |
|   you need?        |   | Home   About   Services   Contact   |  |
|                    |   +-------------------------------------+  |
|   [x] Home         |   |                                     |  |
|   [x] About        |   |   +-----------+                     |  |
|   [x] Services     |   |   | Hero area |                     |  |
|   [x] Blog         |   |   | ██████████|                     |  |
|   [ ] Portfolio     |   |   +-----------+                     |  |
|   [ ] FAQ           |   |                                     |  |
|                    |   |   ┌─────┐ ┌─────┐ ┌─────┐           |  |
|   + Add custom     |   |   │Card │ │Card │ │Card │           |  |
|     page           |   |   └─────┘ └─────┘ └─────┘           |  |
|                    |   |                                     |  |
|                    |   |   [ Footer ████████████ ]            |  |
|   [Back]  [Next→]  |   +-------------------------------------+  |
|                    |                                              |
+------------------------------------------------------------------+
```

**Mobile (<768px):**
```
+------------------------+
| Logo        ●●●●◉○○○  |
+------------------------+
|                        |
|   PAGE MAP             |
|                        |
|   Which pages do       |
|   you need?            |
|                        |
|   [x] Home             |
|   [x] About            |
|   [x] Services         |
|   [x] Blog             |
|   [ ] Portfolio         |
|   [ ] FAQ               |
|                        |
|   + Add custom page    |
|                        |
|  ┌──────────────────┐  |
|  │ 4 pages selected │  |  <-- AiInsightChip
|  │ Home About ...   │  |
|  └──────────────────┘  |
|                        |
|   [Back]  [Next →]     |
|                        |
+------------------------+
```

**Pros:**
- Closest to industry standard (Squarespace, Webflow)
- Preview is always visible on desktop — instant feedback loop
- Clean mental model: "I configure left, I see results right"
- Preview updates feel magical (type site name -> see it appear in browser chrome)

**Cons:**
- Requires layout bifurcation: centered layout for steps 1-4, split layout for steps 5-8, centered again for 9-11
- Transition between layout tiers may feel jarring without animation
- 45% column width is tight on 1024px screens (460px) — forms must be compact

---

### Option B — "Bottom Drawer" (full-width input, collapsible preview below)

**Desktop (>=1024px):**
```
+------------------------------------------------------------------+
| Logo            [step 5/11]            Progress: ●●●●◉○○○○○○     |
+------------------------------------------------------------------+
|                                                                  |
|              PAGE MAP                                            |
|                                                                  |
|              Which pages do you need?                            |
|                                                                  |
|              [x] Home    [x] About    [x] Services               |
|              [x] Blog    [ ] Portfolio [ ] FAQ                    |
|                                                                  |
|              + Add custom page                                   |
|                                                                  |
|              [Back]  [Next →]                                    |
|                                                                  |
+====================[ ▲ Preview ]================================+
|                                                                  |
|   +----[browser chrome]---------------------------------------+  |
|   | ← → ◉  yoursite.com                                      |  |
|   +-----------------------------------------------------------+  |
|   | Home   About   Services   Contact                         |  |
|   +-----------------------------------------------------------+  |
|   |   +--Hero area--+    ┌─────┐ ┌─────┐ ┌─────┐             |  |
|   |   | ████████████|    │Card │ │Card │ │Card │             |  |
|   |   +-------------+    └─────┘ └─────┘ └─────┘             |  |
|   +-----------------------------------------------------------+  |
|                                                                  |
+------------------------------------------------------------------+
```

**Mobile (<768px):**
```
+------------------------+
| Logo        ●●●●◉○○○  |
+------------------------+
|                        |
|   PAGE MAP             |
|                        |
|   Which pages?         |
|                        |
|   [x] Home             |
|   [x] About            |
|   [x] Services         |
|                        |
|   [Back]  [Next →]     |
|                        |
+=====[ ▲ Preview ]=====+
|  +--[browser]-------+  |
|  | yoursite.com      |  |
|  | Home About Svcs   |  |
|  | ┌──────────────┐  |  |
|  | │  Hero area   │  |  |
|  | └──────────────┘  |  |
|  +-------------------+  |
+------------------------+
```

**Pros:**
- Preserves the existing centered layout for ALL steps — no layout tier switching
- Preview is opt-in (collapsed by default), reducing cognitive load
- Works on all breakpoints with the same component (just adjust drawer height)
- Bottom sheet is a familiar mobile pattern (Maps, Spotify, etc.)

**Cons:**
- Preview is hidden by default — users may not discover it
- When expanded, the preview competes with the form for vertical space (especially on 768px tall laptops)
- Scrolling can feel awkward (form scrolls independently of drawer)
- Less "wow factor" than a side-by-side live preview

---

### Option C — "Contextual Cards" (full-width input, floating insight cards, no preview pane)

**Desktop (>=1024px):**
```
+------------------------------------------------------------------+
| Logo            [step 5/11]            Progress: ●●●●◉○○○○○○     |
+------------------------------------------------------------------+
|                                                                  |
|              PAGE MAP                                            |
|                                                                  |
|              Which pages do you need?                            |
|                                                                  |
|              [x] Home    [x] About    [x] Services               |
|              [x] Blog    [ ] Portfolio [ ] FAQ                    |
|                                                                  |
|              + Add custom page                                   |
|                                                                  |
|          +----------------------------------------------+        |
|          | Site structure preview:                       |        |
|          |                                              |        |
|          |  Nav: Home | About | Services | Blog         |        |
|          |  ████ ████ ████ ████  (4-page layout)        |        |
|          |                                              |        |
|          | "4 pages is great for a small business       |        |
|          |  site. Consider adding FAQ for SEO."         |        |
|          +----------------------------------------------+        |
|                                                                  |
|              [Back]  [Next →]                                    |
|                                                                  |
+------------------------------------------------------------------+
```

**Mobile (<768px):**
```
+------------------------+
| Logo        ●●●●◉○○○  |
+------------------------+
|                        |
|   PAGE MAP             |
|                        |
|   Which pages?         |
|                        |
|   [x] Home             |
|   [x] About            |
|   [x] Services         |
|   [x] Blog             |
|                        |
|  ┌──────────────────┐  |
|  │ Nav: Home|About| │  |
|  │ Services|Blog    │  |
|  │ ████ ████ ████   │  |
|  │                  │  |
|  │ "4 pages. Add    │  |
|  │  FAQ for SEO."   │  |
|  └──────────────────┘  |
|                        |
|   [Back]  [Next →]     |
|                        |
+------------------------+
```

**Pros:**
- Simplest implementation — no layout changes needed at all
- Works identically on all breakpoints
- Insight text adds value beyond pure visual preview (AI-generated suggestions)
- Fastest to build and ship; lowest risk
- No layout transition jank between step tiers

**Cons:**
- No realistic site preview — users don't "see" their site being built
- Less engaging/impressive than a live split-pane preview
- The "wow" moment of seeing your brand colors and fonts on a real-looking site is lost
- Contextual cards can feel like tooltips rather than a design tool

---

## 5. State Sync Approach

### Architecture: `useOnboarding` hook with debounced preview

```
User Input (keystroke / selection)
        │
        ▼
  useOnboarding.save(step, data)   ──→  Server (persists draft)
        │
        ▼
  Local state update (immediate)
        │
        ├──→ Form UI reflects change (instant)
        │
        └──→ Debounce timer (300ms)
                    │
                    ▼
            Preview state update
                    │
                    ▼
            SiteSkeletonPreview re-renders
```

### Implementation Details

**Step 1: Extend `useOnboarding` with preview state**

The current hook manages `siteId`, `save()`, `resume()`, and `buildStepUrl()`. We add:

- `previewState`: aggregated data from all completed steps, shaped for the preview component
- `updatePreview(field, value)`: called by each step's input handlers
- Internal `useDeferredValue` or `300ms debounce` before propagating to preview

**Step 2: Preview state shape**

```typescript
interface PreviewState {
  siteName: string;         // from step "name"
  pages: string[];          // from step "pages"
  brandColors: {            // from step "brand"
    primary: string;
    secondary: string;
    accent: string;
  };
  headingFont: string;      // from step "fonts"
  bodyFont: string;         // from step "fonts"
  designStyle: string;      // from step "design"
}
```

**Step 3: Debounce strategy**

- **Text inputs** (site name): 300ms debounce. User types "My Bakery" — preview updates title after 300ms of inactivity.
- **Selection inputs** (page toggles, color swatches, font picker): Immediate (0ms). These are discrete choices, not continuous input.
- **Rationale for 300ms:** Industry standard for "responsive but not jittery." Squarespace uses ~400ms; we can be slightly faster because our preview is CSS-only (no server rendering, no network).

**Step 4: React implementation approach**

Prefer `React.useDeferredValue` over manual `setTimeout` debounce:
- `useDeferredValue` is concurrent-mode aware and won't block urgent updates
- Falls back to synchronous in non-concurrent environments
- For text specifically, combine with `useTransition` to keep input responsive

For selection-based inputs, update preview state immediately (no deferral needed).

---

## 6. Recommendation: Split-Pane Ratio & Breakpoint Strategy

### Recommended Approach: Option A — "Split Canvas" (45/55)

**Why Option A over B and C:**

| Criteria | A (Split) | B (Drawer) | C (Cards) |
|----------|-----------|------------|-----------|
| User delight / "wow" | High | Medium | Low |
| Implementation effort | Medium | Medium | Low |
| Mobile experience | Good (AiInsightChip) | Fair (mini drawer) | Good (same as desktop) |
| Feedback immediacy | Instant (always visible) | On-demand (hidden default) | Partial (text only) |
| Layout complexity | Medium (3-tier system) | Low (single layout) | None |

The live split-pane preview is the single highest-impact UX differentiator for our onboarding. Seeing your site name appear in browser chrome, watching nav items populate as you toggle pages, seeing brand colors flow into gradients — this creates the emotional investment that drives completion rates. Option C is the safest but sacrifices the core value proposition. Option B hides the preview by default, which means most users will never see it.

### Breakpoint Strategy

| Breakpoint | Layout | Preview |
|------------|--------|---------|
| **>=1280px** (desktop-lg) | `grid-cols-[45fr_55fr]` with 32px gap | Full SiteSkeletonPreview, ~680px wide |
| **1024-1279px** (desktop-sm) | `grid-cols-[45fr_55fr]` with 24px gap | SiteSkeletonPreview scaled to fit, ~540px wide |
| **768-1023px** (tablet) | Full-width centered input + collapsible right panel (280px overlay) | Panel toggle button in top-right. Default collapsed. Slide-in animation. |
| **<768px** (mobile) | Full-width centered input (existing layout) | No preview pane. AiInsightChip inline after form fields. |

### Split-Pane Ratio Details

- **45% input column:** min 420px (at 1024px breakpoint floor = 460px). Contains: step icon, title, subtitle, form fields, navigation buttons, progress dots.
- **55% preview column:** min 520px (at 1024px breakpoint floor = 564px). Contains: SiteSkeletonPreview centered vertically with padding. Sticky positioning (`sticky top-24`) so preview stays visible if form scrolls.
- **Gap:** 24-32px depending on breakpoint. Use a subtle vertical divider (`border-l border-white/10`) for visual separation on dark background.

### Layout Tier Transitions

The 3-tier layout concern (centered -> split -> centered) can be handled gracefully:

1. **Steps 1-4 (centered):** Standard `StepLayout` as-is. Preview column renders empty or with a subtle placeholder.
2. **Steps 5-8 (split):** `SplitStepLayout` wraps `StepLayout` content in the left column. Preview appears with a `fade-in + slide-left` animation on first entry to step 5.
3. **Steps 9-11 (summary):** Return to centered. Preview column fades out on transition to step 9.

Alternative: render the split grid for ALL steps, but only populate the preview column for steps 5-8. Steps 1-4 use the full grid width via `col-span-2` on the input column. This avoids layout reflow entirely.

### Implementation Priority

1. **Phase 1:** Build `SiteSkeletonPreview` component (CSS-only, no dependencies)
2. **Phase 2:** Build `SplitStepLayout` wrapper with responsive breakpoints
3. **Phase 3:** Wire preview state through `useOnboarding` with debounce
4. **Phase 4:** Add AiInsightChip for mobile fallback
5. **Phase 5:** Add tablet collapsible panel
6. **Phase 6:** Animate layout tier transitions

---

## Appendix: SiteSkeletonPreview Component Specification

The preview is entirely CSS — no images, no server rendering.

```
+----[● ● ●]---[yoursite.com]----+
| Home  About  Services  Blog    |  <-- nav from pages[] array
+---------------------------------+
|                                 |
|  ████████████████████████████   |  <-- hero gradient (primary -> secondary)
|  ████████████████████████████   |
|  ████████████████████████████   |
|    "Your Heading Here"          |  <-- heading font sample
|                                 |
|  ┌────────┐ ┌────────┐ ┌────┐  |  <-- card grid (accent color borders)
|  │ ██████ │ │ ██████ │ │ ██ │  |
|  │ ────── │ │ ────── │ │ ── │  |
|  │ ────── │ │ ────── │ │ ── │  |
|  └────────┘ └────────┘ └────┘  |
|                                 |
|  [ Footer gradient bar ]        |  <-- secondary -> primary gradient
+---------------------------------+
```

Elements driven by preview state:
- Browser chrome URL bar: `siteName` (lowercased, slugified)
- Nav items: `pages[]` array
- Hero gradient: `brandColors.primary` to `brandColors.secondary`
- Card accent borders: `brandColors.accent`
- Heading text: rendered in `headingFont` via Google Fonts or system stack
- Body placeholder lines: rendered in `bodyFont`
- Overall style (rounded corners, shadows, spacing): driven by `designStyle`
