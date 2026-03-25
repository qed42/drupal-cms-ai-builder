# Architecture: M20 — Transparent AI Onboarding

**Scope:** US-064 through US-073 (Sprints 34-37)
**Date:** 2026-03-25

---

## 1. Architecture Principles

1. **Zero additional AI calls in the UI layer** — all transparency data comes from pipeline outputs already computed
2. **One new AI call total** — the Research Preview (F2) runs the existing Research phase early; this call is then cached and re-used during generation, making it cost-neutral
3. **Additive schema changes only** — no breaking changes to existing models or APIs
4. **Progressive enhancement** — every transparency feature degrades gracefully if data is missing

---

## 2. System Context

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                          │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐ │
│  │ Onboard  │  │ Review   │  │Progress │  │Dashboard │ │
│  │ Steps    │  │ Settings │  │  Page   │  │          │ │
│  │          │  │          │  │         │  │          │ │
│  │ F1:Cards │  │ F2:Prev  │  │F3:Narr  │  │F5:Impact │ │
│  └────┬─────┘  └────┬─────┘  └────┬────┘  └────┬─────┘ │
│       │              │             │             │        │
│  ┌────┴──────────────┴─────────────┴─────────────┴─────┐ │
│  │               Review Editor (F4: Tooltips)           │ │
│  └──────────────────────┬──────────────────────────────┘ │
└─────────────────────────┼────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js API Layer                       │
│                                                          │
│  /api/ai/analyze ──────── (enriched: +detectedServices)  │
│  /api/ai/suggest-audiences (enriched: +painPoints)       │
│  /api/ai/research-preview ──── NEW                       │
│  /api/provision/status ──────── (enriched: +summaries)   │
│  /api/blueprint/{siteId} ────── (enriched: +metadata)    │
│  /api/blueprint/{siteId}/insights ── NEW                 │
└───────────┬─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│                   Data Layer (Prisma)                     │
│                                                          │
│  OnboardingSession ── +researchPreview, +previewHash     │
│  ResearchBrief ────── (exists, no changes)                │
│  ContentPlan ──────── (exists, no changes)                │
│  Blueprint ─────────── payload._meta, payload._impact    │
│  Site ─────────────── (no changes)                        │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Data Architecture

### 3.1 Schema Changes

**OnboardingSession** — add 2 fields:
```prisma
model OnboardingSession {
  // ... existing fields ...
  researchPreview  Json?     // Cached ResearchBrief from preview
  previewInputHash String?   // SHA-256 hash of inputs that produced the preview
}
```

**Blueprint.payload** — extend with metadata (JSON, no schema migration):
```typescript
interface BlueprintBundle {
  // ... existing fields ...
  _meta?: {
    researchBriefId: string;       // FK to research_briefs.id
    contentPlanId: string;         // FK to content_plans.id
    generationSummary: string;     // "6 pages, 2800 words, 12 images, 8 keywords"
    phaseSummaries: {              // Rich summaries from each phase
      research: string;
      plan: string;
      generate: string;
      enhance: string;
    };
  };
  _impact?: string[];              // 3-5 impact bullets for dashboard
  _review?: ReviewResult[];        // Already exists
  pages: Array<PageLayout & {
    sections: Array<PageSection & {
      _meta?: {
        contentBrief?: string;     // From ContentPlan: what was the brief for this section
        imageQuery?: string;       // What Pexels query was used for images
        targetKeywords?: string[]; // Which SEO keywords this section targets
      };
    }>;
  }>;
}
```

### 3.2 Data Flow by Feature

#### F1: Inference Cards — Data already available, no storage needed

```
Idea step → /api/ai/analyze → { industry, keywords, compliance_flags, detectedServices* }
                                                                        ↑ NEW field
Audience step → /api/ai/suggest-audiences → { suggestions, painPoints* }
                                                             ↑ NEW field
Tone step → tone-samples.ts (local data, no API call)
```

**Decision: Enrich existing API responses vs. new endpoint**

| Option | Pros | Cons |
|--------|------|------|
| A: Enrich existing endpoints | Zero latency overhead, single response | Couples inference display to validation |
| B: New `/api/ai/infer` endpoint | Clean separation | Extra API call, latency |

**Chosen: Option A** — The analyze and suggest-audiences endpoints already call the AI. Adding 2-3 more fields to the prompt costs ~50 extra tokens and <200ms. The data is consumed in the same component that triggers the API call, so coupling is natural.

#### F2: Research Preview — New endpoint with cache-through pattern

```
review-settings page load
  ↓
GET /api/ai/research-preview?siteId={id}
  ↓
Check OnboardingSession.previewInputHash
  vs. hash(idea + audience + industry + tone + pages + differentiators + followUpAnswers)
  ↓
  ├── Hash match → return cached OnboardingSession.researchPreview (0ms AI cost)
  └── Hash mismatch or no cache →
        ↓
      Run research phase (existing research.ts)
        ↓
      Store result in OnboardingSession.researchPreview + previewInputHash
        ↓
      Return result
```

**Cache re-use during generation:**
```
runPipeline() → Research phase
  ↓
Check: Does OnboardingSession.researchPreview exist
  AND previewInputHash matches current inputs?
  ↓
  ├── Yes → Skip AI call, create ResearchBrief record from cached data
  └── No → Run Research phase normally
```

**Decision: Where to cache the preview**

| Option | Pros | Cons |
|--------|------|------|
| A: OnboardingSession fields | Co-located with input data, invalidated on save | Adds JSON to a frequently-read record |
| B: Separate PreviewCache table | Clean separation, can version | Over-engineering for a single-use cache |
| C: ResearchBrief table (version 0) | Re-uses existing table | Semantic mismatch — preview != committed brief |

**Chosen: Option A** — The preview is tightly coupled to the session's input state. Storing it on OnboardingSession with a hash makes invalidation trivial: the save endpoint already touches this record, so it can null out the preview when inputs change.

#### F3: Live Generation Narrative — Enrich existing status pipeline

```
Pipeline Phase Execution
  ↓
Phase completes → builds summary from structured output
  ↓
Updates Site.pipelinePhase (existing) + Site.pipelineSummary* (new field? or encode in phase string?)
  ↓
Status API reads latest state → returns enriched summaries
  ↓
PipelineProgress.tsx renders rich text
```

**Decision: Where to store phase summaries**

| Option | Pros | Cons |
|--------|------|------|
| A: Encode in Site.pipelinePhase | No schema change | String parsing, limited data |
| B: New Site.pipelineSummaries Json field | Clean, structured | Schema migration |
| C: Read from ResearchBrief/ContentPlan/Blueprint at status time | No new fields, data already exists | Slightly slower status query (3 extra reads) |

**Chosen: Option C** — The status API already queries the Site record. Adding 3 lightweight queries (ResearchBrief, ContentPlan, Blueprint) to build rich summaries is acceptable at 2-second polling intervals. The data is already stored; we just need to read it and format it. This avoids any schema changes and keeps summaries derived from the source of truth.

**Summary generation logic (template-based, NOT AI):**
```typescript
function buildResearchSummary(brief: ResearchBrief): string {
  const { industry, targetAudience, seoKeywords, complianceNotes } = brief.content;
  let summary = `Identified your business as ${industry}`;
  if (targetAudience?.painPoints?.length) {
    summary += `. Found ${targetAudience.painPoints.length} key customer pain points`;
  }
  if (complianceNotes?.length) {
    summary += `. Noted ${complianceNotes.length} compliance consideration(s)`;
  }
  return summary;
}
```

#### F4: "Why This?" Tooltips — Data assembled from existing records

```
Review page loads blueprint
  ↓
Fetches: GET /api/blueprint/{siteId}/insights (NEW)
  ↓
Returns: {
  researchBrief: { toneGuidance, seoKeywords, targetAudience },
  contentPlan: { pages: [{ slug, targetKeywords, sections: [{ contentBrief }] }] },
  reviewScores: blueprint.payload._review
}
  ↓
Client-side: maps section index → contentPlan.pages[slug].sections[index]
  ↓
SectionInsight component renders tooltip from mapped data
```

**Decision: Separate insights endpoint vs. embed in blueprint response**

| Option | Pros | Cons |
|--------|------|------|
| A: Embed in `/api/blueprint/{siteId}` | Single request | Bloats the primary blueprint response (~10-20KB extra) |
| B: Separate `/api/blueprint/{siteId}/insights` | On-demand, only loaded when user clicks "?" | Extra endpoint, extra request |
| C: Embed selectively with `?include=insights` query param | Flexible | More complex API |

**Chosen: Option B** — Insights are opt-in (user clicks info icon). Most users may never click them. Loading them on-demand keeps the main blueprint response lean and avoids paying the cost for every page load. The insights endpoint can be cached client-side after first fetch.

**Section-to-Plan Mapping Strategy:**

The hardest problem: connecting a rendered section (identified by page index + section index) back to the ContentPlan entry that generated it.

| Option | Pros | Cons |
|--------|------|------|
| A: Index-based matching (section[i] → plan.sections[i]) | Simple, no changes to generation | Breaks if generation reorders/adds/removes sections |
| B: Store contentBrief in section._meta during generation | Reliable, explicit link | Requires generate phase changes |
| C: Slug+heading fuzzy match | No generation changes | Unreliable for sections with similar headings |

**Chosen: Option B** — During the Generate phase, when a section is created from a ContentPlan brief, attach the brief text and target keywords to `section._meta`. This is the most reliable mapping and only requires adding 2-3 fields to each section's metadata during an already-running process.

#### F5: Dashboard Summary — Generated at pipeline completion

```
Pipeline completes (all phases done)
  ↓
generateImpactSummary(researchBrief, contentPlan, blueprint)
  ↓
Returns: string[] (3-5 bullets)
  ↓
Stored in Blueprint.payload._impact
  ↓
Dashboard query includes Blueprint relation:
  prisma.site.findMany({ include: { blueprint: { select: { payload: true } } } })
  ↓
SiteCard extracts _impact from payload
```

**Impact bullet templates:**
```typescript
const bullets: string[] = [];
// Always: tone
bullets.push(`${brief.toneGuidance.primary} tone across all pages`);
// If compliance
if (brief.complianceNotes.length > 0) {
  bullets.push(`${brief.complianceNotes[0]} compliance considerations added`);
}
// If AI added proactive pages
const userSlugs = new Set(onboardingData.pages.map(p => p.slug));
const aiAddedPages = plan.pages.filter(p => !userSlugs.has(p.slug));
if (aiAddedPages.length > 0) {
  bullets.push(`${aiAddedPages[0].title} page added — common for ${brief.industry}`);
}
// SEO
bullets.push(`${brief.seoKeywords.length} SEO keywords targeted across ${plan.pages.length} pages`);
```

---

## 4. API Design

### 4.1 New Endpoints

#### `GET /api/ai/research-preview?siteId={siteId}`

**Response (success):**
```json
{
  "success": true,
  "preview": {
    "industry": "Family Dental Practice",
    "targetAudience": {
      "primary": "Families with children in Portland area",
      "painPoints": ["Finding a dentist good with kids", "Insurance transparency", "Convenient scheduling"]
    },
    "toneGuidance": {
      "primary": "Warm and reassuring, avoids clinical jargon",
      "examples": ["We make every visit comfortable...", "Your family's smile starts here..."]
    },
    "seoKeywords": ["family dentist portland", "pediatric dentistry", "cosmetic dentist"],
    "competitivePositioning": "Your site will emphasize: kid-friendly approach, insurance transparency. Unlike typical dental sites, yours will feature a first-visit guide and FAQ-heavy content.",
    "pageStrategy": [
      { "slug": "home", "sectionCount": 6, "keyFeature": "Hero + services overview + testimonials" },
      { "slug": "services", "sectionCount": 5, "keyFeature": "4 service cards with detailed sections" }
    ]
  },
  "cached": false,
  "durationMs": 12400
}
```

**Response (failure — graceful):**
```json
{
  "success": false,
  "error": "Research preview timed out. You can still generate — the AI will run its full analysis.",
  "cached": false
}
```

#### `GET /api/blueprint/{siteId}/insights`

**Response:**
```json
{
  "researchBrief": {
    "industry": "Family Dental Practice",
    "toneGuidance": { "primary": "...", "avoid": ["..."], "examples": ["..."] },
    "seoKeywords": ["family dentist portland", "..."],
    "targetAudience": { "primary": "...", "painPoints": ["..."] }
  },
  "contentPlan": {
    "pages": [
      {
        "slug": "home",
        "targetKeywords": ["family dentist portland"],
        "sections": [
          { "heading": "Hero", "contentBrief": "Welcome message emphasizing family-friendly care", "type": "hero" },
          { "heading": "Our Services", "contentBrief": "Overview of 4 main services", "type": "features" }
        ]
      }
    ]
  },
  "reviewScores": [
    {
      "page": "home",
      "score": 0.92,
      "passed": true,
      "checks": { "passed": 15, "failed": 2, "total": 17 }
    }
  ]
}
```

### 4.2 Enriched Existing Endpoints

#### `/api/ai/analyze` — add to response:
```json
{
  "industry": "dental",
  "keywords": ["family dentist", "pediatric"],
  "compliance_flags": ["hipaa"],
  "detectedServices": ["general dentistry", "cosmetic procedures", "pediatric care", "teeth whitening"]
}
```

#### `/api/ai/suggest-audiences` — add to response:
```json
{
  "suggestions": ["Families with young children", "..."],
  "painPoints": ["Finding a dentist who's good with kids", "Insurance/cost transparency", "Convenient scheduling"]
}
```

#### `/api/provision/status` — enrich pipeline phase summaries:
```json
{
  "pipeline": {
    "research": {
      "status": "complete",
      "durationMs": 12400,
      "summary": "Identified your practice as family dentistry with pediatric focus. Found 3 key customer pain points. Noted HIPAA compliance considerations."
    },
    "plan": {
      "status": "complete",
      "durationMs": 8200,
      "summary": "Organized 6 pages with 28 content sections. Added FAQ page — dental practices see higher engagement with FAQ content."
    },
    "generate": {
      "status": "in_progress",
      "currentPage": "Services",
      "pageProgress": "3/6",
      "summary": "Writing Services page using your warm, reassuring tone. Targeting 'cosmetic dentistry portland'."
    }
  }
}
```

---

## 5. Component Architecture

### 5.1 New Components

```
platform-app/src/components/onboarding/
  InferenceCard.tsx          # F1: Reusable card (desktop + mobile bottom sheet)
  StrategyPreview.tsx        # F2: Collapsible panel for review-settings
  StrategyPreviewSkeleton.tsx # F2: Loading state

platform-app/src/app/onboarding/review/components/
  SectionInsight.tsx         # F4: Tooltip/popover per section
  PageInsights.tsx           # F4: Slide-out panel per page

platform-app/src/components/dashboard/
  ImpactSummary.tsx          # F5: Bullet list on site card
```

### 5.2 Component Data Flow

```
InferenceCard
  Props: { title, items[], explanation, onConfirm, onEdit, isLoading }
  Data source: API response from parent step component
  No internal fetching — pure presentation

StrategyPreview
  Props: { siteId }
  Internal: useSWR('/api/ai/research-preview?siteId=...')
  Renders: page strategy, tone, keywords, positioning
  States: loading (skeleton) | loaded | error (hidden)

SectionInsight
  Props: { sectionIndex, pageSlug, insightsData }
  Data source: Parent fetches /api/blueprint/{siteId}/insights once, passes down
  Renders: popover on desktop, bottom sheet on mobile

PageInsights
  Props: { pageSlug, insightsData, blueprintPage }
  Derives: word count (from props_json), link count, keyword matches
  Renders: slide-out panel
```

---

## 6. Caching Strategy

### 6.1 Research Preview Cache

**Cache key:** SHA-256 hash of: `idea + audience + industry + tone + JSON(pages) + differentiators + JSON(followUpAnswers)`

**Cache storage:** `OnboardingSession.researchPreview` (Json) + `OnboardingSession.previewInputHash` (String)

**Invalidation:** The `/api/onboarding/save` endpoint runs on every step save. Add logic:
```typescript
// In save endpoint, after merging data:
const PREVIEW_RELEVANT_FIELDS = ['idea', 'audience', 'industry', 'tone', 'pages', 'differentiators', 'followUpAnswers'];
const inputsChanged = PREVIEW_RELEVANT_FIELDS.some(f =>
  JSON.stringify(oldData[f]) !== JSON.stringify(newData[f])
);
if (inputsChanged) {
  await prisma.onboardingSession.update({
    where: { id: session.id },
    data: { researchPreview: null, previewInputHash: null }
  });
}
```

**Re-use during generation:**
```typescript
// In orchestrator.ts, before Research phase:
const session = await prisma.onboardingSession.findFirst({ where: { siteId } });
const currentHash = computeInputHash(onboardingData);
if (session?.researchPreview && session?.previewInputHash === currentHash) {
  // Skip AI call, use cached preview as ResearchBrief
  const brief = await prisma.researchBrief.create({
    data: { siteId, content: session.researchPreview, model: 'cached', provider: 'cache', version: nextVersion }
  });
  return brief;
}
// Otherwise, run Research phase normally
```

### 6.2 Insights API Cache

Client-side only via SWR:
```typescript
const { data: insights } = useSWR(
  showInsights ? `/api/blueprint/${siteId}/insights` : null,
  fetcher,
  { revalidateOnFocus: false }  // Don't re-fetch on tab switch
);
```

No server-side caching needed — the data is read from existing DB records (ResearchBrief, ContentPlan, Blueprint._review) which don't change after generation.

---

## 7. Performance Considerations

| Concern | Mitigation |
|---------|-----------|
| Research preview adds 10-20s to review-settings page load | Non-blocking: page renders immediately, preview loads async. Generate button always available. |
| Enriched analyze/suggest-audiences may increase latency | Keep prompt additions to <100 tokens. Target <500ms added. Measure before/after. |
| Status API now reads 3 extra tables per poll | Queries are by siteId (indexed). At 2s intervals, this is ~0.5ms overhead. Negligible. |
| Insights API reads 3 tables | One-time fetch, cached client-side. ~50ms query time. |
| Blueprint payload grows with _meta on sections | ~200 bytes per section × 30 sections = ~6KB. Within JSON column limits. |

### 7.1 Future Optimization: Eager Research Preview

Not in scope for v1, but noted for follow-up: Run the Research preview in the background after the Audience step (step 5 of 12). By the time the user reaches review-settings (step 12), the preview is ready with 0 wait time. This requires:
- Background task spawning from the save endpoint
- A mechanism to check if the background task completed before the user arrives at review-settings
- Careful handling of race conditions if the user changes inputs after the background task starts

---

## 8. Error Handling & Graceful Degradation

Every transparency feature is **additive and non-blocking**:

| Feature | Failure Mode | Degradation |
|---------|-------------|-------------|
| F1: Inference Cards | analyze API fails | Card doesn't appear; user proceeds normally |
| F2: Strategy Preview | Preview timeout/error | "Preview unavailable" note; Generate button still works |
| F3: Generation Narrative | Summary generation throws | Falls back to existing generic summaries |
| F4: Section Tooltips | Insights API fails | Info icon hidden or shows "Insights unavailable" |
| F4: Section Tooltips | ContentPlan missing sections | Shows partial data (review scores only) |
| F5: Dashboard Summary | _impact missing from payload | Impact section hidden on site card |

---

## 9. Architecture Decision Records

### ADR-1: Enrich Existing APIs vs. New Inference Endpoint

**Context:** F1 (Inference Cards) needs AI-inferred data shown on input steps.
**Decision:** Enrich existing `/api/ai/analyze` and `/api/ai/suggest-audiences` responses.
**Rationale:** These endpoints already call the AI. Adding fields to the same prompt is cheaper and faster than a separate endpoint. The inference card appears in the same component that triggers the API call, so the coupling is natural and doesn't create architectural debt.

### ADR-2: Research Preview Cached on OnboardingSession

**Context:** F2 needs a Research preview that can be re-used during generation.
**Decision:** Store preview as Json field on OnboardingSession with an input hash for invalidation.
**Rationale:** The preview is inherently tied to the session's input state. Storing it on the session record makes invalidation trivial (the save endpoint already touches this record). A separate table would over-engineer a single-use cache. Using the existing ResearchBrief table would create semantic confusion between "preview" and "committed" briefs.

### ADR-3: Rich Summaries Derived at Query Time, Not Stored

**Context:** F3 needs human-readable phase summaries for the progress page.
**Decision:** The status API builds summaries from existing ResearchBrief/ContentPlan/Blueprint records at query time using template functions.
**Rationale:** The source data (ResearchBrief, ContentPlan) is already persisted. Building summaries at query time means they're always consistent with the data. Storing summaries separately would create stale-data risk. The computational cost of template-based string formatting is negligible at 2-second polling intervals.

### ADR-4: Separate Insights Endpoint for Review Tooltips

**Context:** F4 needs ResearchBrief + ContentPlan + review scores available in the review editor.
**Decision:** New `/api/blueprint/{siteId}/insights` endpoint, fetched on-demand when user clicks an info icon.
**Rationale:** This data (~10-20KB) would bloat the primary blueprint response that every review page load needs. Since tooltips are opt-in (most users may never click them), loading on-demand is more efficient. SWR caching ensures only one fetch per session.

### ADR-5: Section Metadata Attached During Generation

**Context:** F4 tooltips need to map rendered sections back to ContentPlan briefs.
**Decision:** During the Generate phase, attach `_meta.contentBrief`, `_meta.targetKeywords`, and `_meta.imageQuery` to each section in the blueprint payload.
**Rationale:** Index-based matching (section[i] → plan.sections[i]) is fragile — the generation phase may reorder, merge, or add sections. Explicitly tagging each section with its source data during creation is the most reliable approach. The additional payload size is ~200 bytes per section, well within JSON column limits.

---

## 10. Migration Path

All changes are additive:

1. **Prisma migration:** Add `researchPreview Json?` and `previewInputHash String?` to OnboardingSession
2. **Blueprint payload:** New `_meta` and `_impact` fields are optional JSON — no migration needed for existing blueprints
3. **API enrichment:** New response fields are additive — existing consumers ignore unknown fields
4. **New endpoints:** `/api/ai/research-preview` and `/api/blueprint/{siteId}/insights` are new routes
5. **UI components:** All new components — no changes to existing component contracts

**Rollback:** All features can be feature-flagged independently since they're non-blocking UI additions.

---

## 11. Handoff

- `/drupal-architect` — No Drupal-side changes needed for this milestone. All features are in the Next.js platform layer.
- `/dev TASK-390` — Begin implementation with the Research Preview API (Sprint 34). The architecture above provides the caching strategy, API contracts, and data flow for each task.
- `/architect` — Follow-up needed if eager preview (Section 7.1) is prioritized in a future sprint.
