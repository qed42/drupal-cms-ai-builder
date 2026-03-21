# Architecture: Design System Abstraction Layer

**Date:** 2026-03-21 (revised)
**Author:** Solution Architect
**Status:** Ready for review
**Milestone:** M19 — Design System Decoupling

---

## 1. Problem Statement

The AI builder is deeply coupled to Space DS v2 across 8 files with 100+ hardcoded component IDs. This prevents:
- Supporting alternative Drupal SDC themes (Mercury, CivicTheme, custom themes)
- Shipping the builder as a reusable product
- Testing with different component sets

**Target state:** Three design system adapters — Space DS, Mercury, CivicTheme — shipped as standalone libraries, selectable during onboarding.

## 2. Theme Landscape Analysis

### 2.1 Comparison Matrix

| Aspect | Space DS v2 | Mercury | CivicTheme |
|--------|------------|---------|------------|
| **Components** | 31 | 22 | 60+ |
| **SDC support** | Yes | Yes | Yes (v1.11.0) |
| **Namespace** | `space_ds:*` | `mercury:*` | `civictheme:*` |
| **Canvas ready** | Yes | Yes (Canvas-specific) | In progress |
| **Layout primitive** | `space-flexi` (flexbox, 11 column splits) | `section` (CSS Grid, 10 column splits + width control) | `Layout` (CSS Grid, 3-column fixed) |
| **Section wrapper** | `space-container` (bg color, width, padding) | `section` (combines container + grid) | Content type dependent |
| **Composition model** | `container → flexi → atoms` | `section → grid slots → components` | `organisms embed molecules embed atoms` |
| **Has explicit grid component** | Yes (`flexi`) | Yes (`section` grid + `group`) | Limited (3-col fixed layout) |
| **Theming** | CSS vars via Drupal config | CSS custom props in `theme.css` (OKLCH) | SCSS → CSS custom props (compile required) |
| **Runtime brand customization** | Yes (theme settings API) | Yes (swap `theme.css`) | No (requires SCSS rebuild) |
| **Card types** | 2 | 5 | 7 |
| **Hero variants** | 4 | 3 | 2 (banner, campaign) |
| **Header/footer** | SDC components | SDC components (`navbar`, `footer`) | SDC components |
| **Styling engine** | CSS/SCSS | Tailwind v4 + CVA | SCSS + BEM |
| **Light/dark mode** | No | Yes (`.dark` class) | Yes (per-component) |
| **XB compatible** | Unknown | No (explicit conflict) | Unknown |

### 2.2 Architecture Patterns Across Themes

**What's shared:**
- All three use SDC (`*.component.yml` schema files)
- All three have header, footer, hero, card, heading, text, button, image atoms
- All three use some form of container/section wrapper with background control
- All three have slot-based composition for layout components
- Column split patterns overlap significantly (50-50, 33-33-33, 25-75, etc.)

**What diverges:**
- **Container vs Section duality:** Space DS separates container (wrapper) from flexi (grid). Mercury merges them into `section` (wrapper + grid in one). CivicTheme uses organism-level components that embed their own layouts.
- **Grid flexibility:** Space DS and Mercury have parametric grids (10-11 split options). CivicTheme has a fixed 3-column layout.
- **Brand token application:** Space DS writes Drupal config → theme reads at runtime. Mercury has a standalone CSS file. CivicTheme requires a build step.

---

## 3. System Context

```
┌──────────────────────────────────────────────────────────────┐
│ Platform App (Next.js)                                        │
│  ┌──────────────┐   ┌─────────────────────────────────┐      │
│  │ Onboarding   │   │ AI Generation Pipeline           │      │
│  │ Step: "Pick  │──▶│  ┌───────────────────────────┐   │      │
│  │  your theme" │   │  │ Design System Adapter      │   │      │
│  └──────────────┘   │  │ Interface (types.ts)       │   │      │
│                     │  └─────────────┬─────────────┘   │      │
│                     │                │                  │      │
│                     │  ┌─────────────▼─────────────┐   │      │
│                     │  │ Adapter Libraries          │   │      │
│                     │  │  @ai-builder/ds-space-ds   │   │      │
│                     │  │  @ai-builder/ds-mercury    │   │      │
│                     │  │  @ai-builder/ds-civictheme │   │      │
│                     │  └───────────────────────────┘   │      │
│                     └─────────────────────────────────┘      │
├──────────────────────────────────────────────────────────────┤
│ Provisioning Engine                                           │
│  Reads adapter.themeName → installs correct Drupal theme      │
│  Reads adapter.applyBrandTokens() → configures theme branding│
└──────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Drupal CMS      │
│ (SDC theme)     │
└─────────────────┘
```

---

## 4. Architecture Decision Records

### ADR-DS-001: Abstraction Approach — Hybrid Config + Strategy

**Context:** Need to decouple 8 files from Space DS. Three target themes have different composition models.

**Options:**

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A | Full OOP Adapter (class per DS) | Maximum flexibility | Over-engineered; most methods return static data |
| B | Configuration-only (JSON per DS) | Simple, declarative | Can't express behavioral differences (tree building, brand token application) |
| C | **Hybrid: Config + Strategy** | Config for static data (~80%), strategy functions for dynamic logic (~20%) | Two concepts |
| D | Plugin discovery | Runtime extensibility | Over-engineered for 3 adapters |

**Decision:** **Option C** — A design system adapter is a TypeScript module that exports:
1. A **config object** — manifest, labels, versions, image props, color palette
2. **Strategy functions** — composition patterns, tree building, prompt fragments, brand token application

### ADR-DS-002: Component Role Mapping — Tiered with Variance

**Context:** Themes have different component counts. CivicTheme has 7 card types; Mercury has 5; Space DS has 2. Some roles won't exist in all themes.

**Decision:** Three-tier role system:

```
Required (every adapter MUST map):
  container, heading, text, image, button, link

Standard (most adapters will map):
  hero, cta-banner, section-heading, accordion, slider, card, header, footer

Extended (optional, graceful degradation):
  testimonial-card, user-card, stats-kpi, contact-card, video-banner,
  logo-section, content-detail, icon, pricing-card, badge, ...
```

**Key insight from research:** The `layout` role CANNOT be a simple role mapping because:
- Space DS: separate `container` (wrapper) + `flexi` (grid) = 2 components
- Mercury: single `section` (wrapper + grid combined) = 1 component
- CivicTheme: no parametric grid component; layout is baked into organisms

This means **section composition is the adapter's responsibility, not the tree builder's.**

### ADR-DS-003: Section Composition Strategy

**Context:** The current tree builder assumes `container → flexi → children`. This model doesn't fit Mercury (section IS the container+grid) or CivicTheme (no generic grid).

**Options:**

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A | Keep tree builder with configurable component IDs | Minimal change | Breaks for CivicTheme (no grid primitive) |
| B | **Move section composition into the adapter** | Each adapter builds sections its own way | More code per adapter; tree builder becomes thinner |
| C | Abstract "section builder" interface with 3 implementations | Clean separation | Over-specified; composition patterns are data, not types |

**Decision:** **Option B** — The adapter owns section composition.

The tree builder becomes a thin orchestrator:
```
Tree Builder (generic):
  1. Call adapter.buildHeroSection(heroData)
  2. For each content section:
     Call adapter.buildContentSection(pattern, children)
  3. Call adapter.buildHeaderTree(headerData)
  4. Call adapter.buildFooterTree(footerData)
```

Each adapter implements `buildContentSection()` using its own layout primitives:

```
Space DS adapter:
  buildContentSection("text-image-50-50", children) →
    container { flexi(50-50) { heading, text, button | image } }

Mercury adapter:
  buildContentSection("text-image-50-50", children) →
    section(columns: "50-50") { heading, text, button | image }

CivicTheme adapter:
  buildContentSection("text-image-50-50", children) →
    promo(image, heading, text, button)  // pre-composed organism
```

**This is the critical architectural difference:** CivicTheme doesn't compose at the grid level — it picks a pre-composed organism. The adapter hides this.

### ADR-DS-004: Adapter Packaging — Workspace Libraries

**Context:** User wants adapters as standalone libraries invokable by selection.

**Options:**

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A | npm packages (separate repos) | True independence, versioned | Overhead for internal project |
| B | **Monorepo workspace packages** | Co-located, shared types, single CI | All in one repo |
| C | Subdirectories (no package boundary) | Simplest | No clear dependency boundary; can't tree-shake |

**Decision:** **Option B** — npm workspace packages within the monorepo.

```
packages/
  ds-types/                        # Shared interfaces + base utilities
    package.json                   # @ai-builder/ds-types
    src/
      types.ts
      registry.ts
      base-adapter.ts              # Abstract base with shared logic
  ds-space-ds/                     # Space DS adapter
    package.json                   # @ai-builder/ds-space-ds
    src/
      index.ts
      manifest.json
      role-map.ts
      composition-patterns.ts
      section-builder.ts
      prompt-fragments.ts
      tree-builders.ts             # Header/footer
      brand-tokens.ts              # How to apply brand to this theme
  ds-mercury/                      # Mercury adapter
    package.json                   # @ai-builder/ds-mercury
    src/
      index.ts
      manifest.json
      role-map.ts
      section-builder.ts
      prompt-fragments.ts
      tree-builders.ts
      brand-tokens.ts
  ds-civictheme/                   # CivicTheme adapter
    package.json                   # @ai-builder/ds-civictheme
    src/
      index.ts
      manifest.json
      role-map.ts
      section-builder.ts           # Maps patterns to pre-composed organisms
      prompt-fragments.ts
      tree-builders.ts
      brand-tokens.ts
```

Platform-app imports only what's needed:
```typescript
import { spaceDsAdapter } from '@ai-builder/ds-space-ds';
import { mercuryAdapter } from '@ai-builder/ds-mercury';
import { civicthemeAdapter } from '@ai-builder/ds-civictheme';
```

### ADR-DS-005: Brand Token Application Strategy

**Context:** Each theme handles branding differently. Space DS uses Drupal config API. Mercury uses a CSS file. CivicTheme requires SCSS compilation.

**Decision:** The adapter exposes a `BrandStrategy` that the provisioning engine calls:

```typescript
interface BrandStrategy {
  /** How this theme applies brand colors/fonts */
  applyBrand(tokens: BrandTokens, context: DrupalContext): Promise<void>;
}
```

| Theme | Strategy |
|-------|----------|
| Space DS | Write `space_ds.settings` config via Drush |
| Mercury | Generate `theme.css` with token values, place in web root |
| CivicTheme | Generate `_variables.base.scss`, run SCSS compilation |

### ADR-DS-006: Migration Strategy — Strangler Fig

**Decision:** Wrap existing code, migrate file-by-file. At every phase, the system works identically.

---

## 5. Adapter Interface (Revised)

### 5.1 Core Types

```typescript
// ---- @ai-builder/ds-types/src/types.ts ----

/** Semantic role that a component can fulfill */
type ComponentRole =
  // Required — every adapter MUST provide
  | 'container' | 'heading' | 'text' | 'image' | 'button' | 'link'
  // Standard — most adapters provide
  | 'hero' | 'cta-banner' | 'section-heading' | 'accordion'
  | 'accordion-item' | 'slider' | 'card' | 'header' | 'footer'
  // Extended — optional, graceful degradation
  | 'testimonial-card' | 'user-card' | 'stats-kpi' | 'contact-card'
  | 'video-banner' | 'logo-section' | 'content-detail' | 'icon'
  | 'pricing-card' | 'badge' | 'blockquote' | 'video';

/** Component definition from SDC manifest */
interface ComponentDefinition {
  id: string;                          // e.g., "space_ds:space-heading"
  name: string;
  description: string;
  group: string;
  props: PropDefinition[];
  slots?: SlotDefinition[];
}

interface PropDefinition {
  name: string;
  type: 'string' | 'boolean' | 'number' | 'enum' | 'object';
  required: boolean;
  title: string;
  description?: string;
  enum?: string[];
  metaEnum?: Record<string, string>;
  default?: unknown;
  examples?: string[];
}

interface SlotDefinition {
  name: string;
  description: string;
  allowedComponents?: string[];
}

/** Image handling config per component */
interface ImagePropMapping {
  props: string[];
  dimensions: { width: number; height: number };
  orientation: 'landscape' | 'portrait' | 'square';
}

/** Named section composition pattern */
interface CompositionPattern {
  name: string;                        // e.g., "text-image-50-50"
  description: string;
  childRoles: ComponentRole[];         // What roles can be placed here
  applicablePageTypes?: string[];      // Which page types favor this pattern
}

/** Page-type design guidance */
interface PageDesignRule {
  pageType: string;
  heroPreferences: ComponentRole[];
  sections: SectionRule[];
  avoidRoles?: ComponentRole[];
}

interface SectionRule {
  purpose: string;
  preferredPatterns: string[];         // Pattern names
  required?: boolean;
}

/** Background color palette */
interface ColorPalette {
  values: string[];
  darkBackgrounds: string[];
  lightBackgrounds: string[];
  defaultAlternation: string[];
}

/** Brand tokens from onboarding */
interface BrandTokens {
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    neutral?: string;
    background?: string;
    [key: string]: string | undefined;
  };
  fonts: {
    heading?: string;
    body?: string;
  };
  logo?: {
    url: string;
    alt: string;
  };
}

/** Canvas-ready component tree item */
interface CanvasItem {
  component: { id: string; version: string };
  props: Record<string, unknown>;
  slots?: Record<string, CanvasItem[]>;
}

/** Data for building header */
interface HeaderData {
  siteName: string;
  logo?: { url: string; alt: string };
  navigation: Array<{ label: string; url: string }>;
  ctaButtons?: Array<{ label: string; url: string }>;
}

/** Data for building footer */
interface FooterData {
  siteName: string;
  description?: string;
  logo?: { url: string; alt: string };
  columns?: Array<{
    heading: string;
    links: Array<{ label: string; url: string }>;
  }>;
  legalLinks?: Array<{ label: string; url: string }>;
  socialLinks?: Array<{ platform: string; url: string }>;
  copyright?: string;
}
```

### 5.2 Adapter Interface

```typescript
// ---- @ai-builder/ds-types/src/types.ts (continued) ----

interface DesignSystemAdapter {
  /** Unique identifier */
  readonly id: string;                 // e.g., "space_ds"

  /** Human-readable name */
  readonly name: string;               // e.g., "Space DS v2"

  /** Drupal theme machine name */
  readonly themeName: string;          // e.g., "space_ds"

  /** Composer package name for the theme */
  readonly composerPackage: string;    // e.g., "developer-starter/space_ds"

  // ─── Component Registry ───────────────────────────

  /** Full component manifest */
  getManifest(): ComponentDefinition[];

  /** Look up a component by SDC ID */
  getComponent(id: string): ComponentDefinition | undefined;

  /** Resolve a semantic role to component IDs (may return multiple) */
  resolveRole(role: ComponentRole): string[];

  /** Get the primary (default) component ID for a role */
  primaryComponent(role: ComponentRole): string;

  /** Check if this adapter supports a given role */
  supportsRole(role: ComponentRole): boolean;

  // ─── Section Composition (the key abstraction) ────

  /**
   * Build a content section from a pattern name and child data.
   * This is where each adapter expresses its composition model:
   * - Space DS: container → flexi → atoms
   * - Mercury: section(columns) → components
   * - CivicTheme: picks a pre-composed organism
   */
  buildContentSection(
    pattern: string,
    children: SectionChildData[],
    options?: { backgroundColor?: string; sectionHeading?: string }
  ): CanvasItem;

  /** Get available composition patterns */
  getCompositionPatterns(): CompositionPattern[];

  /** Get page design rules */
  getPageDesignRules(): PageDesignRule[];

  // ─── Tree Builders ────────────────────────────────

  /** Build hero section */
  buildHeroSection(
    variant: string,
    data: Record<string, unknown>
  ): CanvasItem;

  /** Build site header */
  buildHeaderTree(data: HeaderData): CanvasItem;

  /** Build site footer */
  buildFooterTree(data: FooterData): CanvasItem;

  // ─── Metadata ─────────────────────────────────────

  /** Canvas component version hash */
  getVersionHash(componentId: string): string;

  /** Convert SDC ID to Canvas component ID */
  toCanvasId(sdcId: string): string;

  /** Human-readable label for a component */
  getLabel(componentId: string): string;

  /** Image prop mapping for a component */
  getImageMapping(componentId: string): ImagePropMapping | undefined;

  /** Placeholder image path within theme */
  getPlaceholderImagePath(): string;

  /** Default prop overrides per component */
  getPropOverrides(): Record<string, Record<string, unknown>>;

  // ─── Color & Theming ──────────────────────────────

  /** Background color palette for sections */
  getColorPalette(): ColorPalette;

  // ─── AI Prompt Engineering ────────────────────────

  /**
   * Generate component reference section for AI prompts.
   * Each adapter produces DS-specific prompt text that tells
   * the AI what components are available and how to use them.
   */
  buildPromptComponentReference(): string;

  /** Accessibility rules specific to this DS */
  buildPromptAccessibilityRules(): string;

  /** Design system-specific generation instructions */
  buildPromptDesignGuidance(): string;

  // ─── Brand Application ────────────────────────────

  /**
   * Generate the brand application payload for provisioning.
   * Returns theme-specific configuration that the provisioning
   * engine applies to Drupal.
   *
   * Space DS: Drupal config YAML for space_ds.settings
   * Mercury: CSS file content for theme.css
   * CivicTheme: SCSS variables for _variables.base.scss
   */
  prepareBrandPayload(tokens: BrandTokens): BrandPayload;
}

/** Brand payload — what the provisioning engine applies */
type BrandPayload =
  | { type: 'drupal-config'; configName: string; values: Record<string, unknown> }
  | { type: 'css-file'; path: string; content: string }
  | { type: 'scss-file'; path: string; content: string; requiresBuild: true };

/** Data passed to buildContentSection for each child component */
interface SectionChildData {
  role: ComponentRole;
  props: Record<string, unknown>;
  slot?: 'left' | 'right' | 'column1' | 'column2' | 'column3' | 'column4';
}
```

### 5.3 Registry

```typescript
// ---- @ai-builder/ds-types/src/registry.ts ----

import type { DesignSystemAdapter } from './types';

const adapters = new Map<string, DesignSystemAdapter>();

export function registerAdapter(adapter: DesignSystemAdapter): void {
  adapters.set(adapter.id, adapter);
}

export function getAdapter(id: string): DesignSystemAdapter {
  const adapter = adapters.get(id);
  if (!adapter) {
    throw new Error(
      `Design system "${id}" not registered. Available: ${[...adapters.keys()].join(', ')}`
    );
  }
  return adapter;
}

export function listAdapters(): Array<{ id: string; name: string }> {
  return [...adapters.values()].map(a => ({ id: a.id, name: a.name }));
}
```

---

## 6. How `buildContentSection` Differs Per Theme

This is the most important method — it's where the composition model diverges.

### Space DS: Container → Flexi → Atoms

```typescript
// ds-space-ds/src/section-builder.ts

buildContentSection("text-image-50-50", children, { backgroundColor }) {
  return {
    component: canvas("space_ds:space-container"),
    props: { background_color: backgroundColor, width: "boxed-width" },
    slots: {
      container_slot: [{
        component: canvas("space_ds:space-flexi"),
        props: { column_width: "50-50", gap: "large" },
        slots: {
          column_one: [buildChild(children[0])],  // heading + text + button
          column_two: [buildChild(children[1])],  // image
        }
      }]
    }
  };
}
```

### Mercury: Section (= Container + Grid)

```typescript
// ds-mercury/src/section-builder.ts

buildContentSection("text-image-50-50", children, { backgroundColor }) {
  return {
    component: canvas("mercury:section"),
    props: {
      background_color: backgroundColor,
      columns: "50-50",
      width: "90%",
      padding_block_start: "md",
      padding_block_end: "md",
    },
    slots: {
      main_slot: [
        buildChild(children[0]),  // heading + text + button (left column)
        buildChild(children[1]),  // image (right column)
      ]
    }
  };
}
```

### CivicTheme: Pre-composed Organism

```typescript
// ds-civictheme/src/section-builder.ts

buildContentSection("text-image-50-50", children, { backgroundColor }) {
  // CivicTheme has a promo component that IS a text+image split
  // No grid primitive needed — the organism handles layout internally
  return {
    component: canvas("civictheme:promo"),
    props: {
      theme: "light",
      image: children.find(c => c.role === 'image')?.props.src,
      title: children.find(c => c.role === 'heading')?.props.text,
      content: children.find(c => c.role === 'text')?.props.content,
      link: children.find(c => c.role === 'button')?.props,
      background_color: backgroundColor,
    },
    slots: {}
  };
}
```

**Key insight:** The pattern name (`text-image-50-50`) is universal. What each adapter does with it is completely different. CivicTheme maps it to a pre-composed organism. Space DS and Mercury compose it from primitives. The tree builder doesn't need to know.

---

## 7. Pattern-to-Component Mapping Per Theme

| Pattern Name | Space DS | Mercury | CivicTheme |
|-------------|----------|---------|------------|
| `text-image-50-50` | container→flexi(50-50)→[heading,text,button \| image] | section(50-50)→[heading,text,button \| image] | `promo` organism |
| `text-image-66-33` | container→flexi(66-33)→[...] | section(67-33)→[...] | `promo` organism (same, CivicTheme controls layout) |
| `features-grid-3col` | container→flexi(33-33-33)→[icon+heading+text ×3] | section(33-33-33)→[card-icon ×3] | `navigation-card` ×3 in layout |
| `testimonials-carousel` | container→slider→[testimony-card ×N] | section→group→[card-testimonial ×N] | `slider` → `testimony-card` ×N |
| `team-grid-4col` | container→flexi(25-25-25-25)→[user-card ×4] | section(25-25-25-25)→[card ×4] | `promo-card` ×4 in layout |
| `stats-row` | container→flexi(25-25-25-25)→[stats-kpi ×4] | section(25-25-25-25)→[heading+text ×4] | No direct equivalent — degrade to heading+text list |
| `faq-accordion` | container→accordion→[accordion-item ×N] | section→accordion-container→[accordion ×N] | `accordion` → `accordion-item` ×N |
| `contact-info` | container→flexi(33-33-33)→[contact-card ×3] | section(33-33-33)→[card-icon ×3] | `contact-card` ×3 (if available) |
| `cta-banner` | cta-banner-type-1 (standalone) | cta (standalone) | `banner` or `campaign` |
| `logo-showcase` | container→logo-section | section→group→[card-logo ×N] | `logo-section` |
| `blog-grid` | container→flexi(33-33-33)→[imagecard ×3] | section(33-33-33)→[card ×3] | `publication-card` ×3 in layout |

---

## 8. Role Mapping Per Theme

```typescript
// Space DS role map
const SPACE_DS_ROLES = {
  container:         ['space_ds:space-container'],
  heading:           ['space_ds:space-heading'],
  text:              ['space_ds:space-text'],
  image:             ['space_ds:space-image'],
  button:            ['space_ds:space-button'],
  link:              ['space_ds:space-link'],
  hero:              ['space_ds:space-hero-banner-style-02',
                      'space_ds:space-hero-banner-with-media',
                      'space_ds:space-detail-page-hero-banner',
                      'space_ds:space-video-banner'],
  'cta-banner':      ['space_ds:space-cta-banner-type-1'],
  'section-heading': ['space_ds:space-section-heading'],
  accordion:         ['space_ds:space-accordion'],
  'accordion-item':  ['space_ds:space-accordion-item'],
  slider:            ['space_ds:space-slider'],
  card:              ['space_ds:space-imagecard', 'space_ds:space-dark-bg-imagecard'],
  header:            ['space_ds:space-header'],
  footer:            ['space_ds:space-footer'],
  'testimonial-card':['space_ds:space-testimony-card'],
  'user-card':       ['space_ds:space-user-card'],
  'stats-kpi':       ['space_ds:space-stats-kpi'],
  'contact-card':    ['space_ds:space-contact-card'],
  'logo-section':    ['space_ds:space-logo-section'],
  'content-detail':  ['space_ds:space-content-detail'],
  icon:              ['space_ds:space-icon'],
};

// Mercury role map
const MERCURY_ROLES = {
  container:         ['mercury:section'],           // section IS the container
  heading:           ['mercury:heading'],
  text:              ['mercury:text'],
  image:             ['mercury:image'],
  button:            ['mercury:button'],
  link:              ['mercury:button'],             // Mercury uses button for links too
  hero:              ['mercury:hero-billboard',
                      'mercury:hero-side-by-side',
                      'mercury:hero-blog'],
  'cta-banner':      ['mercury:cta'],
  accordion:         ['mercury:accordion-container'],
  'accordion-item':  ['mercury:accordion'],
  card:              ['mercury:card', 'mercury:card-icon',
                      'mercury:card-logo', 'mercury:card-pricing'],
  header:            ['mercury:navbar'],
  footer:            ['mercury:footer'],
  'testimonial-card':['mercury:card-testimonial'],
  'pricing-card':    ['mercury:card-pricing'],
  badge:             ['mercury:badge'],
  blockquote:        ['mercury:blockquote'],
  video:             ['mercury:video'],
  icon:              ['mercury:icon'],
  // Not supported in Mercury:
  // 'section-heading', 'slider', 'user-card', 'stats-kpi',
  // 'contact-card', 'logo-section', 'content-detail'
};

// CivicTheme role map
const CIVICTHEME_ROLES = {
  container:         [],                             // No standalone container — organisms handle their own wrappers
  heading:           ['civictheme:heading'],
  text:              ['civictheme:paragraph'],
  image:             [],                             // Images are props on parent components
  button:            ['civictheme:button'],
  link:              ['civictheme:content-link'],
  hero:              ['civictheme:banner', 'civictheme:campaign'],
  'cta-banner':      ['civictheme:callout'],
  accordion:         ['civictheme:accordion'],
  'accordion-item':  ['civictheme:accordion'],        // Same component, item-level
  slider:            ['civictheme:slider', 'civictheme:carousel'],
  card:              ['civictheme:navigation-card', 'civictheme:promo-card',
                      'civictheme:event-card', 'civictheme:publication-card',
                      'civictheme:service-card', 'civictheme:subject-card'],
  header:            ['civictheme:header'],
  footer:            ['civictheme:footer'],
  'testimonial-card':['civictheme:snippet'],          // Closest equivalent
  'pricing-card':    ['civictheme:price-card'],
  'user-card':       [],                              // Not available — degrade
  'stats-kpi':       [],                              // Not available — degrade
  'contact-card':    [],                              // Build from atoms
  icon:              ['civictheme:icon'],
};
```

---

## 9. Graceful Degradation

When an adapter doesn't support a role, the tree builder needs a fallback strategy:

```typescript
// In base-adapter.ts (shared utility)

function resolveWithFallback(
  adapter: DesignSystemAdapter,
  role: ComponentRole
): string | null {
  if (adapter.supportsRole(role)) {
    return adapter.primaryComponent(role);
  }

  // Fallback chain
  const FALLBACKS: Partial<Record<ComponentRole, ComponentRole[]>> = {
    'stats-kpi':        ['heading'],           // Degrade to heading + text
    'user-card':        ['card'],              // Use generic card
    'contact-card':     ['card'],              // Use generic card
    'testimonial-card': ['card'],              // Use generic card
    'section-heading':  ['heading'],           // Use plain heading
    'logo-section':     ['card'],              // Grid of image cards
    'content-detail':   ['text'],              // Rich text block
    'video-banner':     ['hero'],              // Fall back to standard hero
    slider:             [],                    // Skip carousel, use grid
  };

  for (const fallback of FALLBACKS[role] ?? []) {
    if (adapter.supportsRole(fallback)) {
      return adapter.primaryComponent(fallback);
    }
  }

  return null; // Skip this section entirely
}
```

---

## 10. Pipeline Integration — How the Adapter Gets Selected

```typescript
// platform-app/src/lib/pipeline/context.ts

interface PipelineContext {
  designSystem: DesignSystemAdapter;  // Set during onboarding
  // ... existing fields
}

// At onboarding time:
import { getAdapter } from '@ai-builder/ds-types';
const adapter = getAdapter(userSelection.themeId); // "space_ds" | "mercury" | "civictheme"
```

**Onboarding flow change:** Add a "Choose your theme" step (or default to Space DS). The selected theme ID is stored in the onboarding session and passed through the pipeline.

---

## 11. Brand Token Flow Per Theme

```
Onboarding → BrandTokens → adapter.prepareBrandPayload() → Provisioning Engine
                                                                    │
                            ┌───────────────────────────────────────┤
                            │                                       │
                    Space DS:                              Mercury:
                    Drush config-set                        Write theme.css
                    space_ds.settings                       to web root
                    { accent_color_primary: "#4856FA" }     { --primary: oklch(...) }
                            │
                    CivicTheme:
                    Write _variables.base.scss
                    Run npm build in theme dir
                    { $ct-colors-brands: ('brand1': '#4856FA') }
```

---

## 12. Migration Plan (Revised)

### Phase 1: Foundation (Sprint N)

| # | Task | Output |
|---|------|--------|
| 1 | Create `packages/ds-types/` workspace package | Shared types, registry, base utilities |
| 2 | Create `packages/ds-space-ds/` — port existing data | Manifest, role map, labels, versions, images, prop overrides |
| 3 | Wire workspace: `platform-app` imports `@ai-builder/ds-space-ds` | Existing behavior preserved |

### Phase 2: Consumer Migration (Sprint N+1)

| # | Task | Coupling Point | Change |
|---|------|---------------|--------|
| 4 | Migrate `canvas-component-versions.ts` | Version hashes | Delegate to `adapter.getVersionHash()` |
| 5 | Migrate `markdown-renderer.ts` | Label map | Delegate to `adapter.getLabel()` |
| 6 | Migrate `image-intent.ts` | Image prop map | Delegate to `adapter.getImageMapping()` |
| 7 | Migrate `component-validator.ts` | Manifest import | Use `adapter.getManifest()` |

### Phase 3: Composition & Prompts (Sprint N+2)

| # | Task | Coupling Point | Change |
|---|------|---------------|--------|
| 8 | Move composition patterns into Space DS adapter | `page-design-rules.ts` | `adapter.getCompositionPatterns()` |
| 9 | Move page design rules into Space DS adapter | `page-design-rules.ts` | `adapter.getPageDesignRules()` |
| 10 | Move prompt generation into adapter | `page-generation.ts` | `adapter.buildPromptComponentReference()` |

### Phase 4: Section Builder Refactor (Sprint N+3)

| # | Task | Coupling Point | Change |
|---|------|---------------|--------|
| 11 | Refactor tree builder to use `adapter.buildContentSection()` | `component-tree-builder.ts` | Tree builder becomes orchestrator; adapter owns section composition |
| 12 | Move header/footer builders into adapter | `component-tree-builder.ts` | `adapter.buildHeaderTree()`, `adapter.buildFooterTree()` |
| 13 | Move brand token application into adapter | provisioning steps | `adapter.prepareBrandPayload()` |

### Phase 5: Second Adapter — Mercury (Sprint N+4)

| # | Task | Description |
|---|------|-------------|
| 14 | Create `packages/ds-mercury/` | Manifest from Mercury SDC components, role map, section builder |
| 15 | Mercury section builder | Implement `buildContentSection()` for Mercury's `section` component |
| 16 | Mercury tree builders | Header (`navbar`), footer, hero variants |
| 17 | Mercury prompt fragments | Component reference, accessibility rules for AI |
| 18 | Mercury brand tokens | Generate `theme.css` from brand tokens |
| 19 | E2E test: generate a site with Mercury | Full pipeline validation |

### Phase 6: Third Adapter — CivicTheme (Sprint N+5)

| # | Task | Description |
|---|------|-------------|
| 20 | Create `packages/ds-civictheme/` | Manifest from CivicTheme SDC, role map |
| 21 | CivicTheme section builder | Map ALL patterns to organisms or composed equivalents — no gaps vs Space DS/Mercury |
| 22 | CivicTheme tree builders | Header, footer, hero (banner/campaign) |
| 23 | CivicTheme prompt fragments | Different AI guidance (pick organisms, not compose atoms) |
| 24 | CivicTheme brand tokens + SCSS build | Generate `_variables.base.scss`, trigger `npm install && npm run build` in sub-theme directory via provisioning engine |
| 25 | E2E test: generate a site with CivicTheme | Full pipeline validation — verify SCSS build runs and brand colors apply |

### Phase 7: Cleanup & Onboarding (Sprint N+6)

| # | Task | Description |
|---|------|-------------|
| 26 | Add theme selection step to onboarding | New step early in flow (before industry/content) with theme previews; selected theme ID stored in session and passed through pipeline |
| 27 | Remove all direct `space_ds:` references from non-adapter code | Final cleanup |
| 28 | Update provisioning to read theme from adapter | `adapter.themeName`, `adapter.composerPackage` |

---

## 13. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| CivicTheme Canvas support not ready | Can't test CivicTheme adapter end-to-end | Medium | Build adapter against SDC schema; test Canvas integration separately when ready |
| CivicTheme requires SCSS build at provisioning time | Adds build tooling dependency to provisioning | High | Provision a pre-built sub-theme OR explore CSS-only token override if possible |
| Mercury `section` component API changes upstream | Adapter breaks | Low | Pin Mercury version; version hashes provide detection |
| Pattern-to-organism mapping incomplete for CivicTheme | Some sections render poorly | Medium | Start with patterns that have clear organism equivalents; skip others |
| Adapter interface too rigid for future themes | Need interface changes | Low | Interface uses roles + patterns (abstract); concrete IDs stay inside adapters |
| Tree builder refactor (Phase 4) is the riskiest step | Regression in section generation | Medium | Snapshot tests: generate identical output before/after for Space DS |

---

## 14. Testing Strategy

| Level | What | How |
|-------|------|-----|
| **Contract** | Every adapter satisfies the interface | Shared test suite runs against each adapter: all required roles resolve, `getManifest()` returns valid data, `buildContentSection()` produces valid `CanvasItem` |
| **Snapshot** | Space DS output unchanged after migration | Generate a full blueprint pre-migration → snapshot → compare post-migration |
| **Unit** | Each adapter's section builder | Per-pattern unit tests: "text-image-50-50" produces expected tree for each adapter |
| **Integration** | Full pipeline with each adapter | Generate blueprint → import to Drupal → verify components render |
| **Graceful degradation** | Missing roles handled | Test that Mercury (no `slider`) and CivicTheme (no `stats-kpi`) gracefully degrade |

---

## 15. What This Does NOT Change

- Onboarding step flow (11 steps remain)
- AI generation pipeline architecture (prompt → design → generate → review)
- Blueprint JSON structure (still `CanvasItem` trees)
- Drupal-side import logic (consumes Canvas component trees regardless of theme)
- Dashboard UI

The adapter sits at the boundary between the pipeline and theme-specific data. Everything upstream (AI prompts) and downstream (Drupal import) stays the same.

---

## 16. Product Decisions (Resolved)

1. **Theme selection UX:** Users choose their theme during onboarding. This becomes a new step early in the flow (before industry/content steps so the AI can tailor generation to the selected theme's capabilities).

2. **CivicTheme SCSS build:** Support the SCSS build step. Provisioning engine must run `npm install && npm run build` in the CivicTheme sub-theme directory after writing `_variables.base.scss`. This means the provisioning server needs Node.js (already required for the platform-app build).

3. **Feature parity:** All three adapters must produce equivalent quality sites. No adapter ships with fewer section patterns. If a theme lacks a direct component for a pattern, the adapter must compose an equivalent from available primitives (e.g., CivicTheme `stats-kpi` → heading + paragraph blocks in a layout). The graceful degradation in Section 9 is for truly unmappable roles, not for skipping work.

4. **Mercury Editor integration:** Canvas only. Mercury's own page builder is separate from our pipeline.

---

## Handoff

Invoke `/drupal-architect` to break this architecture into technical backlog tasks (TASK-XXX). The 28 tasks in Section 12 map roughly 1:1 to backlog items. Phase 4 (section builder refactor) likely needs further decomposition.
