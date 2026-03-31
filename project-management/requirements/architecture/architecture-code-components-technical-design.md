# Technical Design: Code Component Pipeline Integration

**Date:** 2026-03-30
**Status:** Draft
**Parent:** architecture-code-components.md (ADRs and high-level design)
**Milestone:** M26 — Code Component Generation
**Stories:** US-098 through US-105

---

## 1. Purpose

This document bridges the gap between the high-level ADRs in `architecture-code-components.md` and the actual codebase. It maps each M26 user story to concrete code changes, specifying file-level modifications, new interfaces, and data flow through the existing pipeline.

---

## 2. Current Pipeline Architecture

```
orchestrator.ts
  ├── runResearchPhase()  → ResearchBrief     (industry, audience, keywords)
  ├── runPlanPhase()      → ContentPlan        (pages, sections, briefs)
  ├── runGeneratePhase()  → BlueprintBundle    (pages with component_tree[])
  └── runEnhancePhase()   → Enhanced blueprint (stock images injected)
```

**Key observations:**
- The orchestrator is phase-agnostic — each phase returns a typed result
- Generate phase loops over `plan.pages[]` → AI call per page → validates sections against SDC manifest → builds component tree
- Component trees are built by `component-tree-builder.ts` which delegates to the active `DesignSystemAdapter`
- Enhance phase parses SDC component props to inject image URLs
- Blueprint is saved to Prisma (`blueprint.payload` JSON column)

---

## 3. Integration Strategy

### 3.1 Principle: Branch, Don't Fork

Per ADR-1, we branch the Generate phase on `generationMode` rather than creating a parallel pipeline. Research and Plan phases remain shared.

```
orchestrator.ts (unchanged)
  ├── runResearchPhase()     ← identical for both modes
  ├── runPlanPhase()         ← identical for both modes
  ├── runGeneratePhase()     ← BRANCHES on data.generationMode
  │     ├── "design_system" → existing SDC path (no changes)
  │     └── "code_components" → NEW code component generation path
  └── runEnhancePhase()      ← BRANCHES for image injection method
```

### 3.2 What Stays the Same

| Component | Changes? | Reason |
|-----------|----------|--------|
| `orchestrator.ts` | No | Phase-agnostic — just calls phases in order |
| `phases/research.ts` | No | Industry/audience analysis is mode-independent |
| `phases/plan.ts` | No | Page/section planning is mode-independent |
| `phases/review.ts` | Minor | Add code component quality checks |
| `component-tree-builder.ts` | No | Code components bypass this entirely |
| `DesignSystemAdapter` interface | No | SDC path unchanged |

---

## 4. Detailed Design by User Story

### 4.1 US-098: Design Approach Selection — COMPLETE (Sprint 53)

**Status:** Implemented in TASK-500.

**What was done:**
- `generationMode` field added to `OnboardingData` type and Prisma schema
- `designPreferences` (animationLevel, visualStyle, interactivity) type defined
- Style onboarding step presents two options with persistence

**Open item (BUG-053-001):** Industry-based defaults not implemented — always defaults to `design_system`. Low priority.

---

### 4.2 US-099: Type System & Config Builder — COMPLETE (Sprint 53)

**Status:** Implemented in TASK-501.

**What was done:**
- `CodeComponentOutput`, `SectionDesignBrief`, `CodeComponentGenerator` interface in `code-components/types.ts`
- `buildConfigYaml()` in `code-components/config-builder.ts` — produces `canvas.js_component.*.yml`
- `wrapAsCanvasTreeNode()` — creates `ComponentTreeItem` with `js.[machineName]` component_id
- 20 unit tests passing

---

### 4.3 US-100: Validation Pipeline — COMPLETE (Sprint 53)

**Status:** Implemented in TASK-502.

**What was done:**
- `validator.ts` with 5 rule categories: structure, a11y, motion-safety, security, CSS
- Returns `ValidationResult` with structured errors for LLM retry
- 23 unit tests passing

---

### 4.4 US-101: Designer Agent (TASK-503)

**Sprint:** 54 (Pending)

#### 4.4.1 New File: `platform-app/src/lib/code-components/designer-agent.ts`

**Responsibilities:**
- Accept a `SectionDesignBrief`
- Build a system prompt for JSX/Tailwind generation
- Call the AI provider (Claude/GPT-4) with structured output
- Validate the output via the validator
- Retry on validation failure (max 2 retries with error feedback)
- Return `CodeComponentOutput`

**Interface:**

```typescript
import type { SectionDesignBrief, CodeComponentOutput } from "./types";

export interface DesignerAgentOptions {
  /** AI provider to use. Defaults to "generate" provider from factory. */
  providerKey?: string;
  /** Max retries on validation failure. Default: 2. */
  maxRetries?: number;
}

/**
 * Generate a single code component from a section design brief.
 * Calls the AI provider with a specialized system prompt,
 * validates output, and retries on failure.
 */
export async function generateCodeComponent(
  brief: SectionDesignBrief,
  options?: DesignerAgentOptions
): Promise<CodeComponentOutput>;
```

**AI Output Schema (Zod):**

```typescript
const CodeComponentResponseSchema = z.object({
  machineName: z.string().regex(/^[a-z][a-z0-9_]*$/),
  name: z.string(),
  jsx: z.string(),
  css: z.string(),
  props: z.array(z.object({
    name: z.string(),
    type: z.enum(["string", "formatted_text", "boolean", "integer", "number", "link", "image", "video"]),
    required: z.boolean(),
    default: z.unknown().optional(),
    description: z.string().optional(),
  })),
  slots: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
  })).optional(),
});
```

**System Prompt Strategy:**

The prompt must guide the LLM to produce self-contained React/Preact components using Tailwind CSS v4. Key constraints:

1. **Available utilities:** `cn()`, `clsx`, `cva`, `tailwind-merge`, `FormattedText`
2. **Must export default** — Canvas requires a default export
3. **Props as function parameters** — destructured from component props
4. **Tailwind only** — no raw CSS, no external stylesheets
5. **Brand tokens** — injected as CSS custom properties (`--color-primary`, `--font-heading`, etc.)
6. **Responsive** — mobile-first with Tailwind breakpoints (`sm:`, `md:`, `lg:`)
7. **Animation** — Tailwind animations with `motion-reduce:` variants
8. **Image placeholders** — use `<img src="/placeholder/WxH" alt="descriptive text" />`
9. **No external dependencies** — no fetch, no CDN, no imports beyond pre-installed utils

**Retry flow:**

```
Attempt 1: Generate → Validate
  ├── Valid → return output
  └── Invalid → extract error messages
       ↓
Attempt 2: Generate with error feedback appended → Validate
  ├── Valid → return output
  └── Invalid → extract error messages
       ↓
Attempt 3: Generate with cumulative feedback → Validate
  ├── Valid → return output
  └── Invalid → throw DesignerAgentError (graceful failure)
```

#### 4.4.2 New File: `platform-app/src/lib/ai/prompts/code-component-generation.ts`

**Responsibilities:**
- Build the system prompt and user prompt for code component generation
- Accept `SectionDesignBrief` and return prompt strings
- Include few-shot examples for common section types (hero, features, CTA, testimonials)

**Key design decision:** The prompt includes 2-3 few-shot examples per section type category. Examples are stored as string constants, not loaded from files, to avoid filesystem I/O during generation.

**Section type categories for prompt examples:**
| Category | Types | Example Focus |
|----------|-------|---------------|
| Hero | hero, banner | Full-width, animated entrance, gradient overlay |
| Content | features, services, about | Grid layouts, icon cards, alternating sections |
| Social proof | testimonials, team, gallery | Card grids, carousel patterns, avatar layouts |
| Action | CTA, contact, FAQ | Prominent buttons, accordion, form-adjacent |

---

### 4.5 US-102: Dual-Mode Pipeline Branching (TASK-504)

**Sprint:** 54 (Pending)

#### 4.5.1 Modified File: `platform-app/src/lib/pipeline/phases/generate.ts`

**Change:** Add a mode branch at the top of `runGeneratePhase()`.

```typescript
export async function runGeneratePhase(
  siteId: string,
  data: OnboardingData,
  research: ResearchBrief,
  plan: ContentPlan,
  onProgress?: GenerateProgressCallback
): Promise<GeneratePhaseResult> {
  // NEW: Branch on generation mode
  if (data.generationMode === "code_components") {
    return runCodeComponentGeneratePhase(siteId, data, research, plan, onProgress);
  }

  // Existing SDC generation path (unchanged)
  const startTime = Date.now();
  // ... rest of current code
}
```

#### 4.5.2 New File: `platform-app/src/lib/pipeline/phases/generate-code-components.ts`

**Responsibilities:**
- Iterate over `plan.pages[]` (same as SDC path)
- For each section in each page, call `generateCodeComponent(brief)`
- Accumulate `CodeComponentOutput[]` alongside page data
- Build Canvas tree items using `wrapAsCanvasTreeNode()` for each code component
- Generate header and footer as code components
- Assemble `BlueprintBundle` with `_codeComponents` metadata

**Data flow per page:**

```
planPage.sections[]
  → Build SectionDesignBrief for each section
    (heading, contentBrief, sectionType from plan)
    (brandTokens, toneGuidance from research)
    (animationLevel, visualStyle from data.designPreferences)
  → generateCodeComponent(brief) for each section
  → wrapAsCanvasTreeNode(output) → ComponentTreeItem[]
  → Assemble PageLayout with component_tree
```

**Progress messages:**

```typescript
await onProgress(`Designing ${section.type} section...`, pageIndex, totalPages);
```

**Blueprint payload additions:**

```typescript
interface BlueprintBundle {
  // ... existing fields
  _codeComponents?: {
    configs: Record<string, string>;  // machineName → YAML string
    metadata: Array<{
      machineName: string;
      sectionType: string;
      pageSlug: string;
      generatedAt: string;
      validationScore: number;
    }>;
  };
}
```

**Key design decision:** Code component YAML configs are stored in the blueprint payload (not as separate files). The provisioning engine reads them from the blueprint JSON, same as all other data.

#### 4.5.3 Header & Footer Generation

**Problem:** The current `buildHeaderTree()` and `buildFooterTree()` produce SDC-specific component trees using adapter methods. Code component mode needs custom header/footer.

**Solution:** The Designer Agent generates header and footer components using specialized briefs:

```typescript
// Header brief
const headerBrief: SectionDesignBrief = {
  heading: data.name,
  contentBrief: `Site header with logo, navigation menu (${pages.map(p => p.title).join(', ')}), and CTA button`,
  sectionType: "header",
  position: 0,
  brandTokens: { ... },
  toneGuidance: research.toneGuidance.primary,
  animationLevel: prefs.animationLevel,
  visualStyle: prefs.visualStyle,
};

const headerOutput = await generateCodeComponent(headerBrief);
const headerTree = [wrapAsCanvasTreeNode(headerOutput)];
```

---

### 4.6 US-103: Image Enhancement for Code Components (TASK-505)

**Sprint:** 55 (Pending)

#### 4.6.1 Modified File: `platform-app/src/lib/pipeline/phases/enhance.ts`

**Change:** Add code component image resolution after existing SDC enhancement.

**Current enhance flow (SDC):**
1. For each section, match image props to stock photos
2. Inject image URLs into component tree node inputs
3. Rebuild component trees

**New enhance flow (Code Components):**
1. Detect code component sections (component_id starts with `js.`)
2. Parse JSX string for `<img src="/placeholder/WxH"` patterns
3. Extract context from `alt` attribute text
4. Resolve stock images using existing Pexels/Unsplash API
5. String-replace placeholder URLs in the JSX source
6. Update the `_codeComponents.configs[machineName]` YAML with new JSX

**JSX image parser:**

```typescript
interface PlaceholderImage {
  fullMatch: string;        // src="/placeholder/1920x800"
  width: number;
  height: number;
  altText: string;          // from nearest alt attribute
  contextHint: string;      // from surrounding text content
}

function extractPlaceholderImages(jsx: string): PlaceholderImage[];
function replacePlaceholderImages(
  jsx: string,
  replacements: Map<string, string>  // placeholder URL → stock URL
): string;
```

**Tailwind background images:**
Also detect `bg-[url('/placeholder/...')]` patterns in Tailwind classes within JSX.

---

### 4.7 US-104: Provisioning to Drupal Canvas (TASK-506)

**Sprint:** 55 (Pending)

#### 4.7.1 Where Provisioning Happens

The provisioning engine is a separate Node.js process in `/provisioning/src/`. It reads `blueprint.json` from a shared volume and executes Drush commands against a Drupal site.

**Current Step 8 (import-blueprint):**
- Creates Drupal page nodes
- Builds Canvas component trees from SDC component IDs
- Creates component instances in Canvas storage

#### 4.7.2 New: Code Component Config Import

**Before** the page import step, we need to create the Code Component config entities:

```
Step 7.5 (NEW): Import Code Component configs
  → Read blueprint._codeComponents.configs
  → For each config YAML:
    → Write to /tmp/config-import/canvas.js_component.{name}.yml
    → Run: drush config:import --source=/tmp/config-import --partial
  → Verify: drush config:get canvas.js_component.{name} status
```

**Why config sync (not Entity API):**
- Config sync is idempotent — re-running import is safe
- Matches existing provisioning pattern (config-based)
- Canvas Code Components are config entities by design
- No custom PHP code needed

**Partial import flag:** We use `--partial` to import only the code component configs without disturbing the rest of the site config.

#### 4.7.3 Component Tree Compatibility

Code component tree nodes use the same `canvas.component_tree_node` schema as SDC components:

```yaml
# SDC node
- uuid: "abc-123"
  component_id: "sdc.mercury.hero_billboard"
  inputs: { ... }

# Code Component node (same structure)
- uuid: "def-456"
  component_id: "js.hero_section_a7x"
  inputs: { ... }
```

**Canvas handles the rendering difference internally** — no special handling needed in the tree structure.

---

### 4.8 US-105: Review Editor Preview (TASK-507)

**Sprint:** 55 (Pending)

#### 4.8.1 Review Page Changes

**Current behavior:** The review page renders `PagePreview` which shows an approximation of the SDC component tree.

**New behavior for code components:**
1. Detect code component sections (component_id starts with `js.`)
2. Render a sandboxed preview using an iframe with the JSX rendered via a lightweight React renderer
3. Optionally show a "View Code" toggle for JSX syntax highlighting
4. Regeneration button calls the Designer Agent for that section's brief

**Approach options:**

| Option | Pros | Cons |
|--------|------|------|
| A. iframe sandbox with React renderer | Accurate visual preview | Complex, needs bundler in browser |
| B. Static HTML render (server-side) | Simple, fast | May not match Preact rendering exactly |
| C. Code-only view with syntax highlighting | Simplest to implement | No visual preview, poor UX |
| D. Hybrid: code view + "Preview" button | Balanced effort/UX | Two modes to maintain |

**Recommendation: Option D (hybrid).** Default to syntax-highlighted code view, with a "Preview" button that renders in an iframe. This is the fastest to implement while still providing visual feedback.

**Syntax highlighting:** Use `prism-react-renderer` (lightweight, already common in Next.js projects). Add as a dev dependency.

---

## 5. Data Architecture Changes

### 5.1 BlueprintBundle Extensions

```typescript
interface BlueprintBundle {
  // ... all existing fields unchanged

  /** Code component configs for provisioning. Present only in code_components mode. */
  _codeComponents?: {
    /** machineName → YAML config string for Drupal import */
    configs: Record<string, string>;
    /** Generation metadata for each code component */
    metadata: Array<{
      machineName: string;
      name: string;
      sectionType: string;
      pageSlug: string;
      generatedAt: string;
    }>;
  };
}
```

### 5.2 PageSection._meta Extensions

```typescript
interface SectionMeta {
  // ... existing fields (imageSource, imageMatchScore, contentBrief, targetKeywords)

  /** Present on code component sections */
  codeComponent?: {
    machineName: string;
    generatedAt: string;
    validationPassed: boolean;
    retryCount: number;
  };
}
```

### 5.3 No Database Schema Changes

All code component data lives inside the `blueprint.payload` JSON column. No new Prisma columns needed for Sprints 54-55. The `generationMode` and `designPreferences` columns were added in Sprint 53.

---

## 6. Error Handling & Resilience

### 6.1 Designer Agent Failures

| Failure | Handling | User Impact |
|---------|----------|-------------|
| LLM timeout | Retry with reduced token budget | Progress bar stalls, then resumes |
| Validation failure (all retries) | Skip section, use fallback | Missing section logged; user can regenerate in review |
| API rate limit | Exponential backoff (up to 30s) | Slower generation |

**Fallback behavior:** If a section's code component generation fails after all retries, the section is omitted from the page and an entry is added to `_codeComponents.metadata` with `status: "failed"`. The review editor shows a "Generation failed — click to retry" placeholder.

### 6.2 Provisioning Failures

| Failure | Handling |
|---------|----------|
| Config import fails for one component | Log error, continue with remaining components |
| Canvas can't compile JSX | Log compilation error, component renders as error boundary |
| Mixed SDC+Code page rendering | Canvas handles natively (verified in spike) |

---

## 7. Performance Considerations

### 7.1 Token Budget

| Mode | Tokens per section | Sections per page | Pages | Total per site |
|------|-------------------|-------------------|-------|----------------|
| SDC | ~2,000 (props only) | 5-8 | 5-6 | 50K-96K |
| Code Components | ~4,000-6,000 (full JSX) | 5-8 | 5-6 | 100K-288K |

**Mitigation:** Code component generation is 2-3x more expensive. Accept this for MVP — optimize later with:
- Section-type caching (reuse similar hero patterns)
- Parallel section generation (currently sequential)
- Smaller models for simpler sections (FAQ, CTA)

### 7.2 Generation Time

SDC mode takes ~2-3 minutes. Code component mode will take ~4-6 minutes due to:
- Per-section AI calls (vs. per-page in SDC mode)
- Validation + potential retries
- More complex prompts

**Mitigation:** Progress UI already supports per-section updates. Users see "Designing hero section...", "Creating features layout..." etc.

---

## 8. Testing Strategy

### 8.1 Unit Tests (existing pattern)

| Component | Test File | Coverage |
|-----------|-----------|----------|
| Designer Agent | `__tests__/designer-agent.test.ts` | Mock AI responses, verify validation loop, error handling |
| Code Component Generate Phase | `__tests__/generate-code-components.test.ts` | Mock designer agent, verify blueprint assembly |
| JSX Image Parser | `__tests__/enhance-code-components.test.ts` | Placeholder detection, URL replacement |

### 8.2 Integration Tests

- **SDC regression:** Run existing generate tests to verify SDC path unchanged
- **Mode branching:** Test that `generationMode` flag correctly routes to the right generate function
- **Blueprint structure:** Verify `_codeComponents` section present in code mode blueprint

---

## 9. File Change Summary

### Sprint 54 (TASK-503, TASK-504)

| Action | File | Story |
|--------|------|-------|
| **Create** | `src/lib/code-components/designer-agent.ts` | US-101 |
| **Create** | `src/lib/ai/prompts/code-component-generation.ts` | US-101 |
| **Create** | `src/lib/pipeline/phases/generate-code-components.ts` | US-102 |
| **Modify** | `src/lib/pipeline/phases/generate.ts` (add mode branch) | US-102 |
| **Modify** | `src/lib/blueprint/types.ts` (add `_codeComponents` to BlueprintBundle) | US-102 |
| **Create** | `src/lib/code-components/__tests__/designer-agent.test.ts` | US-101 |

### Sprint 55 (TASK-505, TASK-506, TASK-507)

| Action | File | Story |
|--------|------|-------|
| **Modify** | `src/lib/pipeline/phases/enhance.ts` (add JSX image parsing) | US-103 |
| **Create** | `src/lib/code-components/image-parser.ts` | US-103 |
| **Modify** | `provisioning/src/steps/` (add code component config import step) | US-104 |
| **Modify** | `src/app/onboarding/review/components/PagePreview.tsx` | US-105 |
| **Create** | `src/app/onboarding/review/components/CodeComponentPreview.tsx` | US-105 |

---

## 10. Resolved Open Questions

From `architecture-code-components.md` Section 12:

| # | Question | Resolution |
|---|----------|------------|
| 1 | Canvas Code Component API support for programmatic creation? | **Yes** — config sync via `drush cim --partial` (spike confirmed) |
| 2 | Should generated JS be allowed? | **Yes, with restrictions** — validator blocks eval, fetch, DOM access. Only Tailwind animations + React state. |
| 3 | Can SDC and Code Components coexist on same page? | **Yes** — same `canvas.component_tree_node` schema (spike confirmed) |
| 4 | Token cost per section? | ~4,000-6,000 tokens for code components vs ~2,000 for SDC. 2-3x more expensive. |
| 5 | Should Designer Agent use reference designs? | **Deferred** — use few-shot examples in prompts for MVP. Gallery/screenshot input is post-MVP. |

---

*Next step: Invoke `/drupal-architect` to break Sprint 54 stories into implementation-ready task specs, or `/dev TASK-503` to begin Designer Agent implementation.*
