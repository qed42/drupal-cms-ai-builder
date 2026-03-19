# Sprint 11: Content Pipeline — Research & Plan Phases

**Milestone:** M7 — AI Content Pipeline
**Duration:** 1 week
**Prerequisites:** Sprint 09 (provider abstraction, validation, Prisma models) ✅ | Sprint 10 (enhanced onboarding data) ✅

## Sprint Goal
Implement the Research and Plan phases of the content pipeline with a lightweight orchestrator, producing structured research briefs and content plans stored in the database, with a status API to track phase progress.

## Tasks
| ID | Task | Story | Effort | Assignee Persona | Status |
|----|------|-------|--------|-------------------|--------|
| TASK-215 | Research Phase Implementation | US-039 | L | /dev | Done |
| TASK-216 | Plan Phase Implementation | US-040 | L | /dev | Done |
| TASK-219a | Pipeline Phase Status API (Research + Plan only) | US-042 | S | /dev | Done |
| TASK-218a | Research→Plan Mini-Orchestrator | US-039, US-040 | M | /dev | Done |

## Task Details

### TASK-215: Research Phase Implementation (L)
**Files:** `platform-app/src/lib/pipeline/phases/research.ts` (new), `platform-app/src/lib/ai/prompts/research.ts` (new)

Implement the Research phase that analyzes onboarding data (idea, industry, audience, differentiators, follow-up answers, tone selection) and produces a validated `ResearchBrief` via `generateValidatedJSON()`. Store results in `research_briefs` table with model, provider, and duration metadata.

**Acceptance Criteria:**
- [ ] Research phase produces a valid ResearchBrief from onboarding data
- [ ] Brief stored in research_briefs table with version 1
- [ ] Brief includes industry-specific terminology and compliance flags
- [ ] Research prompt uses ALL onboarding data (differentiators, follow-ups, tone, custom pages)
- [ ] Phase completes within 15 seconds (NFR-01)

### TASK-216: Plan Phase Implementation (L)
**Files:** `platform-app/src/lib/pipeline/phases/plan.ts` (new), `platform-app/src/lib/ai/prompts/plan.ts` (new)
**Depends on:** TASK-215

Implement the Plan phase that uses the ResearchBrief + onboarding data to generate a validated `ContentPlan` with per-page section outlines, word count targets, SEO keywords, and CTA strategy.

**Acceptance Criteria:**
- [ ] Plan phase produces a valid ContentPlan from research brief + onboarding data
- [ ] Plan stored in content_plans table linked to research brief
- [ ] Each page has sections with estimated word counts and key messages
- [ ] SEO keywords defined per page (2-3 primary)
- [ ] Phase completes within 15 seconds (NFR-02)

### TASK-218a: Research→Plan Mini-Orchestrator (M)
**Files:** `platform-app/src/lib/pipeline/orchestrator.ts` (new)
**Depends on:** TASK-215, TASK-216

Create a lightweight pipeline orchestrator that chains Research → Plan sequentially. This is the foundation for the full orchestrator (TASK-218, Sprint 12) which will add the Generate phase.

**Acceptance Criteria:**
- [ ] `runPipeline(siteId, onboardingData)` runs Research then Plan sequentially
- [ ] Site.pipelinePhase updates at each transition (research → plan → plan_complete)
- [ ] Errors stop the pipeline and record the error on `Site.pipelineError`
- [ ] Orchestrator is wired into the onboarding submission flow (triggers after final step)
- [ ] v1 `generateBlueprint()` preserved as fallback

### TASK-219a: Pipeline Phase Status API — Research + Plan (S)
**Files:** `platform-app/src/app/api/provision/status/route.ts` (modify)
**Depends on:** TASK-218a

Extend the existing provision/status API to include pipeline phase information for Research and Plan phases. Generate phase tracking will be added in Sprint 12.

**Acceptance Criteria:**
- [ ] Status API returns `pipeline` object with per-phase status
- [ ] Each phase reports: status (pending/in_progress/complete/failed), durationMs, summary
- [ ] Research summary includes key findings from the brief
- [ ] Plan summary includes page count and outline overview
- [ ] Generate phase returns `{ status: "pending" }` placeholder

## Execution Order

```
TASK-215 (Research Phase)
    ↓
TASK-216 (Plan Phase)
    ↓
TASK-218a (Mini-Orchestrator) — chains 215 + 216, wires into onboarding
    ↓
TASK-219a (Status API) — exposes phase progress
```

## Dependencies & Risks
- **RESOLVED:** Original TASK-219 depended on TASK-218 (Sprint 12). Rescoped as TASK-219a to cover Research + Plan only, with TASK-218a providing the lightweight orchestrator Sprint 11 needs.
- TASK-215 → TASK-216 (research brief feeds plan phase) — strict sequential dependency
- TASK-218a → TASK-219a (orchestrator manages phase transitions the API reports on)
- **Risk: Prompt quality** — Research and Plan prompt engineering is iterative. Budget time for 2-3 prompt iterations per phase.
- **Risk: Schema contract** — ContentPlan schema must produce outlines the Generate phase (Sprint 12) can consume. Design the interface with forward compatibility.
- **Risk: Performance** — Each AI call must stay under 15 seconds. If the model is slow, consider reducing schema complexity or using a faster model for research.

## Definition of Done
- [ ] Research phase produces a valid ResearchBrief with industry terminology, compliance flags, and content themes
- [ ] Plan phase produces a valid ContentPlan with per-page outlines, SEO keywords, and word count targets
- [ ] Both phases complete within 15 seconds each
- [ ] Research briefs and content plans stored in database with versioning
- [ ] Mini-orchestrator chains Research → Plan and updates site status
- [ ] Orchestrator wired into onboarding submission flow
- [ ] Status API returns phase-level progress (pending/in_progress/complete/failed)
- [ ] Playwright tests cover the pipeline execution flow
- [ ] All code committed
