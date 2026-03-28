# Architecture: Canvas Code Components — Rich Digital Experiences

**Date:** 2026-03-28
**Status:** Validated (Canvas API spike complete)
**Author:** Solution Architect

---

## 1. Problem Statement

The current pipeline generates sites by mapping AI-planned sections to **SDC components from a design system theme** (Space DS, Mercury). This produces consistent, theme-compliant sites but limits output to the component library's vocabulary — no custom animations, no bespoke layouts, no rich interactive experiences.

Canvas supports **Code Components** — arbitrary HTML/CSS/JS blocks that render alongside SDC components. This opens the door to AI-generated, one-of-a-kind digital experiences with animations, parallax effects, interactive elements, and custom visual treatments.

**Goal:** Support Code Component generation as a parallel output mode alongside existing design-system-driven generation.

---

## 2. Key Differences: SDC vs Code Components

| Aspect | SDC Components (current) | Code Components (new) |
|--------|--------------------------|----------------------|
| Source | Theme's SDC library (YAML schema + Twig) | AI-generated React/Preact + Tailwind CSS v4 |
| Registry | Static manifest, predefined props/slots | Config entity (`canvas.js_component.*`) with props/slots |
| Canvas tree | `component_id` = `sdc.theme.component` | `component_id` = `js.machine_name` |
| Design rules | Adapter provides `PageDesignRule[]` | AI Designer agent generates layout strategy per site |
| Brand application | CSS custom properties via theme settings | Injected directly into generated CSS |
| Composition | Container → Flexi → children (slot-based) | Flat sections with embedded HTML |
| Animations | None (theme decides) | AI generates CSS animations, scroll effects, transitions |
| Reusability | High — shared across all sites | Low — bespoke per site |
| Quality control | Manifest-based prop validation | HTML/accessibility linting |

---

## 3. Architecture Decision Records

### ADR-1: Dual-Mode Pipeline (not fork)

**Context:** Should Code Component generation be a separate pipeline or extend the existing one?

**Options:**
| Option | Pros | Cons |
|--------|------|------|
| A. Separate pipeline | Clean separation, no risk to SDC path | Code duplication, divergent features |
| B. Extend pipeline with mode flag | Shared Research/Plan, only Generate differs | More complex Generate phase |
| C. New adapter type | Fits existing adapter pattern | Adapter interface assumes SDC semantics |

**Decision:** **Option B — extend pipeline with mode flag.**

Research and Plan phases are identical — they analyze the business and plan pages/sections. Only the Generate phase differs:
- SDC mode: maps sections to component IDs, fills props, builds Canvas tree via adapter
- Code mode: AI generates HTML/CSS/JS per section, wraps in Code Component Canvas items

**Rationale:** Avoids duplicating 70% of the pipeline. The adapter interface is not suitable (ADR-2) because Code Components don't have a static manifest.

### ADR-2: New "Designer Agent" for Code Components

**Context:** The current Generate phase uses `page-design-rules.ts` and `component-tree-builder.ts` which are deeply coupled to SDC manifests. How should Code Components be designed?

**Decision:** Introduce a **Designer Agent** — an AI agent that takes the ContentPlan and produces HTML/CSS/JS for each section. This replaces the rule-based component selection with generative design.

**Flow:**
```
ContentPlan (sections, briefs, keywords)
  ↓
Designer Agent (LLM call per section)
  → Input: section brief, tone, brand tokens, animation preferences
  → Output: { html: string, css: string, js?: string }
  ↓
Code Component Wrapper
  → Wraps output in Canvas Code Component tree items
```

**Rationale:** Code Components are freeform — there's no manifest to constrain generation. An AI agent is the natural fit for producing bespoke HTML/CSS/JS.

### ADR-3: Don't extend DesignSystemAdapter

**Context:** Should we add Code Component support to the `DesignSystemAdapter` interface?

**Decision:** **No.** The adapter interface assumes `getManifest()`, `resolveRole()`, `buildContentSection()` — all SDC concepts. Instead, introduce a parallel `CodeComponentGenerator` interface that the pipeline switches to based on mode.

```typescript
interface CodeComponentGenerator {
  readonly id: string; // e.g. "code_components"
  readonly name: string;

  generateSection(
    sectionBrief: SectionDesignBrief,
    brandTokens: BrandTokens,
    designPreferences: DesignPreferences
  ): Promise<CodeComponentOutput>;

  generateHeader(data: HeaderData, brand: BrandTokens): Promise<CodeComponentOutput>;
  generateFooter(data: FooterData, brand: BrandTokens): Promise<CodeComponentOutput>;

  wrapAsCanvasItems(output: CodeComponentOutput, sectionTag: string): ComponentTreeItem[];
}
```

### ADR-4: Onboarding UX for Mode Selection

**Context:** How does the user choose between SDC and Code Component output?

**Options:**
| Option | Pros | Cons |
|--------|------|------|
| A. User picks in onboarding ("Theme-based" vs "Custom design") | Clear, explicit | Users may not understand the difference |
| B. AI decides based on business type | Magic, zero friction | Unpredictable, hard to override |
| C. Post-generation toggle ("Try a different look") | Low-risk, non-blocking | Requires generating twice |

**Decision:** **Option A with smart defaults.** Add a "Design approach" step to onboarding:
- **Polished & consistent** (SDC) — "Built with a proven design system. Professional and fast."
- **Unique & creative** (Code Components) — "Custom-designed sections with animations. One of a kind."

Default based on industry: professional services → SDC, creative agencies/portfolios → Code.

---

## 4. Component Architecture

### 4.1 Pipeline Mode Flag

```typescript
// In OnboardingData
interface OnboardingData {
  // ... existing fields
  generationMode: "design_system" | "code_components";
  designPreferences?: {
    animationLevel: "subtle" | "moderate" | "dramatic";
    visualStyle: "minimal" | "bold" | "elegant" | "playful";
    interactivity: "static" | "scroll_effects" | "interactive";
  };
}
```

### 4.2 Generate Phase Branching

```
runGeneratePhase(siteId, data, brief, plan, onProgress)
  ├── if mode === "design_system"
  │     └── existing SDC path (adapter.buildContentSection, etc.)
  │
  └── if mode === "code_components"
        └── runCodeComponentGenerate(siteId, data, brief, plan, onProgress)
              ├── for each page:
              │     for each section:
              │       → call Designer Agent LLM
              │       → validate output (HTML lint, a11y checks)
              │       → wrap in CodeComponentCanvasItem
              ├── generate header (Code Component)
              └── generate footer (Code Component)
```

### 4.3 Designer Agent

The Designer Agent is an LLM call (Claude/GPT-4) with a specialized system prompt:

**Input (per section):**
```typescript
interface SectionDesignBrief {
  heading: string;
  contentBrief: string;
  sectionType: string;       // "hero", "features", "testimonials", etc.
  position: "opening" | "middle" | "closing";
  brandTokens: BrandTokens;  // colors, fonts, logo
  toneGuidance: string;
  animationLevel: "subtle" | "moderate" | "dramatic";
  visualStyle: string;
  previousSectionSummary?: string; // for visual rhythm
  targetKeywords?: string[];
}
```

**Output:**
```typescript
interface CodeComponentOutput {
  html: string;     // Self-contained HTML (no external dependencies)
  css: string;      // Scoped CSS (BEM or CSS modules pattern)
  js?: string;      // Optional JS for interactivity
  a11y: {           // Accessibility metadata
    ariaLabels: string[];
    headingLevel: number;
    reducedMotionHandled: boolean;
  };
}
```

**System Prompt Guidelines:**
- Generate semantic HTML5
- All CSS must be scoped (prefix with unique section ID)
- Animations must respect `prefers-reduced-motion`
- Images use placeholder URLs (`/placeholder/{width}x{height}`)
- No external CDN dependencies (all inline)
- SEO: proper heading hierarchy, alt text placeholders, meta-friendly structure
- Brand tokens injected as CSS custom properties
- Responsive: mobile-first with breakpoints at 768px and 1024px

### 4.4 Canvas Code Component Tree Item

Canvas Code Components use a special `component_id` format:

```typescript
interface CodeComponentCanvasItem extends ComponentTreeItem {
  component_id: "code_component";  // Canvas's built-in type
  inputs: {
    html: string;
    css: string;
    js?: string;
    label: string;      // Display name in Canvas editor
  };
}
```

### 4.5 Quality Gates

Since Code Components lack manifest-based validation, quality must be enforced differently:

| Gate | SDC Path | Code Component Path |
|------|----------|---------------------|
| Prop validation | Schema-based (manifest) | HTML structure linting |
| Accessibility | Theme handles it | `axe-core` rules on generated HTML |
| Responsiveness | Theme handles it | Viewport width checks in CSS |
| Brand compliance | CSS custom properties | CSS custom property usage check |
| Animation safety | N/A | `prefers-reduced-motion` presence check |
| XSS prevention | N/A (no user HTML) | DOMPurify sanitization |
| Content completeness | Prop fill rate | Heading/text node count vs brief |

```typescript
interface CodeComponentValidator {
  validateHTML(html: string): ValidationResult;
  validateAccessibility(html: string): ValidationResult;
  validateResponsiveness(css: string): ValidationResult;
  validateAnimationSafety(css: string, js?: string): ValidationResult;
  sanitize(html: string): string;
}
```

---

## 5. Data Flow

```
Onboarding (mode = "code_components")
  → Research Phase (unchanged)
  → Plan Phase (unchanged — same section briefs)
  → Generate Phase (new branch)
      → For each section:
          1. Build SectionDesignBrief from ContentPlan + ResearchBrief
          2. Call Designer Agent LLM
          3. Validate output (HTML, a11y, responsive, sanitize)
          4. If validation fails → retry with error feedback (max 2)
          5. Wrap in CodeComponentCanvasItem
      → Build header/footer Code Components
      → Assemble blueprint payload
  → Enhance Phase (modified)
      → Image placeholders in HTML replaced with stock image URLs
      → (Parse HTML for <img> tags with placeholder src, match via Pexels/Unsplash)
  → Review & Provision (unchanged — Canvas handles Code Components natively)
```

---

## 6. Enhance Phase Modification

The current Enhance phase matches images to SDC component props. For Code Components, it needs to:

1. Parse HTML for `<img>` tags with placeholder `src` attributes
2. Extract context from `alt` text or surrounding content
3. Match images via stock photo API
4. Replace placeholder URLs with real image URLs in the HTML string

```typescript
async function enhanceCodeComponent(
  section: CodeComponentOutput,
  brief: SectionDesignBrief
): Promise<CodeComponentOutput> {
  const placeholderRegex = /src="\/placeholder\/(\d+)x(\d+)"/g;
  let html = section.html;
  // ... match and replace with real stock photos
  return { ...section, html };
}
```

---

## 7. Provisioning Impact

Canvas already supports Code Components natively. The provisioning engine's `BlueprintImportService` needs to:

1. Detect Code Component items in the tree (by `component_id === "code_component"`)
2. Use Canvas's Code Component API to create them (different from SDC component creation)
3. Ensure CSS is stored in the component's style field, JS in the script field

**Risk:** Canvas Code Component API may differ from SDC component creation. Needs a spike to verify the exact Drupal API for programmatically creating Code Components.

---

## 8. Security Considerations

Code Components introduce HTML/JS injection risk:

| Threat | Mitigation |
|--------|------------|
| XSS in generated HTML | DOMPurify sanitization before storage |
| Malicious JS execution | Restrict to animation/scroll JS only; no `eval`, `fetch`, `XMLHttpRequest` |
| CSS injection | No `@import`, no `url()` except for background images from approved domains |
| Data exfiltration via JS | CSP headers on provisioned sites; no external requests from Code Components |

**Validation pipeline:**
```
LLM output → DOMPurify(html) → JS allowlist check → CSS sanitization → store
```

---

## 9. Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| 1 | LLM generates poor/inconsistent HTML | High | High | Strong system prompt + validation + retry loop (max 2) |
| 2 | Generated CSS conflicts between sections | Medium | Medium | Scope all CSS with unique section ID prefix |
| 3 | Animations cause performance issues | Medium | Medium | Cap animation count per page; require `will-change` declarations |
| 4 | Canvas Code Component API limitations | Low | High | Spike task to verify API before full implementation |
| 5 | Token costs 3-5x higher than SDC mode | High | Medium | Per-section caching; simpler prompts for standard sections |
| 6 | Generated sites don't look cohesive | Medium | High | Visual rhythm rules in Designer Agent prompt; section-to-section context passing |
| 7 | Accessibility failures in generated HTML | Medium | High | axe-core validation gate; retry with a11y error feedback |

---

## 10. Implementation Phases

### Phase 1: Foundation (1 sprint)
- Add `generationMode` to OnboardingData and onboarding step
- Create `CodeComponentGenerator` interface
- Spike: verify Canvas Code Component programmatic creation API
- Add HTML/CSS/a11y validators

### Phase 2: Designer Agent (2 sprints)
- Implement Designer Agent with section-level LLM calls
- System prompt engineering for HTML/CSS/JS generation
- Validation + retry loop integration
- Code Component Canvas item wrapper

### Phase 3: Pipeline Integration (1 sprint)
- Branch Generate phase on `generationMode`
- Modify Enhance phase for HTML image placeholder replacement
- Header/footer Code Component generation
- Update BlueprintImportService for Code Component provisioning

### Phase 4: Quality & Polish (1 sprint)
- Security sanitization pipeline (DOMPurify, JS allowlist, CSS sanitization)
- Visual consistency rules (cross-section rhythm, color balance)
- Animation `prefers-reduced-motion` enforcement
- Review editor support (Code Component sections show HTML preview)

---

## 11. Canvas API Spike Results (2026-03-28)

### Findings

1. **Entity type:** Code Components are **config entities** (`component` entity type) with `source: js`. ID format: `js.[machineName]`.
2. **Storage:** YAML config (`canvas.js_component.[machineName].yml`) with `js` (source + compiled), `css` (source + compiled), `props`, `slots`, `required`, `dataDependencies`.
3. **Tech stack:** React (Preact with React compat) + **Tailwind CSS v4** (not arbitrary HTML/CSS). Pre-installed: `FormattedText`, `cn()`, `clsx`, `class-variance-authority`, `tailwind-merge`.
4. **Programmatic creation:** Three paths:
   - Config sync: generate YAML, import via `drush cim`
   - CLI tool: `@drupal-canvas/cli` with `push`/`pull` commands (REST-based)
   - PHP Entity API: `\Drupal::entityTypeManager()->getStorage('component')->create(...)`
5. **Coexistence:** SDC + Code Components + Block components all coexist in the same component tree. Same `canvas.component_tree_node` structure.
6. **Module:** Part of core `canvas` module. AI assistance via `xb_ai` sub-module.
7. **Component tree node:** Same structure as SDC — `uuid`, `component_id` (`js.my_hero`), `component_version`, `inputs` (JSON), `parent_uuid`, `slot`.
8. **Prop types supported:** string, formatted text (HTML), boolean, integer, number, link, image, video, list:text, list:integer.

### Architecture Impact

**Key correction:** Code Components are **React/Preact**, not arbitrary HTML/CSS/JS. The Designer Agent must generate **JSX + Tailwind CSS**, not raw HTML. This is actually better:
- Tailwind provides built-in responsive utilities — no manual media queries needed
- Component props are strongly typed via `component.yml` schema
- Pre-installed utilities (`cn`, `clsx`, `cva`) provide clean conditional styling
- The `FormattedText` component handles rich text rendering

**Provisioning path:** Config sync is the most reliable path. Generate `canvas.js_component.[name].yml` config files during the pipeline, then import via Drush during provisioning. This fits our existing config-based provisioning flow.

**Revised Designer Agent output:**
```typescript
interface CodeComponentOutput {
  machineName: string;        // e.g. "hero_section_a7x"
  name: string;               // e.g. "Hero Section"
  jsx: string;                // React/Preact JSX source
  css: string;                // Tailwind CSS (can include @apply, custom utilities)
  props: PropDefinition[];    // Typed prop definitions for component.yml
  slots?: SlotDefinition[];   // Optional slots for nesting
}
```

---

## 12. Open Questions

| # | Question | Impact | Owner |
|---|----------|--------|-------|
| 1 | Does Canvas Code Component API support programmatic creation via Drush/REST? | Blocks Phase 3 | Drupal Architect |
| 2 | Should generated JS be allowed at all, or CSS-only animations? | Security scope | Product/Architect |
| 3 | Can Code Components and SDC components coexist on the same page? | Hybrid mode possibility | Drupal Architect |
| 4 | What is the token cost per section for HTML generation vs SDC prop filling? | Budget planning | Engineering |
| 5 | Should the Designer Agent use a gallery of reference designs/screenshots? | Output quality | Product/Design |

---

## Appendix: Example Designer Agent Output

**Input brief:** Hero section for a dental practice, warm/reassuring tone, moderate animations

**Output:**
```html
<section class="sec-hero-a7x" role="banner" aria-label="Welcome to Sunrise Dental">
  <div class="sec-hero-a7x__bg">
    <img src="/placeholder/1920x800" alt="Modern dental office interior" class="sec-hero-a7x__img" />
    <div class="sec-hero-a7x__overlay"></div>
  </div>
  <div class="sec-hero-a7x__content">
    <h1 class="sec-hero-a7x__title">Your Family's Smile Starts Here</h1>
    <p class="sec-hero-a7x__subtitle">Gentle, modern dentistry for every age.</p>
    <a href="/contact" class="sec-hero-a7x__cta">Book Your Visit</a>
  </div>
</section>
```

```css
.sec-hero-a7x { position: relative; min-height: 80vh; display: flex; align-items: center; }
.sec-hero-a7x__bg { position: absolute; inset: 0; }
.sec-hero-a7x__img { width: 100%; height: 100%; object-fit: cover; }
.sec-hero-a7x__overlay { position: absolute; inset: 0; background: linear-gradient(135deg, var(--color-primary, #2563eb) 0%, transparent 60%); }
.sec-hero-a7x__content { position: relative; z-index: 1; max-width: 640px; padding: 2rem; color: white; }
.sec-hero-a7x__title { font-family: var(--font-heading, sans-serif); font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.1; animation: fadeInUp 600ms ease both; }
.sec-hero-a7x__subtitle { font-size: 1.25rem; opacity: 0.9; margin-top: 1rem; animation: fadeInUp 600ms ease 200ms both; }
.sec-hero-a7x__cta { display: inline-block; margin-top: 2rem; padding: 1rem 2rem; background: var(--color-accent, #f59e0b); color: #111; border-radius: 8px; font-weight: 600; text-decoration: none; animation: fadeInUp 600ms ease 400ms both; transition: transform 150ms ease; }
.sec-hero-a7x__cta:hover { transform: translateY(-2px); }

@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) {
  .sec-hero-a7x__title, .sec-hero-a7x__subtitle, .sec-hero-a7x__cta { animation: none; }
}
@media (max-width: 768px) {
  .sec-hero-a7x { min-height: 60vh; }
  .sec-hero-a7x__content { padding: 1.5rem; }
}
```

---

*Next step: Invoke `/drupal-architect` to verify Canvas Code Component API capabilities (spike) and break this into backlog tasks.*
