# Architecture: Design Rules Engine

> A layered, cascading rule system for governing AI-generated design — inspired by Claude's CLAUDE.md rule hierarchy.

## 1. Problem Statement

Today, design constraints are **hardcoded** across three locations:
- **Adapter prompt fragments** (`buildPromptComponentReference()`, `buildPromptDesignGuidance()`, etc.) — design system specific
- **PAGE_DESIGN_RULES** arrays per adapter — page-type composition rules
- **Hardcoded guidance objects** in `code-component-generation.ts` (`SECTION_TYPE_GUIDANCE`, `ANIMATION_GUIDANCE`, `VISUAL_STYLE_GUIDANCE`)

This creates several problems:
1. **No industry customization** — a healthcare site gets the same design rules as a restaurant
2. **No persona awareness** — a photographer's portfolio and an enterprise SaaS product use identical composition patterns
3. **No user overrides** — project-level preferences can't modify rules without code changes
4. **Rules scattered across code** — no single source of truth for what governs design decisions

## 2. Design Philosophy

### Claude's Rule System as Inspiration

| Claude Concept | Design Rules Equivalent |
|---|---|
| Global `~/.claude/CLAUDE.md` | **Global rules** — accessibility, responsive, performance |
| Project `CLAUDE.md` | **Design system rules** — component constraints, patterns |
| `<carl-rules>` domain injection | **Industry rules** — domain-specific patterns and compliance |
| Session context / user instructions | **Persona + Project rules** — user preferences |
| Rule precedence (specific > general) | **Cascade resolution** — project > persona > industry > DS > global |

### Key Principles

1. **Declarative over imperative** — rules describe *what*, not *how*
2. **Additive with overrides** — more specific layers add to or override less specific ones
3. **Prompt-native** — rules resolve to prompt fragments injected at generation time
4. **Auditable** — the resolved ruleset for any generation is logged and inspectable
5. **Hot-swappable** — rules can be changed without code deploys (stored as data, not code)

## 3. Rule Layers (Cascade Order)

```
┌─────────────────────────────────────────┐
│  Layer 5: Project Rules (per-site)      │  ← Highest specificity
│  User overrides from onboarding +       │
│  manual customization                   │
├─────────────────────────────────────────┤
│  Layer 4: Persona Rules                 │
│  Business type / user archetype         │
│  (solo-creative, small-biz, enterprise) │
├─────────────────────────────────────────┤
│  Layer 3: Industry Rules                │
│  Domain-specific patterns & compliance  │
│  (healthcare, restaurant, e-commerce)   │
├─────────────────────────────────────────┤
│  Layer 2: Design System Rules           │
│  Component constraints, composition     │
│  patterns, color systems (Mercury,      │
│  Space DS)                              │
├─────────────────────────────────────────┤
│  Layer 1: Global Rules                  │  ← Lowest specificity
│  WCAG, responsive, performance,         │
│  universal design principles            │
└─────────────────────────────────────────┘
```

**Resolution**: Rules merge bottom-up. Higher layers can `override`, `extend`, or `restrict` lower layer values. If a higher layer doesn't address a rule, the lower layer's value stands.

## 4. Rule Schema

### 4.1 Rule File Format

Rules are stored as structured YAML files — human-readable, version-controllable, and parseable.

```yaml
# rules/industry/healthcare.yaml
---
id: industry-healthcare
layer: industry
name: Healthcare
description: Design rules for healthcare, medical, and wellness websites
appliesWhen:
  industry:
    - healthcare
    - medical
    - wellness
    - dental
    - mental_health
    - veterinary

rules:
  # SECTION: Composition
  composition:
    requiredSections:
      - type: trust-signals
        position: above-fold
        reason: "Healthcare visitors need immediate credibility cues"
      - type: credentials
        position: middle
        reason: "Professional qualifications build trust"
    avoidSections:
      - type: pricing-grid
        reason: "Healthcare pricing is complex; avoid oversimplification"
    sectionCountRange:
      home: [7, 10]
      services: [5, 8]

  # SECTION: Content
  content:
    toneConstraints:
      require: [empathetic, professional, clear]
      avoid: [aggressive, casual, salesy]
    requiredElements:
      - "HIPAA compliance notice in footer"
      - "Professional credentials near provider information"
      - "Accessible appointment scheduling CTA"
    wordCountMultiplier: 1.2  # Healthcare needs more detail

  # SECTION: Visual
  visual:
    colorGuidance: "Use calming, clinical colors. Avoid aggressive reds for primary palette."
    imageGuidance: "Professional, diverse, real-looking people. Avoid generic stock."
    heroStyle:
      prefer: [text-focused, split-image]
      avoid: [video-background, particle-effects]

  # SECTION: Compliance
  compliance:
    flags: [hipaa, ada-enhanced]
    requiredDisclosures:
      - "This website does not provide medical advice"
      - "In case of emergency, call 911"

  # SECTION: Design System Preferences
  designSystem:
    preferredMode: design_system
    reason: "Healthcare sites benefit from consistent, proven layouts over creative experimentation"
```

### 4.2 Rule Categories

Each rule file can define rules in these categories:

| Category | Purpose | Consumed By |
|---|---|---|
| `composition` | Page structure, section types, counts, ordering | Plan phase, Generate phase |
| `content` | Tone, word counts, required elements, CTA patterns | Research phase, Generate phase |
| `visual` | Colors, images, animations, hero styles, typography | Generate phase, Enhance phase |
| `compliance` | Legal/regulatory requirements, disclosures | Research phase, Generate phase |
| `designSystem` | DS preference, component overrides, pattern preferences | Pipeline routing, adapter selection |
| `accessibility` | Enhanced WCAG requirements beyond global baseline | All phases |
| `seo` | Industry-specific SEO rules, schema markup | Plan phase, Generate phase |

### 4.3 Override Mechanics

Rules support three merge strategies:

```yaml
# REPLACE — completely override the lower layer value
composition:
  requiredSections:
    _merge: replace
    value:
      - type: hero
      - type: menu-grid  # Restaurant-specific

# EXTEND — add to the lower layer value
composition:
  requiredSections:
    _merge: extend
    value:
      - type: trust-signals  # Added on top of base requirements

# RESTRICT — remove from the lower layer value
visual:
  heroStyle:
    _merge: restrict
    avoid:
      - video-background  # Remove this option
```

Default merge strategy is `extend` — rules accumulate unless explicitly replaced.

## 5. Component Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Rule Engine                         │
│                                                        │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Rule Store  │  │ Rule Resolver│  │ Prompt       │  │
│  │             │  │              │  │ Compiler     │  │
│  │ Load from:  │  │ Cascade      │  │              │  │
│  │ - YAML files│→ │ resolution   │→ │ Rules →      │  │
│  │ - DB        │  │ per context  │  │ prompt       │  │
│  │ - Adapter   │  │              │  │ fragments    │  │
│  └────────────┘  └──────────────┘  └──────────────┘  │
│                         ↑                              │
│                    Context Input                       │
│           (industry, persona, DS, project)             │
└──────────────────────────────────────────────────────┘
         │
         ↓
┌──────────────────┐
│ Pipeline Phases   │
│ Research → Plan   │
│ → Generate →      │
│ Enhance           │
└──────────────────┘
```

### 5.1 Rule Store (`lib/rules/store.ts`)

Responsible for loading and caching rules from all sources.

```typescript
interface RuleStore {
  /** Load all rule files from disk (YAML) */
  loadFromFiles(rulesDir: string): Promise<void>;

  /** Load design system rules from adapter */
  loadFromAdapter(adapter: DesignSystemAdapter): void;

  /** Load project-level rules from database */
  loadFromProject(siteId: string): Promise<void>;

  /** Get all rules for a specific layer */
  getRules(layer: RuleLayer): DesignRule[];

  /** Get all rules matching a context */
  query(context: RuleContext): DesignRule[];
}
```

### 5.2 Rule Resolver (`lib/rules/resolver.ts`)

Merges rules across layers into a single resolved ruleset.

```typescript
interface RuleResolver {
  /**
   * Resolve all applicable rules for a given generation context.
   * Returns a merged, deduplicated ruleset with conflicts resolved
   * by layer precedence.
   */
  resolve(context: RuleContext): ResolvedRuleset;
}

interface RuleContext {
  industry: string;
  persona?: string;
  designSystemId: string;
  generationMode: "design_system" | "code_components";
  pageType?: string;
  siteId?: string;
  // User-specified overrides from onboarding
  userOverrides?: Partial<DesignRuleCategories>;
}

interface ResolvedRuleset {
  composition: ResolvedCompositionRules;
  content: ResolvedContentRules;
  visual: ResolvedVisualRules;
  compliance: ResolvedComplianceRules;
  designSystem: ResolvedDesignSystemRules;
  accessibility: ResolvedAccessibilityRules;
  seo: ResolvedSeoRules;

  /** Full audit trail — which layer contributed which rule */
  _provenance: RuleProvenance[];
}
```

### 5.3 Prompt Compiler (`lib/rules/prompt-compiler.ts`)

Converts resolved rules into prompt fragments for each pipeline phase.

```typescript
interface PromptCompiler {
  /** Build prompt fragment for the Research phase */
  compileForResearch(rules: ResolvedRuleset): string;

  /** Build prompt fragment for the Plan phase */
  compileForPlan(rules: ResolvedRuleset, pageType: string): string;

  /** Build prompt fragment for the Generate phase */
  compileForGenerate(rules: ResolvedRuleset, pageType: string): string;

  /** Build prompt fragment for code component generation */
  compileForCodeComponent(rules: ResolvedRuleset, sectionType: string): string;
}
```

## 6. Rule Directory Structure

```
platform-app/src/lib/rules/
├── store.ts                    # Rule loading and caching
├── resolver.ts                 # Cascade resolution engine
├── prompt-compiler.ts          # Rules → prompt fragments
├── types.ts                    # Rule interfaces and schemas
├── schemas.ts                  # Zod schemas for rule validation
├── __tests__/
│   ├── resolver.test.ts        # Cascade resolution tests
│   └── prompt-compiler.test.ts
└── definitions/                # Rule YAML files
    ├── global/
    │   ├── accessibility.yaml
    │   ├── responsive.yaml
    │   └── performance.yaml
    ├── industry/
    │   ├── healthcare.yaml
    │   ├── restaurant.yaml
    │   ├── ecommerce.yaml
    │   ├── portfolio.yaml
    │   ├── saas.yaml
    │   ├── legal.yaml
    │   ├── education.yaml
    │   ├── real-estate.yaml
    │   └── nonprofit.yaml
    ├── persona/
    │   ├── solo-creative.yaml
    │   ├── small-business.yaml
    │   ├── agency.yaml
    │   └── enterprise.yaml
    └── design-system/
        ├── mercury.yaml        # Mercury-specific rules
        └── space-ds.yaml       # Space DS-specific rules
```

## 7. Integration with Current Architecture

### 7.1 Migration Path (Non-Breaking)

The existing adapter pattern continues working — we extract rules *from* adapters into YAML, not replace adapters.

**Phase 1: Extract** — Pull hardcoded rules from adapters into YAML files
- `PAGE_DESIGN_RULES` → `definitions/design-system/{ds}.yaml` (composition section)
- `SECTION_TYPE_GUIDANCE` → `definitions/global/section-guidance.yaml`
- `ANIMATION_GUIDANCE` / `VISUAL_STYLE_GUIDANCE` → `definitions/global/visual-defaults.yaml`
- Adapter `buildPromptAccessibilityRules()` → `definitions/global/accessibility.yaml`

**Phase 2: Layer** — Add industry and persona rules
- New YAML files in `definitions/industry/` and `definitions/persona/`
- These are net-new — no existing code changes

**Phase 3: Integrate** — Wire resolver into pipeline
- Prompt builders call `promptCompiler.compileFor*()` instead of directly calling adapter prompt methods
- Adapter methods become the *source* for design system layer rules but not the only source

### 7.2 Pipeline Integration Points

```
OnboardingData
     │
     ├─ industry ──────────┐
     ├─ persona (derived) ──┤
     ├─ designSystemId ─────┤──→ RuleResolver.resolve(context)
     ├─ generationMode ─────┤        │
     └─ designPreferences ──┘        ↓
                              ResolvedRuleset
                                     │
              ┌──────────────────────┼──────────────────────┐
              ↓                      ↓                      ↓
     Research Prompt          Plan Prompt           Generate Prompt
     compileForResearch()     compileForPlan()      compileForGenerate()
```

### 7.3 Adapter Relationship

Adapters remain responsible for:
- Component registry (manifest, roles, slots, props)
- Tree builders (Canvas component tree construction)
- Brand token processing
- Version management

The rule engine takes over:
- Page composition constraints (currently `PAGE_DESIGN_RULES`)
- Prompt fragment generation (currently `buildPrompt*()` methods)
- Visual guidance (currently hardcoded in prompt builders)
- Industry/persona-specific constraints (currently nonexistent)

```
Before:
  Adapter → buildPromptDesignGuidance() → prompt

After:
  Adapter.getDesignSystemRules() ─┐
  IndustryRules ──────────────────┤
  PersonaRules ───────────────────┤──→ Resolver → PromptCompiler → prompt
  GlobalRules ────────────────────┤
  ProjectRules ───────────────────┘
```

## 8. Data Model

### 8.1 Rule Types

```typescript
type RuleLayer = "global" | "design_system" | "industry" | "persona" | "project";

interface DesignRule {
  id: string;
  layer: RuleLayer;
  name: string;
  description: string;

  /** When does this rule apply? */
  appliesWhen: {
    industry?: string[];
    persona?: string[];
    designSystemId?: string[];
    generationMode?: ("design_system" | "code_components")[];
    pageType?: string[];
  };

  /** Rule categories */
  rules: Partial<DesignRuleCategories>;
}

interface DesignRuleCategories {
  composition: CompositionRules;
  content: ContentRules;
  visual: VisualRules;
  compliance: ComplianceRules;
  designSystem: DesignSystemRules;
  accessibility: AccessibilityRules;
  seo: SeoRules;
}
```

### 8.2 Resolved Output

```typescript
interface ResolvedCompositionRules {
  requiredSections: Array<{
    type: string;
    position: "above-fold" | "opening" | "middle" | "closing" | "any";
    reason: string;
  }>;
  avoidSections: Array<{ type: string; reason: string }>;
  sectionCountRange: Record<string, [number, number]>;
  heroPreferences: {
    prefer: string[];
    avoid: string[];
  };
  rhythm: {
    pattern: string;
    guidance: string;
  };
  closingPattern: string;
  compositionGuidance: string[];
}

interface ResolvedContentRules {
  toneConstraints: {
    require: string[];
    avoid: string[];
  };
  requiredElements: string[];
  wordCountMultiplier: number;
  ctaGuidance: string[];
}

interface ResolvedVisualRules {
  colorGuidance: string;
  imageGuidance: string;
  animationLevel: "none" | "subtle" | "moderate" | "dramatic";
  visualStyle: "minimal" | "bold" | "elegant" | "playful";
  interactivity: "static" | "scroll_effects" | "interactive";
  heroStyle: { prefer: string[]; avoid: string[] };
}
```

## 9. Example Rule Cascade

### Scenario: Photography portfolio using Mercury in code_components mode

**Layer 1 (Global)**:
```yaml
composition:
  requiredSections:
    - type: hero, position: opening
    - type: cta, position: closing
accessibility:
  contrast: WCAG-AA
  headingHierarchy: enforce
```

**Layer 2 (Design System — Mercury)**: *(skipped — code_components mode doesn't use DS composition rules)*

**Layer 3 (Industry — Portfolio/Creative)**:
```yaml
composition:
  requiredSections:
    - type: gallery, position: middle, reason: "Portfolio must showcase work"
    - type: about-artist, position: middle
  avoidSections:
    - type: pricing-grid, reason: "Creatives prefer inquiry-based pricing"
visual:
  imageGuidance: "Full-bleed, high-resolution portfolio images. Let the work speak."
  heroStyle:
    prefer: [fullscreen-image, video-background]
content:
  toneConstraints:
    require: [artistic, confident]
    avoid: [corporate, generic]
```

**Layer 4 (Persona — Solo Creative)**:
```yaml
composition:
  requiredSections:
    - type: personal-story, position: middle, reason: "Solo creatives sell themselves as much as their work"
  sectionCountRange:
    home: [5, 7]  # Lean, not overloaded
content:
  wordCountMultiplier: 0.8  # Less text, more visual
  ctaGuidance:
    - "Use 'Let's work together' over 'Contact us'"
    - "Include a direct email link, not just a form"
```

**Layer 5 (Project — from onboarding)**:
```yaml
visual:
  animationLevel: dramatic
  visualStyle: bold
  interactivity: scroll_effects
```

**Resolved Output**:
```yaml
composition:
  requiredSections:
    - type: hero, position: opening          # Global
    - type: gallery, position: middle        # Industry
    - type: about-artist, position: middle   # Industry
    - type: personal-story, position: middle # Persona
    - type: cta, position: closing           # Global
  avoidSections:
    - type: pricing-grid                     # Industry
  sectionCountRange:
    home: [5, 7]                             # Persona overrides Global
content:
  toneConstraints:
    require: [artistic, confident]           # Industry
    avoid: [corporate, generic]              # Industry
  wordCountMultiplier: 0.8                   # Persona
  ctaGuidance: ["Let's work together...", "Direct email link..."]  # Persona
visual:
  animationLevel: dramatic                   # Project
  visualStyle: bold                          # Project
  interactivity: scroll_effects              # Project
  imageGuidance: "Full-bleed, high-resolution..." # Industry
  heroStyle: { prefer: [fullscreen-image, video-background] }  # Industry
accessibility:
  contrast: WCAG-AA                          # Global
  headingHierarchy: enforce                  # Global
```

## 10. Persona Detection

Personas are **derived** from onboarding data, not explicitly selected by users.

```typescript
interface PersonaClassifier {
  classify(data: OnboardingData): PersonaId;
}

type PersonaId = "solo-creative" | "small-business" | "agency" | "enterprise";

// Classification heuristics:
// - solo-creative: portfolio/photography/art industry + small team size
// - small-business: local service industry + <10 pages
// - agency: design/marketing industry OR "agency" in business name
// - enterprise: >10 pages OR compliance flags OR enterprise keywords
```

This keeps onboarding friction low — users don't choose a "persona", the system infers it from what they've already told us.

## 11. Observability & Debugging

### 11.1 Rule Provenance Logging

Every generation logs its resolved ruleset with provenance:

```json
{
  "resolvedAt": "2026-03-31T10:00:00Z",
  "context": {
    "industry": "healthcare",
    "persona": "small-business",
    "designSystemId": "space_ds",
    "generationMode": "design_system"
  },
  "provenance": [
    { "rule": "requiredSection:trust-signals", "layer": "industry", "source": "industry/healthcare.yaml:12" },
    { "rule": "sectionCountRange:home", "layer": "industry", "source": "industry/healthcare.yaml:18" },
    { "rule": "contrast:WCAG-AA", "layer": "global", "source": "global/accessibility.yaml:3" }
  ]
}
```

### 11.2 Pipeline Transparency

The resolved ruleset is stored in `Site.pipelineArtifacts.rules` so the review page can show:
- "Your site was designed following healthcare best practices"
- "Includes trust signals above the fold (industry standard)"
- "HIPAA compliance notices included"

## 12. ADRs

### ADR-020: YAML over Database for Rule Definitions

**Context**: Rules could be stored in YAML files (code-managed) or in a database (runtime-managed).

**Options**:
1. **YAML files in repo** — version-controlled, reviewed via PR, deployed with code
2. **Database tables** — editable at runtime, admin UI, no deploy needed
3. **Hybrid** — YAML for base rules, database for project overrides

**Decision**: **Option 3 (Hybrid)**
- Layers 1-4 (global, DS, industry, persona) stored as YAML files — they change infrequently and benefit from code review
- Layer 5 (project) stored in database — per-site overrides that users control via onboarding

**Rationale**: Industry and persona rules require careful design and should be reviewed. Project-level overrides are user-driven and need runtime flexibility.

### ADR-021: Declarative Rules over Code

**Context**: Should rules be TypeScript functions (current approach) or declarative data?

**Decision**: **Declarative YAML** that compiles to prompt fragments.

**Rationale**:
- Declarative rules are easier to audit, diff, and review
- Non-engineers can contribute industry rules
- Rules don't need Turing-completeness — they describe constraints, not algorithms
- The existing `PAGE_DESIGN_RULES` are already quasi-declarative (typed objects) — YAML formalizes this

### ADR-022: Implicit Persona Classification

**Context**: Should users explicitly choose their persona, or should the system infer it?

**Decision**: **Implicit classification** from onboarding data.

**Rationale**:
- Adding another onboarding step increases drop-off
- Users don't self-identify as "small-business" vs "enterprise" — they describe their business
- Classification can improve over time without changing the onboarding UX
- Wrong classification is low-risk — persona rules are soft guidance, not hard constraints

### ADR-023: Rule Engine Replaces Adapter Prompt Methods (Phase 3)

**Context**: Should the rule engine supplement or replace adapter `buildPrompt*()` methods?

**Decision**: **Replace in Phase 3** — adapters contribute rules via `getDesignSystemRules()`, but the rule engine owns prompt compilation.

**Rationale**:
- Single responsibility — prompt compilation shouldn't be split between adapters and pipeline
- Enables cross-layer optimization (e.g., industry rule modifying DS rule)
- Adapters retain their core value: component registry, tree building, brand processing

**Risk**: Breaking existing prompt quality during migration. **Mitigation**: Run A/B comparison — generate with both old and new prompts, compare output quality before switching.

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Rule explosion — too many rules conflict | Unpredictable designs | Layer precedence is strict; provenance logging makes conflicts visible |
| Industry misclassification | Wrong rules applied | Use explicit `industry` from onboarding (user-selected), not guessed |
| Prompt bloat — too many rules → too long prompts | Slower, expensive, less focused AI | PromptCompiler has a budget; rules are ranked by relevance, lower-priority rules truncated |
| Migration breaks existing output quality | Regression | A/B testing before switching; feature flag to toggle rule engine vs legacy |
| YAML schema drift | Invalid rules loaded | Zod schema validation on load; CI validates all YAML files |

## 14. Implementation Phases

| Phase | Scope | Effort |
|---|---|---|
| **Phase 1: Foundation** | Types, resolver, YAML loader, schema validation | 1 sprint |
| **Phase 2: Extract** | Move existing hardcoded rules to YAML (global + DS layers) | 1 sprint |
| **Phase 3: Industry** | Write 8-10 industry rule files, integrate into pipeline | 1 sprint |
| **Phase 4: Persona** | Persona classifier + 4 persona rule files | 1 sprint |
| **Phase 5: Project** | Database-backed project rules, onboarding UI for overrides | 1-2 sprints |

Phase 1-2 are **zero-behavioral-change** — they refactor existing rules into the new system. Phase 3+ adds new capabilities.
