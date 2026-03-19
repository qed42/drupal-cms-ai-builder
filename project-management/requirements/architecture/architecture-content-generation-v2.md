# Architecture: Content Generation v2

## AI Content Pipeline, Review Workflow & Provisioning Enhancements

**Version:** 1.0
**Date:** 2026-03-19
**Status:** Draft
**Scope:** US-033 through US-062 (Milestones M6–M10)
**Builds on:** [architecture-overview.md](architecture-overview.md) (Platform v2.0)

---

## 1. System Context — What Changes

The existing three-layer architecture (Next.js Platform → Provisioning Engine → Drupal Multisite) remains unchanged. Content Generation v2 modifies the **Next.js Platform layer only** — adding a multi-phase AI pipeline, a content review page, and enhanced provisioning status tracking.

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        Next.js Platform App                               │
│                                                                           │
│  ┌──────────────┐  ┌────────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ Onboarding   │  │ AI Content     │  │  Content   │  │  Dashboard   │  │
│  │ Wizard       │  │ Pipeline       │  │  Review    │  │              │  │
│  │ (enhanced)   │  │ (NEW)          │  │  (NEW)     │  │              │  │
│  └──────┬───────┘  └───────┬────────┘  └─────┬──────┘  └──────────────┘  │
│         │                  │                  │                            │
│         │         ┌────────┴────────┐         │                            │
│         │         │ AI Provider     │         │                            │
│         │         │ Abstraction     │         │                            │
│         │         │ (NEW)           │         │                            │
│         │         └────────┬────────┘         │                            │
│         │                  │                  │                            │
│         │         ┌────────┴────────┐         │                            │
│         │         │  OpenAI    │  Anthropic   │                            │
│         │         └─────────────────┘         │                            │
│         │                                     │                            │
│  ┌──────┴─────────────────────────────────────┴──────────────────────────┐│
│  │                       PostgreSQL                                       ││
│  │  users │ sites │ blueprints │ research_briefs │ content_plans │ ...    ││
│  └────────────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────────────┘
         │
         │  Spawns provisioning (unchanged)
         ▼
┌────────────────────────┐        ┌────────────────────────┐
│  Provisioning Engine   │───────▶│  Drupal CMS Multisite  │
│  (enhanced status      │        │  (unchanged)           │
│   reporting)           │        │                        │
└────────────────────────┘        └────────────────────────┘
```

**Key principle:** Drupal remains a pure site runtime. All new content generation intelligence lives in the Next.js platform.

---

## 2. Architecture Style

No change to the overall architecture style. The platform continues to use:
- **Decoupled headless pattern** — Next.js for user-facing UI, Drupal for site runtime
- **Background process spawning** — Provisioning engine runs as a detached child process
- **Polling-based status** — Client polls API for generation/provisioning progress

**New patterns introduced:**
- **Pipeline pattern** — Sequential phase execution (Research → Plan → Generate) with persistence between phases
- **Provider abstraction** — Strategy pattern for AI provider switching
- **Optimistic UI updates** — Review page auto-saves edits with debounce

---

## 3. Component Architecture

### 3.1 New Components

#### AI Provider Abstraction (`platform-app/src/lib/ai/`)

```
src/lib/ai/
├── provider.ts              # AIProvider interface + factory
├── providers/
│   ├── openai.ts            # OpenAI implementation
│   └── anthropic.ts         # Anthropic implementation
├── client.ts                # Existing OpenAI client (refactored)
├── validation.ts            # Zod schema validation + retry logic
└── prompts/
    ├── research.ts          # Research phase prompt builder
    ├── plan.ts              # Plan phase prompt builder
    ├── page-generation.ts   # Per-page content generation prompt
    ├── section-regeneration.ts  # Per-section regen prompt
    ├── content-generation.ts    # Existing (kept for v1 compat)
    ├── page-layout.ts           # Existing (kept for v1 compat)
    └── form-generation.ts       # Existing (kept for v1 compat)
```

**Interface:**

```typescript
interface AIProvider {
  name: 'openai' | 'anthropic';

  generateJSON<T>(
    prompt: string,
    schema: ZodSchema<T>,
    options?: GenerateOptions
  ): Promise<T>;

  generateText(
    prompt: string,
    options?: GenerateOptions
  ): Promise<string>;
}

interface GenerateOptions {
  model?: string;
  temperature?: number;  // default 0.3
  maxTokens?: number;
  retries?: number;      // default 2
  phase?: 'research' | 'plan' | 'generate';  // for per-phase model selection
}

// Factory
function getAIProvider(phase?: string): AIProvider;
// Uses: AI_PROVIDER env var + AI_MODEL / AI_MODEL_{PHASE} overrides
```

**Trade-offs considered:**

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **A. Vercel AI SDK** | Standardized provider interface, streaming support, well-maintained | Additional dependency, may not support all structured output modes we need | **Rejected** — too much abstraction for our needs, and we need fine control over structured output per provider |
| **B. Custom thin abstraction** | Minimal code, full control, no extra dependencies | Must maintain both provider implementations | **Selected** — two providers is manageable; we need precise control over JSON schema enforcement |
| **C. LangChain.js** | Rich ecosystem, built-in retry/fallback | Heavy dependency, complex API surface, overkill | **Rejected** — over-engineered for two providers with three methods |

#### Content Pipeline (`platform-app/src/lib/pipeline/`)

```
src/lib/pipeline/
├── orchestrator.ts          # Runs Research → Plan → Generate sequentially
├── phases/
│   ├── research.ts          # Research phase logic + persistence
│   ├── plan.ts              # Plan phase logic + persistence
│   └── generate.ts          # Per-page generation logic + persistence
├── types.ts                 # ResearchBrief, ContentPlan, PipelineState
└── status.ts                # Phase status management for polling
```

The orchestrator replaces the current `generateBlueprint()` function in `generator.ts`. The existing function is preserved for backward compatibility (v1 sites).

#### Content Review UI (`platform-app/src/app/onboarding/review/`)

```
src/app/onboarding/review/
├── page.tsx                 # Review page (server component)
├── components/
│   ├── PagePreview.tsx      # Collapsible page content preview
│   ├── SectionEditor.tsx    # Inline text editing per section
│   ├── RegenerateButton.tsx # Per-section/page AI regeneration
│   ├── PageSidebar.tsx      # Navigation sidebar with page list
│   ├── VersionDiff.tsx      # Side-by-side comparison view
│   ├── ApproveButton.tsx    # "Approve & Build Site" with view tracking
│   └── DownloadMenu.tsx     # JSON/Markdown/PDF download options
└── hooks/
    ├── useAutoSave.ts       # Debounced auto-save hook
    ├── useRegenerate.ts     # Section/page regeneration hook
    └── usePageTracking.ts   # Track which pages user has viewed
```

### 3.2 Modified Components

| Component | Change |
|-----------|--------|
| `onboarding/` pages | Add new steps: follow-up questions, differentiators/tone, reference URLs |
| `api/onboarding/suggest-pages/` | Return `{ title, description }[]` instead of just titles |
| `api/provision/status/` | Add `currentStep`, `stepTimings`, `stepError` fields |
| `provisioning/src/provision.ts` | Add per-step timing instrumentation, resume-from-step support |
| `prisma/schema.prisma` | New models: `ResearchBrief`, `ContentPlan`, `BlueprintVersion` |

---

## 4. Data Architecture

### 4.1 New Prisma Models

```prisma
model ResearchBrief {
  id          String   @id @default(cuid())
  siteId      String
  version     Int      @default(1)
  content     Json                          // Structured research findings
  model       String                        // e.g., "gpt-4o-mini"
  provider    String                        // "openai" or "anthropic"
  durationMs  Int?                          // Generation time
  createdAt   DateTime @default(now())

  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@unique([siteId, version])
  @@map("research_briefs")
}

model ContentPlan {
  id              String   @id @default(cuid())
  siteId          String
  researchBriefId String
  version         Int      @default(1)
  content         Json                      // Structured content plan
  model           String
  provider        String
  durationMs      Int?
  createdAt       DateTime @default(now())

  site          Site          @relation(fields: [siteId], references: [id], onDelete: Cascade)
  researchBrief ResearchBrief @relation(fields: [researchBriefId], references: [id])

  @@unique([siteId, version])
  @@map("content_plans")
}

model BlueprintVersion {
  id          String   @id @default(cuid())
  blueprintId String
  version     Int      @default(1)
  label       String   @default("original")   // "original", "edited", "regenerated"
  payload     Json
  createdAt   DateTime @default(now())

  blueprint Blueprint @relation(fields: [blueprintId], references: [id], onDelete: Cascade)

  @@unique([blueprintId, version])
  @@map("blueprint_versions")
}
```

**Changes to existing models:**

```prisma
model Site {
  // ... existing fields ...
  pipelinePhase     String?    // "research" | "plan" | "generate" | "review" | "provisioning"
  pipelineError     String?

  // New relations
  researchBriefs  ResearchBrief[]
  contentPlans    ContentPlan[]
}

model Blueprint {
  // ... existing fields ...
  generationStep  String   @default("pending")  // Extended: "research" | "plan" | "generating_page_1" | ...
  originalPayload Json?                          // Preserved when user edits

  versions BlueprintVersion[]
}
```

### 4.2 Data Flow

```
Onboarding Data (OnboardingSession.data JSON)
    │
    │  Enhanced with: follow-up answers, differentiators, tone, reference URLs
    │
    ▼
┌─────────────────────┐
│  1. RESEARCH PHASE  │  Input: onboarding data
│                     │  Output: ResearchBrief record
│  1 AI call          │  Stored: research_briefs table
│  ~10-15s            │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  2. PLAN PHASE      │  Input: onboarding data + ResearchBrief
│                     │  Output: ContentPlan record
│  1 AI call          │  Stored: content_plans table
│  ~10-15s            │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  3. GENERATE PHASE  │  Input: onboarding data + ResearchBrief + ContentPlan
│                     │  Output: Enhanced BlueprintBundle
│  N AI calls         │  Stored: blueprints table (payload) + blueprint_versions
│  (1 per page)       │
│  ~60-120s           │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  4. REVIEW          │  User reviews, edits, regenerates
│  (User-driven)      │  Edits: update blueprints.payload, preserve original
│                     │  Regeneration: single AI call per section/page
└─────────┬───────────┘
          │  "Approve & Build Site"
          ▼
┌─────────────────────┐
│  5. PROVISION       │  Uses edited blueprint (if any edits) or original
│  (11 steps)         │  Enhanced with step-level status + timing
│  ~2.5 min           │
└─────────────────────┘
```

### 4.3 Research Brief Schema

```typescript
interface ResearchBrief {
  industry: {
    name: string;
    terminology: string[];           // e.g., ["cosmetic dentistry", "dental implants"]
    commonPageStructures: string[];  // e.g., ["Services with procedure details"]
    contentPatterns: string[];       // e.g., ["Before/after descriptions"]
  };
  compliance: {
    flags: string[];                 // e.g., ["HIPAA", "ADA"]
    disclaimers: string[];           // Required disclaimer text
  };
  positioning: {
    differentiators: string[];       // From user input + AI analysis
    audienceSegments: string[];      // Parsed from audience input
    competitiveContext: string;      // Industry positioning summary
  };
  contentThemes: {
    perPage: Record<string, string[]>;  // page slug → key topics
  };
  seoOpportunities: {
    primaryKeywords: string[];
    longTailKeywords: string[];
  };
  toneGuidelines: {
    selectedTone: string;            // User's selection
    industryAdjustments: string;     // How tone adapts to industry norms
  };
}
```

### 4.4 Content Plan Schema

```typescript
interface ContentPlan {
  siteMap: Array<{
    slug: string;
    title: string;
    purpose: string;                 // What this page achieves
  }>;
  pages: Record<string, PagePlan>;   // Keyed by slug
  toneVoice: {
    summary: string;                 // 2-3 sentence voice description
    doList: string[];                // "Use warm, conversational language"
    dontList: string[];              // "Avoid clinical jargon"
  };
}

interface PagePlan {
  slug: string;
  title: string;
  purpose: string;
  seoKeywords: string[];             // 2-3 primary keywords
  targetWordCount: number;
  cta: {
    text: string;
    purpose: string;
  };
  sections: Array<{
    heading: string;
    componentType: string;           // Suggested component (hero, text-block, card-grid, etc.)
    keyMessages: string[];
    estimatedWords: number;
    contentSource?: string;          // "generate" | "content_type:service" | "content_type:team_member"
  }>;
}
```

---

## 5. API Design

### 5.1 New API Endpoints

#### Pipeline Status API (enhancement to existing)

```
GET /api/provision/status?siteId={id}

Response (enhanced):
{
  "site": { "id": "...", "status": "generating", "pipelinePhase": "plan" },
  "blueprint": { "status": "generating", "generationStep": "plan" },
  "pipeline": {
    "research": { "status": "complete", "durationMs": 8200, "summary": "..." },
    "plan": { "status": "in_progress", "startedAt": "...", "elapsed": 4500 },
    "generate": { "status": "pending" }
  },
  "provisioning": {
    "currentStep": 4,
    "steps": [
      { "name": "create-database", "label": "Setting up your database", "status": "complete", "durationMs": 1200 },
      { "name": "install-drupal", "label": "Installing Drupal CMS", "status": "in_progress", "startedAt": "..." },
      // ...
    ]
  }
}
```

#### Blueprint Edit API

```
PATCH /api/blueprint/{id}/edit
Body: { "pageIndex": 0, "sectionIndex": 1, "props": { "title": "New Title" } }
Response: { "success": true }
```

#### Section Regeneration API

```
POST /api/blueprint/{id}/regenerate-section
Body: { "pageIndex": 0, "sectionIndex": 1, "guidance": "Make this more formal" }
Response: { "section": { ...regenerated section... }, "previousSection": { ...for undo... } }
```

#### Page Regeneration API

```
POST /api/blueprint/{id}/regenerate-page
Body: { "pageIndex": 0, "guidance": "Focus on pediatric services" }
Response: { "page": { ...regenerated page... }, "previousPage": { ...for undo... } }
```

#### Page Add/Remove API

```
POST /api/blueprint/{id}/add-page
Body: { "title": "Smile Gallery", "description": "Before/after photos of cosmetic work" }
Response: { "page": { ...generated page... }, "pageIndex": 6 }

DELETE /api/blueprint/{id}/remove-page
Body: { "pageIndex": 5 }
Response: { "success": true }
```

#### Phase Re-run API

```
POST /api/pipeline/{siteId}/rerun
Body: { "phase": "research" | "plan" | "generate" }
Response: { "status": "started", "invalidatedPhases": ["plan", "generate"] }
```

### 5.2 Existing API Changes

| Endpoint | Change |
|----------|--------|
| `POST /api/onboarding/new` | Accept new fields: `followUpAnswers`, `differentiators`, `tone`, `referenceUrls`, `existingCopy` |
| `GET /api/onboarding/suggest-pages` | Return `{ title: string, description: string }[]` |
| `GET /api/provision/status` | Add `pipeline` and `provisioning.steps` fields |
| `POST /api/provision/callback` | Accept `stepTimings` array in callback payload |

---

## 6. Onboarding Wizard Flow (Enhanced)

### 6.1 Current Flow (7 steps)

```
start → name → idea → audience → pages → design → brand → fonts → [generate] → progress → dashboard
```

### 6.2 v2 Flow (9-10 steps)

```
start → name → idea → audience → pages (enhanced) → design → brand → fonts
    → follow-up-questions (NEW) → tone-selection (NEW)
    → [generate: Research → Plan → Generate]
    → review (NEW)
    → [provision]
    → progress (enhanced)
    → dashboard
```

**New onboarding steps:**

| Step | Path | Data Captured |
|------|------|---------------|
| Follow-up Questions | `/onboarding/follow-up` | Industry-specific Q&A (2-4 questions from JSON config) |
| Tone & Differentiators | `/onboarding/tone` | Tone selection (4 samples) + differentiators text + optional reference URLs + optional existing copy |

**Design decision:** Combine differentiators, tone, reference URLs, and existing copy into one step to minimize wizard length. The step has a primary section (tone selection + differentiators, required) and an expandable "Advanced" section (reference URLs + existing copy, optional).

### 6.3 Industry Questions Configuration

```typescript
// src/lib/onboarding/industry-questions.ts

interface IndustryQuestion {
  id: string;
  text: string;
  inputType: 'text' | 'select' | 'multi-select';
  options?: string[];          // For select/multi-select
  placeholder?: string;
}

const INDUSTRY_QUESTIONS: Record<string, IndustryQuestion[]> = {
  healthcare: [
    { id: 'specialties', text: 'What are your top 3 specialties?', inputType: 'text', placeholder: 'e.g., Cosmetic dentistry, dental implants, pediatric care' },
    { id: 'insurance', text: 'Do you accept insurance?', inputType: 'select', options: ['Yes, most major plans', 'Select plans only', 'No insurance accepted'] },
    { id: 'unique', text: 'What makes your practice unique?', inputType: 'text', placeholder: 'e.g., Family-owned for 15 years, sedation dentistry available' },
  ],
  legal: [
    { id: 'practice_areas', text: 'What are your practice areas?', inputType: 'text', placeholder: 'e.g., Family law, personal injury, estate planning' },
    { id: 'consultations', text: 'Do you offer free consultations?', inputType: 'select', options: ['Yes, always', 'For certain case types', 'No'] },
    { id: 'jurisdiction', text: 'What geographic area do you serve?', inputType: 'text' },
  ],
  // ... more industries
  _default: [
    { id: 'services', text: 'What are your top 3 services or products?', inputType: 'text' },
    { id: 'unique', text: 'What makes your business unique?', inputType: 'text' },
  ],
};
```

---

## 7. Content Pipeline Architecture

### 7.1 Pipeline Orchestrator

```typescript
// src/lib/pipeline/orchestrator.ts

async function runContentPipeline(siteId: string, onboardingData: EnhancedOnboardingData): Promise<void> {
  // Phase 1: Research
  await updatePipelinePhase(siteId, 'research', 'in_progress');
  const researchBrief = await runResearchPhase(siteId, onboardingData);
  await updatePipelinePhase(siteId, 'research', 'complete');

  // Phase 2: Plan
  await updatePipelinePhase(siteId, 'plan', 'in_progress');
  const contentPlan = await runPlanPhase(siteId, onboardingData, researchBrief);
  await updatePipelinePhase(siteId, 'plan', 'complete');

  // Phase 3: Generate (per-page)
  await updatePipelinePhase(siteId, 'generate', 'in_progress');
  const blueprint = await runGeneratePhase(siteId, onboardingData, researchBrief, contentPlan);
  await updatePipelinePhase(siteId, 'generate', 'complete');

  // Transition to review
  await prisma.site.update({ where: { id: siteId }, data: { status: 'review', pipelinePhase: 'review' } });
}
```

### 7.2 Phase Execution Detail

#### Research Phase

```
Input:
  - onboardingData.idea (full text)
  - onboardingData.industry (detected)
  - onboardingData.audience
  - onboardingData.differentiators
  - onboardingData.followUpAnswers
  - onboardingData.referenceUrls (as text context)
  - onboardingData.existingCopy

AI Call:
  provider.generateJSON<ResearchBrief>(researchPrompt, researchBriefSchema)

Output:
  - ResearchBrief stored in research_briefs table
  - Summary displayed to user via pipeline status API
```

#### Plan Phase

```
Input:
  - onboardingData (site name, pages, tone)
  - ResearchBrief (from previous phase)

AI Call:
  provider.generateJSON<ContentPlan>(planPrompt, contentPlanSchema)

Output:
  - ContentPlan stored in content_plans table
  - Collapsible outline displayed to user via pipeline status API
```

#### Generate Phase

```
Input:
  - onboardingData (brand, fonts, etc.)
  - ResearchBrief
  - ContentPlan
  - Per-page: ContentPlan.pages[slug]

AI Calls (1 per page, sequential to manage rate limits):
  for each page in contentPlan.pages:
    provider.generateJSON<EnhancedPageLayout>(pagePrompt, pageSchema)
    // Update status: "Generating Home page..." → "Generating Services page..."

Output:
  - BlueprintBundle with enriched content
  - Stored in blueprints table
  - Original version stored in blueprint_versions table
```

### 7.3 Structured Output Enforcement

```typescript
// src/lib/ai/validation.ts

async function generateValidatedJSON<T>(
  provider: AIProvider,
  prompt: string,
  schema: ZodSchema<T>,
  options?: GenerateOptions
): Promise<T> {
  const maxRetries = options?.retries ?? 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const effectivePrompt = attempt === 0
      ? prompt
      : `${prompt}\n\nPREVIOUS ATTEMPT FAILED VALIDATION:\n${lastError}\n\nPlease fix the output to match the required schema.`;

    const raw = await provider.generateJSON(effectivePrompt, schema, options);
    const result = schema.safeParse(raw);

    if (result.success) return result.data;
    lastError = JSON.stringify(result.error.issues, null, 2);
  }

  throw new Error(`AI output failed validation after ${maxRetries + 1} attempts`);
}
```

### 7.4 Per-Phase Model Selection

```
Environment Variables:
  AI_PROVIDER=openai              # or "anthropic"
  AI_MODEL=gpt-4o-mini            # default for all phases
  AI_MODEL_RESEARCH=gpt-4o-mini   # optional override (cheaper for research)
  AI_MODEL_PLAN=gpt-4o-mini       # optional override
  AI_MODEL_GENERATE=gpt-4o        # optional override (stronger for content)

Resolution:
  getModelForPhase('research') →
    process.env.AI_MODEL_RESEARCH || process.env.AI_MODEL || 'gpt-4o-mini'
```

---

## 8. Content Review Architecture

### 8.1 User Flow

```
/onboarding/review?siteId={id}
    │
    ├── Load blueprint from DB (with research brief + content plan for context)
    ├── Transform blueprint JSON → renderable markdown per page
    ├── Render sidebar (page list) + main content (page preview)
    │
    ├── User interactions:
    │   ├── View pages (tracked for approve gate)
    │   ├── Edit section text → auto-save via PATCH /api/blueprint/{id}/edit
    │   ├── Regenerate section → POST /api/blueprint/{id}/regenerate-section
    │   ├── Regenerate page → POST /api/blueprint/{id}/regenerate-page
    │   ├── Add page → POST /api/blueprint/{id}/add-page
    │   ├── Remove page → DELETE /api/blueprint/{id}/remove-page
    │   ├── Compare versions → client-side diff rendering
    │   └── Download → client-side JSON/markdown/ZIP generation
    │
    └── Approve → POST /api/provision/start (triggers provisioning with reviewed blueprint)
```

### 8.2 Blueprint-to-Markdown Transformation

The review page needs to render blueprint JSON as human-readable content. This is a **client-side transformation** — no server-side rendering needed.

```typescript
// src/lib/blueprint/markdown-renderer.ts

function blueprintPageToMarkdown(page: PageLayout): string {
  return page.sections.map(section => {
    const componentLabel = COMPONENT_LABELS[section.component_id] || section.component_id;
    const props = section.props;

    let md = `### [${componentLabel}]\n\n`;
    if (props.title) md += `**${props.title}**\n\n`;
    if (props.sub_headline) md += `*${props.sub_headline}*\n\n`;
    if (props.description) md += `${props.description}\n\n`;
    // ... handle other prop types (lists, cards, form fields)
    return md;
  }).join('---\n\n');
}

const COMPONENT_LABELS: Record<string, string> = {
  'space_ds:space-hero-banner-style-01': 'Hero Banner',
  'space_ds:space-text-media-default': 'Text Block',
  'space_ds:space-cta-banner-type-1': 'Call to Action',
  'space_ds:space-card-grid': 'Card Grid',
  // ...
};
```

### 8.3 Auto-Save Mechanism

```typescript
// src/app/onboarding/review/hooks/useAutoSave.ts

function useAutoSave(blueprintId: string) {
  const pendingRef = useRef<Record<string, unknown> | null>(null);

  const save = useDebouncedCallback(async (change) => {
    await fetch(`/api/blueprint/${blueprintId}/edit`, {
      method: 'PATCH',
      body: JSON.stringify(change),
    });
  }, 500);

  return { save };
}
```

### 8.4 Version Comparison

Client-side diff using the `diff` npm package:

```typescript
import { diffWords } from 'diff';

function renderDiff(original: string, edited: string): JSX.Element[] {
  const changes = diffWords(original, edited);
  return changes.map((part, i) => (
    <span key={i} className={part.added ? 'bg-green-100' : part.removed ? 'bg-red-100 line-through' : ''}>
      {part.value}
    </span>
  ));
}
```

---

## 9. Provisioning Enhancements

### 9.1 Step-Level Status Tracking

The provisioning engine already executes 11 sequential steps. The enhancement adds timing instrumentation and status reporting.

```typescript
// provisioning/src/provision.ts (enhanced)

interface StepTiming {
  name: string;
  label: string;
  status: 'pending' | 'in_progress' | 'complete' | 'failed';
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
}

// During execution, update step status via callback:
async function executeStep(step: Step, config: Config, timings: StepTiming[]) {
  const timing = timings.find(t => t.name === step.name)!;
  timing.status = 'in_progress';
  timing.startedAt = new Date().toISOString();

  // Report progress via interim callback
  await reportProgress(config, timings);

  try {
    await step.execute(config);
    timing.status = 'complete';
    timing.completedAt = new Date().toISOString();
    timing.durationMs = Date.now() - new Date(timing.startedAt).getTime();
  } catch (err) {
    timing.status = 'failed';
    timing.error = err.message;
    throw err;
  }
}
```

**Status reporting approach:**

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **A. Interim callbacks** — POST step status to platform after each step | Works with existing callback mechanism, no new infrastructure | More HTTP calls, potential auth issues (already solved) | **Selected** — minimal change, leverages existing callback endpoint |
| **B. Shared file** — write status to a JSON file on shared volume, platform reads it | Simple, no network calls | Polling file system is fragile, race conditions | **Rejected** |
| **C. Redis pub/sub** — publish step events, platform subscribes | Real-time, elegant | Requires Redis, over-engineered for 11 events over 2.5 min | **Rejected** |

The callback endpoint is enhanced to accept interim progress reports (not just final success/failure):

```
POST /api/provision/callback
Body: {
  "type": "progress" | "success" | "failure",
  "siteId": "...",
  "stepTimings": [...],
  "currentStep": 4
}
```

### 9.2 Per-Site Database Isolation

```typescript
// provisioning/src/steps/01-create-database.ts (enhanced)

async function createDatabase(config: ProvisioningConfig): Promise<StepResult> {
  const dbName = `site_${config.siteId}`;
  const dbUser = `site_${config.siteId}`;
  const dbPassword = crypto.randomBytes(32).toString('hex');

  // Create database (existing)
  await mysql.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);

  // Create dedicated user (NEW)
  await mysql.query(`CREATE USER IF NOT EXISTS '${dbUser}'@'%' IDENTIFIED BY '${dbPassword}'`);
  await mysql.query(`GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${dbUser}'@'%'`);
  await mysql.query(`FLUSH PRIVILEGES`);

  // Pass credentials to settings.php generation step
  config.dbCredentials = { database: dbName, username: dbUser, password: dbPassword };

  return { success: true, rollback: async () => {
    await mysql.query(`DROP USER IF EXISTS '${dbUser}'@'%'`);
    await mysql.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
  }};
}
```

The generated `settings.php` template is updated to use site-specific credentials instead of root.

### 9.3 Provisioning Resume from Failed Step

```typescript
// provisioning/src/provision.ts (enhanced)

async function runProvisioning(config: ProvisioningConfig) {
  const startFromStep = config.resumeFromStep || 0;

  for (let i = startFromStep; i < STEPS.length; i++) {
    await executeStep(STEPS[i], config, timings);
  }
}
```

The platform stores the last completed step in the `Site` record. When the user clicks "Retry", the provisioning engine is re-spawned with `resumeFromStep` set to the failed step index.

---

## 10. Security Architecture

### 10.1 AI Provider Key Isolation

```
Environment Variables (never in source code or database):
  OPENAI_API_KEY=sk-...
  ANTHROPIC_API_KEY=sk-ant-...

Per environment:
  Dev:     .env.local (gitignored)
  Staging: Container env vars
  Prod:    Secret manager → container env vars
```

### 10.2 Cross-Tenant Data Isolation in AI Prompts

Each AI call includes **only** the requesting user's onboarding data. The prompt builder functions accept a single user's data — there is no mechanism to include cross-tenant data.

```typescript
function buildResearchPrompt(data: OnboardingData): string {
  // Only uses data.idea, data.industry, data.audience, etc.
  // No database queries, no access to other users' data
  return `...`;
}
```

### 10.3 Blueprint Edit Authorization

All review/edit API endpoints verify:
1. User is authenticated (NextAuth session)
2. User owns the site (site.userId === session.user.id)
3. Site is in "review" status

```typescript
// Middleware pattern for all review APIs
async function authorizeReviewAccess(req: Request, siteId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site || site.userId !== session.user.id) throw new Error('Forbidden');
  if (site.status !== 'review') throw new Error('Site is not in review state');

  return site;
}
```

### 10.4 Database Credential Security

Per-site MariaDB credentials:
- Generated in provisioning engine memory (crypto.randomBytes)
- Written to `settings.php` on the shared volume (readable only by the Drupal container)
- Never stored in PostgreSQL
- Never returned by any API endpoint
- Never included in AI prompts

---

## 11. Architecture Decision Records

### ADR-001: Custom AI Provider Abstraction vs. Vercel AI SDK

**Context:** The system needs to support OpenAI and Anthropic with potential for per-phase model selection.

**Options:**
1. Vercel AI SDK — standardized multi-provider interface
2. Custom thin abstraction — two provider implementations behind a shared interface
3. LangChain.js — full-featured AI framework

**Decision:** Custom thin abstraction.

**Rationale:** We need precise control over structured output enforcement (JSON schema for OpenAI, tool use for Anthropic). Vercel AI SDK abstracts this in ways that may not give us the control we need. LangChain is overkill. Two provider implementations (~200 lines each) is manageable and gives us full control.

**Consequences:** We own the maintenance of provider implementations. If we add a third provider, we add another ~200 lines.

---

### ADR-002: Pipeline Phases Persist to Database, Not Just Memory

**Context:** The pipeline runs Research → Plan → Generate sequentially. Should intermediate results be stored?

**Options:**
1. In-memory only — pass data between phases as function arguments
2. Database persistence — store each phase's output as a record

**Decision:** Database persistence.

**Rationale:** Persistence enables: (a) phase re-run without re-running predecessors, (b) model comparison (run same input with different models, compare outputs), (c) debugging content quality issues, (d) status polling from the client between phases. The storage cost is negligible (research briefs ~2KB, content plans ~5KB).

**Consequences:** Three new tables. Prisma migration required. Phase re-run (US-045) is enabled.

---

### ADR-003: Content Review as a Separate Page vs. Integrated into Provisioning Progress

**Context:** Users need to review and edit content before provisioning. Where does this UI live?

**Options:**
1. Separate `/onboarding/review` page — full-screen review with sidebar navigation
2. Inline in the progress page — content preview below the generation progress steps
3. Modal overlay — content preview in a modal over the progress page

**Decision:** Separate `/onboarding/review` page.

**Rationale:** The review experience is the centerpiece of v2 — users will spend 5-15 minutes here. It needs full-screen real estate for the sidebar, content preview, inline editing, and comparison views. Cramming this into the progress page or a modal would compromise the UX for the most important new feature.

**Consequences:** New route in the onboarding flow. The flow becomes: ... → generate (progress page) → review (new page) → provision (progress page). The user transitions between pages, which needs smooth navigation.

---

### ADR-004: Provisioning Progress via Interim Callbacks vs. New Transport

**Context:** Users need step-level provisioning progress. The current system uses a final success/failure callback.

**Options:**
1. Interim callbacks — POST progress to platform after each step completes
2. Shared JSON file — write progress to a file on the shared volume
3. Redis pub/sub — real-time event stream
4. SSE from provisioning engine — direct browser connection to provisioning

**Decision:** Interim callbacks.

**Rationale:** The callback mechanism already exists and works (we just fixed auth in sprint 05c). Adding interim progress reports is ~20 lines of code. The provisioning engine already has the callback URL and API key. 11 HTTP calls over 2.5 minutes is trivial load. Redis and SSE add infrastructure complexity for minimal gain.

**Consequences:** The callback endpoint handles both progress and final status. The platform stores step timings in the site record for the status API to return.

---

### ADR-005: Inline Editing as Plain Textarea (v2) vs. Rich Markdown Editor

**Context:** Users need to edit generated content in the review page. How rich should the editor be?

**Options:**
1. Plain textarea — simple text input for each field
2. Rich markdown editor — toolbar with bold, italic, headings, lists
3. WYSIWYG component editor — edit content as it would appear in Space DS components

**Decision:** Plain textarea (v2.0).

**Rationale:** Building a rich editor is a significant engineering investment (PRD Risk R9). The MVP value is in the ability to *change* text, not in formatting it. Users will do final formatting in Drupal Canvas after provisioning. A textarea with auto-save gives 80% of the value with 20% of the effort.

**Consequences:** Text formatting is limited. Accepted trade-off. Rich editing is deferred to v2.1 per PRD scope.

---

### ADR-006: Per-Page Sequential Generation vs. Parallel

**Context:** The Generate phase makes N AI calls (one per page). Should they run in parallel?

**Options:**
1. Sequential — one page at a time, with per-page status updates
2. Parallel (Promise.all) — all pages simultaneously
3. Batched parallel — 2-3 pages at a time with concurrency control

**Decision:** Sequential generation with per-page status updates.

**Rationale:** Sequential generation provides clear per-page progress ("Generating Home page... Generating Services page...") which is valuable UX. Parallel generation would show all pages as "in progress" simultaneously, which is less informative. AI provider rate limits (especially Anthropic with lower RPM) could cause parallel failures. Sequential is simpler to implement and debug. Total time: ~60-120s for 6 pages — acceptable per NFR-03.

**Consequences:** Generation takes longer than parallel would. If speed becomes critical, we can switch to batched parallel (2-3 concurrent) in a future iteration.

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| AI cost overrun ($0.50/site budget) | Cost tracking per AI call. Use cheaper models for Research/Plan. Hard cap with graceful degradation to v1 pipeline. |
| Provider API outage during pipeline | Phase persistence enables resume. Automatic fallback to alternate provider after 2 retries. |
| Review page edit latency | Optimistic UI updates with background persistence. Auto-save debounce (500ms). |
| Blueprint JSON size increase (50-100KB) | PostgreSQL JSONB handles this easily. Monitor and compress if >500KB. |
| Race condition: user edits while regeneration runs | Disable section editing during regeneration (show spinner). Queue-based edit lock per section. |
| MariaDB max_connections with per-site users | Monitor active connections. Increase `max_connections` to 500+. Connection pooling if needed. |

---

## 13. Migration Strategy

### 13.1 Backward Compatibility

The v1 `generateBlueprint()` function is preserved. Sites generated before v2 continue to work with their existing blueprints. The v2 pipeline is activated for new sites only.

### 13.2 Database Migration

```
prisma migrate:
  1. Add ResearchBrief model
  2. Add ContentPlan model
  3. Add BlueprintVersion model
  4. Add pipelinePhase, pipelineError to Site
  5. Add originalPayload to Blueprint
```

All migrations are additive (new tables + new columns). Zero downtime.

### 13.3 Feature Flag (Optional)

If needed, a `CONTENT_PIPELINE_V2=true` environment variable can gate the new pipeline. Default: `true` after implementation is complete.

---

## Next Steps

Invoke `/drupal-architect` to review this architecture for Drupal-side impacts, then `/tpm sprint` to plan sprints for M6–M10.
