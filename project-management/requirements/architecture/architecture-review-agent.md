# Architecture: Content Depth Enforcement & Quality Review Agent

**Date:** 2026-03-20
**Sprint:** 18
**Requirement:** REQ-content-depth-and-review-agent

---

## 1. System Context

The review agent sits between the Generate phase and blueprint persistence in the existing Research → Plan → Generate pipeline. It adds two validation gates:

```
┌──────────┐     ┌──────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────┐
│ Research  │ ──► │   Plan   │ ──► │   Generate    │ ──► │ Review Agent │ ──► │  Save BP │
│  Phase    │     │  Phase   │     │   Phase       │     │  (per page)  │     │  to DB   │
└──────────┘     └──────────┘     └───────────────┘     └──────────────┘     └──────────┘
                       │                   │                     │
                  ┌────▼────┐        ┌─────▼─────┐        ┌─────▼─────┐
                  │  Plan   │        │   Prop    │        │  Content  │
                  │Validator│        │ Validator │        │  Review   │
                  │ (NEW)   │        │(existing) │        │  (NEW)    │
                  └─────────┘        └───────────┘        └───────────┘
```

### Key constraint
Both new validators are **deterministic pure functions** — no AI calls, no database access, no side effects. They evaluate output against known rules and return structured results.

---

## 2. Architecture Decisions

### ADR-010: Review Agent as Pure Function, Not AI Agent

**Context:** The PRD proposes a "review agent." This could be implemented as another AI call (ask an LLM to evaluate quality) or as deterministic rule evaluation.

**Options:**
| Option | Pros | Cons |
|--------|------|------|
| A. AI-based reviewer | Nuanced quality assessment, can catch subtle issues | +3-5s latency per page, non-deterministic, hallucination risk, higher cost |
| B. Deterministic rules | Fast (<50ms), predictable, testable, no cost | Can't catch nuanced quality issues, rigid |
| C. Hybrid (rules + AI for edge cases) | Best of both | Complexity, harder to test, partial latency hit |

**Decision:** Option B — deterministic rules.

**Rationale:**
- The checks are well-defined (section counts, word counts, keyword presence) — no ambiguity requiring AI judgment
- Deterministic means fully testable with unit tests
- Zero additional AI cost or latency on the happy path
- Aligns with the existing `component-validator.ts` pattern which is proven and reliable
- If we later need nuanced review (tone quality, content coherence), we can add an optional AI pass as a future enhancement

### ADR-011: Two-Stage Validation in Generate Loop

**Context:** The generate loop already has a prop validation retry (max 2 retries). Adding content review creates a question: one combined retry loop or two separate loops?

**Options:**
| Option | Pros | Cons |
|--------|------|------|
| A. Single combined loop | Simpler control flow | Prop errors and content issues are different problems; mixing feedback confuses the AI |
| B. Two sequential stages | Each retry is focused on one problem class | More complex control flow, theoretical max of 4 retries per page |
| C. Nested loops | Most retries, most thorough | Exponential worst case (2×2=4 retries), excessive |

**Decision:** Option B — two sequential stages.

```
For each page:
  Stage 1: Generate → Prop Validate → Retry (max 2) → Sanitize
  Stage 2: Content Review → Retry (max 2) → Best-of selection
```

**Rationale:**
- Prop validation fixes structural issues (wrong props, missing required fields). Content review fixes depth/quality issues (too few sections, missing keywords). These are orthogonal concerns.
- Stage 1 retries include prop-specific feedback. Stage 2 retries include content-specific feedback. Mixing them would dilute the signal.
- Worst case is 4 retries per page (~20 seconds). This is acceptable for a background process and is capped.
- Stage 1 must pass before Stage 2 runs (no point reviewing content depth if props are invalid).

### ADR-012: Plan Validation as Gate, Not Loop

**Context:** Should plan validation retry indefinitely until all pages meet minimums?

**Decision:** Max 1 retry. If the second plan still fails, use it with a warning.

**Rationale:**
- The plan is a single AI call that produces ALL pages at once. Retrying regenerates the entire plan, not just the failing page.
- With strengthened prompt language (TASK-287), first-pass success should be high.
- The generate phase review agent catches depth issues too — defense in depth means the plan gate doesn't need to be the only line of defense.

---

## 3. Component Architecture

### 3.1 Plan Depth Validator

**Location:** `platform-app/src/lib/pipeline/phases/plan.ts` (inline, not a separate file)

```typescript
interface PlanValidationResult {
  valid: boolean;
  feedback: string[];  // Per-page feedback for retry prompt
}

function validatePlanDepth(plan: ContentPlan): PlanValidationResult
```

**Logic:**
1. For each page in `plan.pages`:
   - Classify page type via `classifyPageType(page.slug, page.title)`
   - Get minimum from `getRule(pageType).sectionCountRange[0]`
   - Compare `page.sections.length` against minimum
   - Check that all `required: true` section types exist in the plan
2. Return feedback strings for failing pages

**Integration point:** Called after `generateValidatedJSON()` in `runPlanPhase()`. If invalid, rebuild prompt with feedback appended and call AI again.

### 3.2 Content Review Agent

**Location:** `platform-app/src/lib/pipeline/phases/review.ts` (new file)

```typescript
// ---- Input types ----
interface ReviewInput {
  page: PageLayout;                    // Generated page with sections + props
  planPage: ContentPlanPage;           // Planned page with targetKeywords, section briefs
  research: ResearchBrief;             // Industry, audience, key messages
  sitePages?: Array<{ slug: string; sections: PageSection[] }>;  // Other pages (for FAQ check)
}

// ---- Output types ----
interface ReviewCheck {
  name: string;           // e.g., "section-count", "meta-title-length"
  dimension: "depth" | "seo" | "geo";
  passed: boolean;
  severity: "error" | "warning";  // errors block, warnings don't
  message: string;        // Human-readable description
  fix?: string;           // Actionable fix instruction for retry prompt
}

interface ReviewResult {
  passed: boolean;        // true if no errors (warnings are OK)
  score: number;          // 0.0 - 1.0 (proportion of checks passed)
  checks: ReviewCheck[];
  feedback: string;       // Formatted retry prompt feedback (only if failed)
}

// ---- Main function ----
function reviewPage(input: ReviewInput): ReviewResult
```

**Check catalog:**

| # | Check Name | Dimension | Severity | What it checks |
|---|-----------|-----------|----------|----------------|
| 1 | `section-count` | depth | error | sections.length >= pageType minimum |
| 2 | `section-word-count` | depth | warning | Each section's prop text meets wordCountRange[0] |
| 3 | `total-word-count` | depth | error | Total page words >= threshold (Home:400, Services:350, About:350) |
| 4 | `no-placeholders` | depth | error | No generic text detected in props |
| 5 | `visual-rhythm` | depth | warning | No consecutive identical component_ids |
| 6 | `required-sections` | depth | error | All required section types from rule are present |
| 7 | `meta-title-length` | seo | warning | 50-60 chars |
| 8 | `meta-title-keyword` | seo | warning | Contains at least one target keyword |
| 9 | `meta-desc-length` | seo | warning | 150-160 chars |
| 10 | `meta-desc-keyword` | seo | warning | Contains at least one target keyword |
| 11 | `hero-heading` | seo | error | Hero section has non-empty title prop |
| 12 | `keyword-distribution` | seo | warning | Target keywords in 2+ sections |
| 13 | `cta-internal-links` | seo | warning | CTA props reference internal paths |
| 14 | `entity-clarity` | geo | warning | Business name + industry in content |
| 15 | `structured-claims` | geo | warning | At least 1 numeric claim per content page |
| 16 | `faq-presence` | geo | warning | At least one site page has accordion component |
| 17 | `authoritative-voice` | geo | warning | "we"/"our" present in content |

**Severity model:**
- `error` → page fails review, triggers retry
- `warning` → logged and scored, does NOT trigger retry

This means only checks 1, 3, 4, 6, and 11 can trigger a retry. SEO and GEO checks are advisory.

### 3.3 Word Count Estimation

Counting words in component props is non-trivial because props vary by type:

```typescript
function estimateWordCount(props: Record<string, unknown>): number {
  let words = 0;
  for (const value of Object.values(props)) {
    if (typeof value === "string") {
      words += value.split(/\s+/).filter(Boolean).length;
    }
  }
  return words;
}
```

This counts words in all string props. It ignores enum props, booleans, and nested objects (images). This is an approximation but sufficient for a quality gate — we're checking "is this section substantive?" not "does it meet an exact word count."

### 3.4 Placeholder Detection

```typescript
const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /your (business|company|brand) (here|name)/i,
  /\[.*\]/,                    // [placeholder brackets]
  /^(learn more|get started|click here|read more)$/i,  // Generic CTAs (exact match only)
  /example\.com/i,
  /placeholder/i,
  /TODO/,
];
```

Checked against all string prop values. Any match → `no-placeholders` check fails.

---

## 4. Data Flow

### 4.1 Plan Phase (modified)

```
buildPlanPrompt(data, research)
  → generateValidatedJSON(prompt, ContentPlanSchema)
  → validatePlanDepth(plan)
  → IF invalid:
      append feedback to prompt
      → generateValidatedJSON(prompt + feedback, ContentPlanSchema)
      → validatePlanDepth(plan)  // log result, use regardless
  → store plan in DB
```

### 4.2 Generate Phase (modified)

```
For each planPage:
  prompt = buildPageGenerationPrompt(planPage, data, research, plan)
  maxTokens = calculateTokenBudget(planPage.sections.length)

  // Stage 1: Prop Validation (existing)
  for attempt in 0..2:
    generated = generateValidatedJSON(prompt, PageLayoutSchema, { maxTokens })
    sections = parsePropsJson(generated.sections)
    propResult = validateSections(sections)
    if propResult.valid: break
    prompt += propValidationFeedback

  // Stage 2: Content Review (NEW)
  bestAttempt = { page, score: 0 }
  for attempt in 0..2:
    reviewResult = reviewPage({ page, planPage, research, sitePages })
    if reviewResult.score > bestAttempt.score:
      bestAttempt = { page, score: reviewResult.score }
    if reviewResult.passed: break
    prompt += reviewResult.feedback
    // Regenerate page
    generated = generateValidatedJSON(prompt, PageLayoutSchema, { maxTokens })
    sections = parsePropsJson(generated.sections)
    sections = validateSections(sections).sanitizedSections
    page = buildPage(sections, generated)

  // Use best attempt
  finalPage = reviewResult.passed ? page : bestAttempt.page
  pages.push(finalPage)
```

### 4.3 Token Budget Calculation

```typescript
function calculateTokenBudget(sectionCount: number): number {
  const base = 4000;
  const perExtraSection = 500;
  const extra = Math.max(0, sectionCount - 3) * perExtraSection;
  return Math.min(base + extra, 8000);
}
```

| Sections | Budget |
|----------|--------|
| 2-3 | 4000 |
| 4 | 4500 |
| 5 | 5000 |
| 6 | 5500 |
| 7 | 6000 |

---

## 5. Performance Impact Analysis

### Happy path (page passes first attempt)
- Plan validation: <1ms (array length checks)
- Content review per page: <5ms (string operations)
- **Total overhead: <25ms for a 5-page site**

### Retry path (1 page fails)
- Plan retry: +3-5 seconds (full AI call)
- Page content retry: +5-8 seconds (full AI call + re-validation)
- **Worst case total: +15-20 seconds**

### Maximum theoretical cost
- Plan: 1 retry = +1 AI call
- Per page: 2 prop retries + 2 content retries = +4 AI calls
- 5-page site worst case: 1 + (5 × 4) = 21 AI calls
- This is extreme and unlikely. Typical: 0-2 retries across all pages.

---

## 6. Testing Strategy

### Unit tests for review agent (`platform-app/tests/review-agent.test.ts`)

Each check gets a passing and failing test case:

```typescript
// Depth checks
test("section-count: PASS when Home has 5 sections")
test("section-count: FAIL when Home has 2 sections")
test("total-word-count: PASS when Home has 450 words")
test("total-word-count: FAIL when Home has 200 words")
test("no-placeholders: FAIL when props contain 'Lorem ipsum'")
test("required-sections: FAIL when Home missing CTA")
test("visual-rhythm: WARN when consecutive identical components")

// SEO checks
test("meta-title-length: WARN when title is 80 chars")
test("meta-title-keyword: WARN when no keyword in title")
test("hero-heading: FAIL when hero has empty title")

// GEO checks
test("entity-clarity: WARN when business name not in content")
test("faq-presence: WARN when no page has accordion component")

// Integration
test("reviewPage returns PASS for well-formed Home page")
test("reviewPage returns FAIL with actionable feedback for thin page")
test("feedback format is suitable for prompt injection")
```

### Integration tests (in sprint QA)
- Generate restaurant site → verify Home has 5+ sections
- Generate law firm → verify all pages meet minimums
- Generate dental clinic → verify SEO checks produce meaningful scores

---

## 7. File Change Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/ai/prompts/plan.ts` | Modify | Stronger constraint language |
| `src/lib/ai/page-design-rules.ts` | Modify | `formatRulesForPlan()` outputs hard requirements |
| `src/lib/pipeline/phases/plan.ts` | Modify | Add `validatePlanDepth()` + retry logic |
| `src/lib/pipeline/phases/generate.ts` | Modify | Token budget scaling + review integration |
| `src/lib/pipeline/phases/review.ts` | **New** | Review agent (17 checks across 3 dimensions) |
| `tests/review-agent.test.ts` | **New** | Unit tests for all review checks |

**Total estimated LOC:** ~350-400 (review.ts ~250, plan validation ~50, generate changes ~50, tests ~200)

---

## 8. Future Enhancements (Not in Sprint 18)

1. **AI-based tone review** — Use a lightweight LLM call to evaluate tone consistency (requires ADR-010 to be revisited)
2. **Per-section retry** — Instead of regenerating entire pages, regenerate only failing sections
3. **Review dashboard** — Surface review scores in the platform UI for transparency
4. **A/B testing** — Generate two variants, review agent picks the higher-scoring one

---

## Handoff

This architecture is implementation-ready. The existing patterns (`component-validator.ts` for validation, retry loop in `generate.ts`) provide clear templates.

- **`/dev TASK-287`** to start with Phase 1 quick wins
- **`/dev TASK-290`** to start the review agent core (can also start on Day 1 if team has capacity)
