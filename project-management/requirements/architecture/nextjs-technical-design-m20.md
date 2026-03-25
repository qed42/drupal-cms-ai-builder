# Next.js Technical Design: M20 — Transparent AI Onboarding

**Author:** Next.js & Frontend Architect
**Date:** 2026-03-25
**Scope:** US-064 → US-073, Sprints 34-37

---

## 1. Route Architecture

No new routes. All features integrate into existing pages:

```
/onboarding/
  idea/page.tsx          ← F1: InferenceCard via insightSlot
  audience/page.tsx      ← F1: InferenceCard via insightSlot
  tone/page.tsx          ← F1: InferenceCard via insightSlot
  review-settings/page.tsx ← F2: StrategyPreview panel
  progress/page.tsx      ← F3: enriched PipelineProgress
  review/page.tsx        ← F4: SectionInsight + PageInsights
/dashboard/page.tsx      ← F5: ImpactSummary on SiteCard
```

**Loading/Error boundaries:** No new boundaries needed. The StrategyPreview (F2) manages its own loading/error states internally since it's a non-blocking panel within an existing page.

---

## 2. Component Architecture

### 2.1 Component Tree (new components in **bold**)

```
StepLayout (existing)
  ├── insightSlot → **InferenceCard** (F1)       ← "use client" (interaction)
  └── children (form content, unchanged)

ReviewSettingsPage (existing, "use client")
  ├── input summary (existing)
  └── **StrategyPreview** (F2)                    ← "use client" (fetch + expand/collapse)
        └── **StrategyPreviewSkeleton** (F2)      ← server-compatible (pure presentation)

ProgressPage (existing, "use client")
  └── PipelineProgress (existing, modified)
        └── PhaseCard (existing, enriched summaries)

ReviewPage (existing, "use client")
  ├── PageSidebar (existing)
  │     └── **PageInsightsButton** (F4)           ← "use client" (click handler)
  ├── PagePreview (existing)
  │     └── SectionTree (existing)
  │           └── **SectionInsight** (F4)         ← "use client" (popover state)
  └── **PageInsightsPanel** (F4)                  ← "use client" (slide-out panel)

DashboardPage (existing, server component)
  └── SiteCard (existing, "use client")
        └── **ImpactSummary** (F5)                ← server-compatible (pure presentation)
```

### 2.2 Server/Client Boundary Decisions

| Component | Boundary | Reason |
|-----------|----------|--------|
| **InferenceCard** | `"use client"` | onClick handlers (confirm/edit), animation state, auto-dismiss timer |
| **StrategyPreview** | `"use client"` | useSWR for data fetching, expand/collapse state |
| **StrategyPreviewSkeleton** | none (child of client) | Pure presentation, rendered by StrategyPreview |
| **SectionInsight** | `"use client"` | Popover open/close state, click-outside handler |
| **PageInsightsPanel** | `"use client"` | Slide-out animation state, derived calculations |
| **ImpactSummary** | none (server-compatible) | Pure presentation — receives data as props from SiteCard |

### 2.3 Component Specifications

#### InferenceCard

```typescript
// platform-app/src/components/onboarding/InferenceCard.tsx
"use client";

interface InferenceCardItem {
  label: string;
  value: string | string[];
  type?: "text" | "list";     // "text" = single value, "list" = bulleted
}

interface InferenceCardProps {
  title?: string;              // default: "AI understood"
  items: InferenceCardItem[];
  explanation: string;         // e.g., "This shapes your page suggestions and SEO keywords."
  onConfirm: () => void;      // "Looks right" click
  onEdit: () => void;         // "Edit" click → scrolls to field
  editLabel?: string;          // default: "Edit my description"
  isLoading?: boolean;         // Shows skeleton
  autoDismissMs?: number;      // default: 30000 (30s), 0 = no auto-dismiss
}
```

**Layout behavior:**
- Desktop: Renders in `insightSlot` of StepLayout — appears below the form, above navigation buttons. Uses `bg-white/5 border border-white/10 rounded-xl` consistent with existing card patterns.
- Mobile: Same position (insightSlot renders inline on mobile). NOT a bottom sheet — bottom sheets require a portal and add bundle cost. The card renders inline and is scrollable. If the user scrolls past it, that's fine — it auto-dismisses after 30s anyway.

**Trade-off: Bottom sheet vs. inline card on mobile**

| Option | Pros | Cons |
|--------|------|------|
| Bottom sheet (portal) | Always visible, familiar mobile pattern | Requires portal, z-index management, gesture handling, adds ~3KB |
| Inline card | Zero extra deps, consistent with existing patterns, no z-index | May scroll off screen |

**Decision: Inline card.** The project has zero UI library dependencies. Adding a bottom sheet means either building one from scratch (~200 LOC + gesture handling) or adding a dependency. The inline card works well because it appears directly below the user's input — exactly where they're looking. Auto-dismiss prevents stale cards.

**Animation:** CSS-only. `@starting-style` for enter animation (opacity 0 → 1, translateY 8px → 0, 200ms ease). No Framer Motion needed.

```css
.inference-card {
  animation: inference-enter 200ms ease;
}
@keyframes inference-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

#### StrategyPreview

```typescript
// platform-app/src/components/onboarding/StrategyPreview.tsx
"use client";

interface StrategyPreviewProps {
  siteId: string;
}

// Internal state:
// - fetches from /api/ai/research-preview?siteId=...
// - expanded: boolean (default: true on desktop, false on mobile)
// - Uses window.matchMedia("(min-width: 768px)") for initial state, not useEffect
```

**Data fetching pattern:**

```typescript
// NOT useSWR — this is a one-shot fetch that may take 10-20s.
// SWR's revalidation and dedup are overkill. Use a simple useEffect + AbortController.
const [preview, setPreview] = useState<ResearchPreview | null>(null);
const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/ai/research-preview?siteId=${siteId}`, { signal: controller.signal })
    .then(r => r.json())
    .then(data => {
      if (data.success) { setPreview(data.preview); setStatus("loaded"); }
      else setStatus("error");
    })
    .catch(() => setStatus("error"));
  return () => controller.abort();
}, [siteId]);
```

**Why not SWR:** The research preview takes 10-20 seconds. SWR's stale-while-revalidate pattern would show stale data and re-fetch in the background, which is confusing for a long-running AI call. A simple fetch with explicit loading/loaded/error states is clearer. SWR's dedup is unnecessary because the user only visits this page once per session.

**Render structure:**
```
<details> (native HTML, progressive enhancement)
  <summary> "AI Strategy Preview" + chevron
  <div> content sections:
    ├── Page Strategy (grid of page cards with section counts)
    ├── Content Approach (tone + example sentences)
    ├── SEO Focus (keyword badges)
    └── Competitive Positioning (2-3 bullet points)
  </div>
</details>
```

**Why `<details>` over useState toggle:** The `<details>` element provides collapse/expand for free, works without JavaScript, is accessible by default (keyboard, screen reader), and saves ~10 lines of state management code. We control the `open` attribute via a ref to set initial state (open on desktop, closed on mobile).

#### SectionInsight

```typescript
// platform-app/src/app/onboarding/review/components/SectionInsight.tsx
"use client";

interface SectionInsightProps {
  sectionIndex: number;
  pageSlug: string;
  contentBrief?: string;         // From section._meta.contentBrief
  targetKeywords?: string[];     // From section._meta.targetKeywords
  imageQuery?: string;           // From section._meta.imageQuery
  toneGuidance?: string;         // From ResearchBrief.toneGuidance.primary
  audiencePainPoints?: string[]; // From ResearchBrief.targetAudience.painPoints
  isEdited?: boolean;            // True if user has modified this section
}
```

**Popover implementation:** Use the native `<dialog>` element positioned relative to the trigger button. No portal needed — the dialog element creates its own stacking context.

```typescript
const dialogRef = useRef<HTMLDialogElement>(null);

// Show as non-modal (popover-like):
function toggle() {
  if (dialogRef.current?.open) dialogRef.current.close();
  else dialogRef.current?.show(); // .show() = non-modal
}

// Close on outside click:
useEffect(() => {
  function handleClick(e: MouseEvent) {
    if (dialogRef.current?.open && !dialogRef.current.contains(e.target as Node)) {
      dialogRef.current.close();
    }
  }
  document.addEventListener("click", handleClick);
  return () => document.removeEventListener("click", handleClick);
}, []);
```

**Why `<dialog>` over a popover library:**
- Zero bundle cost (browser-native)
- Built-in focus management (focus trap for modal, focus return on close)
- `::backdrop` pseudo-element for overlay if needed
- Accessible by default (Escape key closes, `aria-modal`)
- Supported by all modern browsers (97%+ global support)

#### PageInsightsPanel

```typescript
// platform-app/src/app/onboarding/review/components/PageInsightsPanel.tsx
"use client";

interface PageInsightsPanelProps {
  page: PageLayout;
  pageSlug: string;
  contentPlan?: ContentPlanPage;  // From insights API
  reviewScore?: ReviewResult;     // From insights API
  onClose: () => void;
  isOpen: boolean;
}
```

**Slide-out panel:** Renders as a `<aside>` with CSS transform transition. On mobile, takes full width; on desktop, overlays the right portion of the review editor.

**Derived data (computed client-side, not stored):**
```typescript
// Word count: sum across all sections
const wordCount = page.sections.reduce((sum, s) => {
  const props = JSON.parse(s.props_json || "{}");
  return sum + countWords(JSON.stringify(props));
}, 0);

// Internal link count: count href props pointing to internal slugs
const linkCount = page.sections.reduce((sum, s) => {
  const props = JSON.parse(s.props_json || "{}");
  return sum + countInternalLinks(props, allPageSlugs);
}, 0);

// Keyword coverage: match targetKeywords against section text
const keywordHits = contentPlan?.targetKeywords?.filter(kw =>
  pageText.toLowerCase().includes(kw.toLowerCase())
) ?? [];
```

#### ImpactSummary

```typescript
// platform-app/src/components/dashboard/ImpactSummary.tsx
// No "use client" — pure presentation, rendered by SiteCard

interface ImpactSummaryProps {
  bullets: string[];  // 3-5 impact bullets from blueprint._impact
}
```

Renders as a compact list with a subtle "Your inputs shaped:" label. Uses `text-xs text-zinc-400` for the label and `text-sm text-zinc-300` for bullets.

---

## 3. Data Flow

### F1: Inference Cards

```
IdeaPage
  └── validates idea via POST /api/ai/analyze
        └── response includes: { industry, keywords, compliance_flags, detectedServices }
              └── constructs InferenceCardItem[] from response
                    └── passes to <InferenceCard> in insightSlot

AudiencePage
  └── suggests audiences via POST /api/ai/suggest-audiences
        └── response includes: { suggestions, painPoints }
              └── constructs InferenceCardItem[] from response
                    └── passes to <InferenceCard> in insightSlot

TonePage
  └── user selects tone from tone-samples.ts
        └── looks up tone sample: { label, description, examples }
              └── constructs InferenceCardItem[] from local data (NO API call)
                    └── passes to <InferenceCard> in insightSlot
```

**State management:** Local React state per step page. When the analyze/suggest API responds, the step page constructs inference items and shows the card. The card's visibility is controlled by a `showInference: boolean` state.

```typescript
const [showInference, setShowInference] = useState(false);
const [inferenceItems, setInferenceItems] = useState<InferenceCardItem[]>([]);

// After successful validation:
function handleValidationSuccess(data: AnalyzeResponse) {
  setInferenceItems([
    { label: "Industry", value: data.industry, type: "text" },
    { label: "Key services detected", value: data.detectedServices, type: "list" },
    ...(data.compliance_flags.length > 0
      ? [{ label: "Compliance", value: data.compliance_flags.join(", "), type: "text" as const }]
      : []),
  ]);
  setShowInference(true);
}
```

### F2: Strategy Preview

```
ReviewSettingsPage
  └── mounts StrategyPreview with siteId
        └── StrategyPreview fetches GET /api/ai/research-preview?siteId=...
              ├── API checks OnboardingSession.previewInputHash
              │     ├── cache hit → returns cached OnboardingSession.researchPreview
              │     └── cache miss → runs Research phase, caches result, returns
              └── StrategyPreview renders preview data or error fallback
```

**No prop drilling needed.** StrategyPreview owns its own data fetching. ReviewSettingsPage just renders `<StrategyPreview siteId={siteId} />` below the existing summary.

### F3: Generation Narrative

```
ProgressPage (existing)
  └── polls GET /api/provision/status every 2s (existing)
        └── status.pipeline.{phase}.summary now contains rich text (API change)
              └── PipelineProgress renders enriched summaries (component change)
```

**Status API enrichment (backend):**
```typescript
// In /api/provision/status/route.ts — build rich summaries:
function buildPhaseSummary(phase: string, siteId: string): string {
  if (phase === "research") {
    const brief = await prisma.researchBrief.findFirst({ where: { siteId }, orderBy: { version: "desc" } });
    if (!brief) return "Analyzing your business...";
    const { industry, targetAudience, complianceNotes } = brief.content;
    return `Identified your business as ${industry} targeting ${targetAudience.primary}. Found ${targetAudience.painPoints?.length ?? 0} key customer needs.${complianceNotes?.length ? ` Noted ${complianceNotes[0]}.` : ""}`;
  }
  // ... similar for plan, generate, enhance
}
```

**Per-page progress during Generate phase:**
The existing `pipelinePhase` field already stores `generate:2/6:Services`. The status API already parses this. The PipelineProgress component needs to render it more prominently:

```typescript
// Current: shows "Generating content..."
// New: shows "Writing Services page (2 of 6) • Targeting 'cosmetic dentistry portland'"
```

This requires the status API to include `currentKeywords` from the ContentPlan for the active page.

### F4: "Why This?" Tooltips

```
ReviewPage mounts
  └── user clicks info (?) icon on a section
        └── first click triggers GET /api/blueprint/{siteId}/insights (cached after first fetch)
              └── insightsData flows down to SectionInsight via props
                    └── SectionInsight maps: section._meta.contentBrief, section._meta.targetKeywords
                          └── renders popover with rationale
```

**Lazy loading the insights data:**
```typescript
const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
const [insightsFetched, setInsightsFetched] = useState(false);

// Only fetch when first info icon is clicked:
function handleInsightClick(sectionIndex: number) {
  if (!insightsFetched) {
    fetch(`/api/blueprint/${siteId}/insights`).then(r => r.json()).then(setInsightsData);
    setInsightsFetched(true);
  }
  setActiveInsight(sectionIndex);
}
```

**Why lazy-fetch on first click, not on page load:** Most users go to the review page to edit content, not to inspect AI reasoning. Loading 10-20KB of insights data on every page load is wasteful. Fetching on first info-icon click keeps the initial page load fast and only pays the cost for users who want transparency.

### F5: Dashboard Summary

```
DashboardPage (server component)
  └── prisma.site.findMany({ include: { blueprint: { select: { payload: true } } } })
        └── extracts blueprint.payload._impact (string[])
              └── passes to SiteCard as impactBullets prop
                    └── SiteCard renders <ImpactSummary bullets={impactBullets} />
```

**No client-side fetching.** Dashboard is a server component. Blueprint payload (including `_impact`) is loaded in the initial query. ImpactSummary is pure presentation.

**Performance concern:** Loading full `blueprint.payload` on dashboard just for `_impact` is wasteful (payload can be 50-100KB). Solution: use Prisma's `select` with raw JSON path:

```typescript
// Option A: Select just _impact from JSON (Prisma doesn't support JSON path select)
// Option B: Add _impact as a top-level Blueprint field
// Option C: Accept the cost — dashboard loads once, and we include: { blueprint: true }

// Chosen: Option C for v1. The dashboard query is server-side, not on every render.
// If profiling shows this is slow, migrate to Option B in a follow-up.
```

---

## 4. API Route Design

### 4.1 New: `/api/ai/research-preview`

```typescript
// platform-app/src/app/api/ai/research-preview/route.ts

// Request
// GET /api/ai/research-preview?siteId={siteId}

// Response (200)
interface ResearchPreviewResponse {
  success: boolean;
  preview?: {
    industry: string;
    targetAudience: {
      primary: string;
      painPoints: string[];
    };
    toneGuidance: {
      primary: string;
      examples: string[];
    };
    seoKeywords: string[];
    competitivePositioning: string;  // Human-readable paragraph (no real competitor names)
    pageStrategy: Array<{
      slug: string;
      sectionCount: number;
      keyFeature: string;  // One-line description
    }>;
  };
  cached: boolean;
  durationMs?: number;
  error?: string;  // Only when success: false
}
```

**Implementation notes:**
- Auth: requires authenticated session (existing middleware)
- Timeout: 25s server-side timeout (returns error if exceeded)
- Cache: checks `OnboardingSession.previewInputHash` before running AI

### 4.2 New: `/api/blueprint/[siteId]/insights`

```typescript
// platform-app/src/app/api/blueprint/[siteId]/insights/route.ts

// Request
// GET /api/blueprint/{siteId}/insights

// Response (200)
interface BlueprintInsightsResponse {
  researchBrief: {
    industry: string;
    toneGuidance: { primary: string; avoid: string[]; examples: string[] };
    seoKeywords: string[];
    targetAudience: { primary: string; painPoints: string[] };
  };
  contentPlan: {
    pages: Array<{
      slug: string;
      targetKeywords: string[];
      sections: Array<{
        heading: string;
        contentBrief: string;
        type: string;
      }>;
    }>;
  };
  reviewScores: Array<{
    page: string;
    score: number;
    passed: boolean;
    checks: { passed: number; failed: number; total: number };
  }>;
}
```

**Implementation:** Read latest ResearchBrief, ContentPlan, and Blueprint._review for the siteId. Project only the fields needed (don't return full records). Cache headers: `Cache-Control: private, max-age=3600` (data doesn't change after generation).

### 4.3 Enriched: `/api/ai/analyze`

Add to existing response:
```typescript
interface AnalyzeResponse {
  industry: string;           // existing
  keywords: string[];         // existing
  compliance_flags: string[]; // existing
  detectedServices: string[]; // NEW: 2-5 services extracted from idea text
}
```

### 4.4 Enriched: `/api/ai/suggest-audiences`

Add to existing response:
```typescript
interface SuggestAudiencesResponse {
  suggestions: string[];      // existing
  painPoints: string[];       // NEW: 2-3 inferred pain points
}
```

### 4.5 Enriched: `/api/provision/status`

Enrich `pipeline.{phase}.summary` with input-aware text. Add to generate phase:
```typescript
interface GeneratePhaseStatus extends PhaseStatus {
  currentPage?: string;      // NEW: "Services"
  pageProgress?: string;     // NEW: "3/6"
  activeKeywords?: string[]; // NEW: keywords for current page
}
```

---

## 5. State Management

| Feature | State Type | Rationale |
|---------|-----------|-----------|
| F1: Inference card visibility | React state (`useState`) | Ephemeral UI state, doesn't survive refresh, not shareable |
| F1: Inference card items | React state | Derived from API response, computed once per step |
| F2: Preview expand/collapse | DOM state (`<details open>`) | Progressive enhancement, no JS needed for basic behavior |
| F2: Preview data | React state + AbortController | One-shot long-running fetch, not suitable for SWR |
| F3: Phase summaries | None (derived from API) | Already managed by existing polling hook |
| F4: Active insight popover | React state (`activeInsight: number | null`) | Only one popover open at a time |
| F4: Insights data | React state (lazy-fetched) | Fetched once on first click, retained for session |
| F4: Page insights panel open | React state | Ephemeral UI state |
| F5: Impact bullets | Props (server-rendered) | Data flows from server component, no client state |

**No new Context providers.** No feature requires cross-component shared state that isn't already handled by prop passing within the existing component tree.

**No URL state.** None of the transparency features represent user-navigable state that should survive refresh or be shareable via URL.

---

## 6. Hooks & Utilities

### New Hooks

```typescript
// platform-app/src/hooks/useResearchPreview.ts
// Encapsulates the research preview fetch with abort, loading, error states
export function useResearchPreview(siteId: string | null) {
  // Returns: { preview: ResearchPreview | null, status: "loading" | "loaded" | "error" }
  // Auto-fetches on mount, aborts on unmount
}
```

**Why extract to a hook:** The StrategyPreview component needs fetch + abort + state management. Extracting this to a hook keeps the component focused on rendering and makes the fetch logic testable independently.

### New Utilities

```typescript
// platform-app/src/lib/transparency/summary-templates.ts
// Template functions for building human-readable summaries from pipeline data
export function buildResearchSummary(brief: ResearchBriefContent): string;
export function buildPlanSummary(plan: ContentPlanContent): string;
export function buildGenerateSummary(pageCount: number, wordCount: number, imageCount: number, keywordCount: number): string;
export function buildImpactBullets(brief: ResearchBriefContent, plan: ContentPlanContent, onboardingData: OnboardingData): string[];
```

**Why a shared module:** These template functions are used by:
1. Status API (builds phase summaries)
2. Pipeline orchestrator (builds completion summary + impact bullets)
3. Potentially the StrategyPreview component (if we want client-side summary formatting)

Collocating them in `/lib/transparency/` keeps the logic DRY and testable.

```typescript
// platform-app/src/lib/transparency/input-hash.ts
export function computeInputHash(data: OnboardingData): string;
// SHA-256 of: idea + audience + industry + tone + JSON(pages) + differentiators + JSON(followUpAnswers)
// Used by: research-preview API, onboarding save API, pipeline orchestrator
```

---

## 7. Performance Strategy

### Bundle Impact

| Component | Estimated Size | Strategy |
|-----------|---------------|----------|
| InferenceCard | ~2KB | Inline in step pages (already client components) |
| StrategyPreview | ~3KB | Inline in review-settings (already client component) |
| SectionInsight | ~2KB | `next/dynamic` lazy load — only needed when user clicks info icon |
| PageInsightsPanel | ~3KB | `next/dynamic` lazy load — slide-out panel, rarely accessed |
| ImpactSummary | ~0.5KB | Server-rendered, zero client JS |
| summary-templates.ts | ~1KB | Server-only (used in API routes), not in client bundle |
| input-hash.ts | ~0.3KB | Server-only |

**Total client bundle impact:** ~5KB (inline) + ~5KB (lazy-loaded on demand) = ~10KB worst case.

### Lazy Loading

```typescript
// In review page — only load when user interacts:
const SectionInsight = dynamic(
  () => import("./components/SectionInsight"),
  { ssr: false }  // No SSR — this is a client-only popover
);

const PageInsightsPanel = dynamic(
  () => import("./components/PageInsightsPanel"),
  { ssr: false }
);
```

### Avoiding Unnecessary Re-renders

**F3 (PipelineProgress):** The polling hook already triggers re-renders every 2 seconds. The enriched summaries are strings — they change once per phase transition, not on every poll. Use `React.memo` on individual PhaseCard components with a custom comparator that ignores `durationMs` changes during `in_progress` status.

**F4 (SectionInsight):** The insights data is fetched once and doesn't change. Memoize the mapping from section index to content brief to avoid recomputing on every parent re-render:

```typescript
const sectionBrief = useMemo(() => {
  if (!insightsData) return null;
  return insightsData.contentPlan.pages
    .find(p => p.slug === pageSlug)
    ?.sections[sectionIndex];
}, [insightsData, pageSlug, sectionIndex]);
```

### Critical Rendering Path

No impact on LCP/CLS for any feature:
- F1: InferenceCard appears after user interaction (not on initial paint)
- F2: StrategyPreview loads async below the fold; skeleton prevents CLS
- F3: PipelineProgress is already the primary content — enriching it doesn't change timing
- F4: Lazy-loaded, triggered by user click
- F5: Server-rendered inline, zero layout shift (fixed height: `min-h-[80px]` on the impact section)

---

## 8. Accessibility Plan

### InferenceCard (F1)
- `role="status"` + `aria-live="polite"` — screen reader announces when the card appears
- Confirm/Edit buttons: proper `<button>` elements with descriptive labels
- Auto-dismiss: `aria-live` region announces "AI insight dismissed" when card auto-hides
- Keyboard: Tab to buttons, Enter/Space to activate
- Color contrast: all text meets WCAG AA against `bg-white/5` background

### StrategyPreview (F2)
- `<details>` element: natively accessible (keyboard expand/collapse, screen reader announces open/closed state)
- Loading state: `aria-busy="true"` on the container, skeleton has `aria-hidden="true"`
- Error state: `role="alert"` on the "Preview unavailable" message

### SectionInsight (F4)
- Trigger button: `aria-haspopup="dialog"`, `aria-expanded={isOpen}`
- `<dialog>` element: native focus management, Escape to close
- Focus trap: not needed for `.show()` (non-modal) — focus returns to trigger on close
- Screen reader: dialog has `aria-label="Section insight for {sectionHeading}"`

### PageInsightsPanel (F4)
- `<aside>` with `role="complementary"` and `aria-label="Page insights"`
- Close button: `aria-label="Close page insights"`
- Focus: move focus to panel on open, return to trigger on close
- Keyboard: Escape closes panel

### ImpactSummary (F5)
- Semantic: `<ul>` with `<li>` items
- `aria-label="How AI used your inputs"`
- No interactive elements — pure content

---

## 9. Testing Strategy

### Unit Tests (Vitest + React Testing Library)

| Component | Test Cases |
|-----------|-----------|
| InferenceCard | Renders items correctly; "Looks right" calls onConfirm; "Edit" calls onEdit; auto-dismisses after timeout; shows skeleton when isLoading |
| StrategyPreview | Shows skeleton while loading; renders preview data on success; shows "unavailable" on error; collapsed on mobile, expanded on desktop |
| SectionInsight | Opens on click; closes on outside click; closes on Escape; shows "customized" note when isEdited; renders image query for image sections |
| PageInsightsPanel | Derives word count correctly; derives link count correctly; shows quality score; maps keywords to coverage count |
| ImpactSummary | Renders 3-5 bullets; handles empty array gracefully |
| buildResearchSummary | Generates readable text from mock ResearchBrief; handles missing fields |
| buildImpactBullets | Produces correct bullets for compliance, proactive pages, tone, SEO |
| computeInputHash | Same inputs → same hash; different inputs → different hash |

### Integration Tests (Vitest + MSW)

| Flow | Test |
|------|------|
| Idea step + inference | Mock `/api/ai/analyze` → verify InferenceCard renders with industry + services |
| Research preview | Mock `/api/ai/research-preview` → verify StrategyPreview renders page strategy |
| Research preview cache | Call twice → verify second call returns cached (check `cached: true` in response) |
| Insights API | Mock `/api/blueprint/{siteId}/insights` → verify SectionInsight shows contentBrief |

### E2E Tests (Playwright)

| Test | Steps |
|------|-------|
| **Inference card on Idea step** | Fill idea → wait for validation → assert inference card visible → click "Looks right" → assert card dismissed |
| **Strategy preview on review-settings** | Navigate to review-settings → assert skeleton visible → wait for preview → assert page strategy section visible → click Generate → assert redirects to progress |
| **Rich progress summaries** | Trigger generation → navigate to progress → wait for research_complete → assert summary contains business-specific text (not generic) |
| **Section tooltip** | Navigate to review → click info icon on first section → assert popover visible with content brief → press Escape → assert popover closed |
| **Dashboard impact summary** | After generation completes → navigate to dashboard → assert "Your inputs shaped" section visible with 3+ bullets |

### Visual Regression

Candidates for visual regression testing (screenshots compared against baselines):
- InferenceCard in loading, loaded, and dismissed states
- StrategyPreview in loading, expanded, and collapsed states
- SectionInsight popover positioning relative to trigger

---

## 10. TypeScript Contracts

### Shared Types (used by both API routes and client components)

```typescript
// platform-app/src/lib/transparency/types.ts

import { z } from "zod";

// Research Preview
export const ResearchPreviewSchema = z.object({
  industry: z.string(),
  targetAudience: z.object({
    primary: z.string(),
    painPoints: z.array(z.string()),
  }),
  toneGuidance: z.object({
    primary: z.string(),
    examples: z.array(z.string()),
  }),
  seoKeywords: z.array(z.string()),
  competitivePositioning: z.string(),
  pageStrategy: z.array(z.object({
    slug: z.string(),
    sectionCount: z.number(),
    keyFeature: z.string(),
  })),
});
export type ResearchPreview = z.infer<typeof ResearchPreviewSchema>;

// Section Metadata (attached during generate phase)
export const SectionMetaSchema = z.object({
  contentBrief: z.string().optional(),
  targetKeywords: z.array(z.string()).optional(),
  imageQuery: z.string().optional(),
}).optional();
export type SectionMeta = z.infer<typeof SectionMetaSchema>;

// Blueprint Insights (response from /api/blueprint/{siteId}/insights)
export const BlueprintInsightsSchema = z.object({
  researchBrief: z.object({
    industry: z.string(),
    toneGuidance: z.object({
      primary: z.string(),
      avoid: z.array(z.string()),
      examples: z.array(z.string()),
    }),
    seoKeywords: z.array(z.string()),
    targetAudience: z.object({
      primary: z.string(),
      painPoints: z.array(z.string()),
    }),
  }),
  contentPlan: z.object({
    pages: z.array(z.object({
      slug: z.string(),
      targetKeywords: z.array(z.string()),
      sections: z.array(z.object({
        heading: z.string(),
        contentBrief: z.string(),
        type: z.string(),
      })),
    })),
  }),
  reviewScores: z.array(z.object({
    page: z.string(),
    score: z.number(),
    passed: z.boolean(),
    checks: z.object({
      passed: z.number(),
      failed: z.number(),
      total: z.number(),
    }),
  })),
});
export type BlueprintInsights = z.infer<typeof BlueprintInsightsSchema>;

// Enriched API responses
export const AnalyzeResponseSchema = z.object({
  industry: z.string(),
  keywords: z.array(z.string()),
  compliance_flags: z.array(z.string()),
  detectedServices: z.array(z.string()),  // NEW
});

export const SuggestAudiencesResponseSchema = z.object({
  suggestions: z.array(z.string()),
  painPoints: z.array(z.string()),  // NEW
});

// Inference card items (client-only)
export interface InferenceCardItem {
  label: string;
  value: string | string[];
  type?: "text" | "list";
}
```

---

## 11. File Structure Summary

```
platform-app/src/
  lib/transparency/
    types.ts                    # Zod schemas + TypeScript types
    summary-templates.ts        # Template functions for human-readable summaries
    input-hash.ts               # SHA-256 hash utility for cache invalidation

  hooks/
    useResearchPreview.ts       # Fetch + abort + state for strategy preview

  components/onboarding/
    InferenceCard.tsx            # F1: Reusable inference display card
    StrategyPreview.tsx          # F2: Collapsible strategy panel
    StrategyPreviewSkeleton.tsx  # F2: Loading skeleton

  components/dashboard/
    ImpactSummary.tsx            # F5: Impact bullets display

  app/onboarding/review/components/
    SectionInsight.tsx           # F4: Per-section tooltip
    PageInsightsPanel.tsx        # F4: Per-page slide-out panel

  app/api/ai/research-preview/
    route.ts                    # F2: Research preview endpoint

  app/api/blueprint/[siteId]/insights/
    route.ts                    # F4: Blueprint insights endpoint
```

**Existing files modified (not new):**

```
  app/onboarding/idea/page.tsx           # F1: Add inference card integration
  app/onboarding/audience/page.tsx       # F1: Add inference card integration
  app/onboarding/tone/page.tsx           # F1: Add inference card integration
  app/onboarding/review-settings/page.tsx # F2: Add StrategyPreview
  app/onboarding/review/page.tsx         # F4: Add insights fetch + SectionInsight
  app/onboarding/review/components/PagePreview.tsx  # F4: Add info icon to sections
  components/onboarding/PipelineProgress.tsx # F3: Render enriched summaries
  components/dashboard/SiteCard.tsx       # F5: Add ImpactSummary
  app/api/ai/analyze/route.ts            # F1: Add detectedServices to response
  app/api/ai/suggest-audiences/route.ts  # F1: Add painPoints to response
  app/api/provision/status/route.ts      # F3: Build rich summaries from DB
  lib/pipeline/orchestrator.ts           # F2: Check cached preview before Research
  lib/pipeline/phases/generate.ts        # F4: Attach _meta to sections
  lib/pipeline/phases/research.ts        # F3: No changes (data already structured)
```

---

## 12. Trade-Off Summary

| Decision | Chosen | Rejected | Why |
|----------|--------|----------|-----|
| Mobile inference card | Inline card in insightSlot | Bottom sheet (portal) | Zero deps, no z-index issues, card appears where user is looking |
| Strategy preview fetch | useEffect + AbortController | useSWR | One-shot 10-20s fetch; SWR revalidation is confusing for long ops |
| Collapse/expand | `<details>` element | useState toggle | Progressive enhancement, native a11y, fewer lines |
| Popover | `<dialog>.show()` | Radix/Floating UI | Zero bundle cost, native focus management, 97% browser support |
| Insights loading | Lazy fetch on first click | Eager on page load | Most users never click info icon; save 10-20KB initial payload |
| Dashboard blueprint data | Full payload in query | Separate _impact field | Pragmatic v1; optimize to top-level field if profiling shows issue |
| Summary generation | Template functions (string interpolation) | LLM call per summary | Zero cost, zero latency, deterministic output |
| Section-to-plan mapping | `_meta` fields on sections | Index-based or fuzzy matching | Explicit, reliable, survives reordering |
