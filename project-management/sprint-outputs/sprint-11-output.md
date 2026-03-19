# Sprint 11 QA Report

**Date:** 2026-03-19
**Status:** Pass (after retest) — 2 bugs fixed, 1 closed (not a bug), 1 deferred

## Test Results (Retest)
| Task | Tests Written | Passed | Failed | Notes |
|------|--------------|--------|--------|-------|
| TASK-215 Research Phase | 5 | 5 | 0 | Prompt builder + schema + keywords fix |
| TASK-216 Plan Phase | 6 | 6 | 0 | Prompt builder + schema + wordCount fix |
| TASK-218a Orchestrator | 1 | 1 | 0 | Structural verification (integration requires DB) |
| TASK-219a Status API | 2 | 2 | 0 | Structural verification |
| **Total** | **11** | **11** | **0** | |

## Compilation & Regression
- TypeScript compilation: **PASS** (0 errors, excluding test-only vitest import)
- Sprint 10 regression: **PASS** (17/17 tests pass)
- Sprint 11 unit tests: **PASS** (11/11 tests pass)

## Bugs Filed
| Bug ID | Task | Severity | Description |
|--------|------|----------|-------------|
| BUG-310 | TASK-216 | Major | ContentPlanPageSchema missing wordCountTarget field per section | **Fixed** |
| BUG-311 | TASK-215 | Minor | Research prompt doesn't include `keywords` field from onboarding | **Fixed** |
| BUG-312 | TASK-218a | Minor | Orchestrator missing `research_complete` intermediate transition | **Closed** (not a bug) |
| BUG-313 | TASK-219a | Cosmetic | `originalPayload` not populated for v2 pipeline | Deferred to Sprint 13 |

## Detailed Bug Reports

---

## BUG-310: ContentPlanPageSchema missing wordCountTarget per section

**Task:** TASK-216
**Severity:** Major
**Status:** Open

### Steps to Reproduce
1. Review `platform-app/src/lib/pipeline/schemas.ts` ContentPlanPageSchema section definition
2. Review TASK-216 acceptance criteria: "Each page has sections with estimated word counts and key messages"
3. Review plan prompt builder instructions — mentions "word count targets" in the plan description but schema has no field

### Expected Result
Each section in the ContentPlan should have an `estimatedWordCount` (or similar) field so the Generate phase (Sprint 12) knows how much content to produce per section. The acceptance criteria explicitly requires "sections with estimated word counts."

### Actual Result
`ContentPlanPageSchema.sections` schema only has: `heading`, `type`, `contentBrief`, `componentSuggestion`. No word count field exists. The plan prompt instructions mention word count targets in the task description but the schema doesn't enforce them, so AI output won't include them in a structured way.

### Impact
Sprint 12's Generate phase (TASK-217) needs per-section word count targets to produce the right content depth. Without this, the generator has no guidance on whether a section should be 50 words or 500 words.

### Fix Recommendation
Add `estimatedWordCount: z.number().optional()` to the section schema in `ContentPlanPageSchema`, and update the plan prompt to instruct the AI to include it.

### Test Reference
Code review against TASK-216 acceptance criteria #3

---

## BUG-311: Research prompt doesn't include `keywords` field from onboarding

**Task:** TASK-215
**Severity:** Minor
**Status:** Open

### Steps to Reproduce
1. Review `OnboardingData` type — has `keywords?: string[]` (from v1 analysis step)
2. Review `buildResearchPrompt()` in `platform-app/src/lib/ai/prompts/research.ts`
3. The prompt builder uses: name, idea, audience, industry, tone, differentiators, followUpAnswers, pages, referenceUrls, existingCopy, compliance_flags
4. Missing: `keywords` — the pre-analyzed keywords from the v1 analyze step

### Expected Result
TASK-215 AC #4: "Research prompt uses ALL onboarding data (differentiators, follow-ups, tone, custom pages)." The `keywords` field from the analyze step should also be fed to the research prompt so the AI can incorporate prior keyword analysis.

### Actual Result
`data.keywords` is not included in the research prompt. While `seoKeywords` is in the output schema, the AI doesn't see the existing keyword analysis as input.

### Fix Recommendation
Add a conditional section to `buildResearchPrompt()`:
```typescript
if (data.keywords && data.keywords.length > 0) {
  sections.push(`- **Pre-analyzed Keywords:** ${data.keywords.join(", ")}`);
}
```

### Test Reference
Code review against TASK-215 acceptance criteria #4

---

## BUG-312: Orchestrator skips `research_complete` in status API progress mapping

**Task:** TASK-218a
**Severity:** Minor
**Status:** Open

### Steps to Reproduce
1. Review orchestrator phase transitions: `research` → `research_complete` → `plan` → `plan_complete`
2. Review status API `buildPhaseStatus()` logic
3. When `currentPhase === "research_complete"`, the status API enters `buildPhaseStatus("research", "research_complete", ...)`
4. Since `completedData` is checked first (research brief exists in DB), it returns `"complete"` — this is correct
5. BUT: for the plan phase when `currentPhase === "research_complete"`, `buildPhaseStatus("plan", "research_complete", ...)` returns `{ status: "pending" }` since it's not `"plan"` and not `"plan_failed"`
6. This is actually correct behavior — the plan hasn't started yet

### Expected Result
After further analysis, this is NOT a bug. The `research_complete` phase correctly maps to: research=complete (from DB), plan=pending. The brief moment between research finishing and plan starting is correctly reported.

### Actual Result
Working as intended. **Downgrading to closed.**

**Status:** Closed (not a bug)

---

## BUG-313: Blueprint `originalPayload` not populated for v2 pipeline

**Task:** TASK-219a
**Severity:** Cosmetic
**Status:** Open

### Steps to Reproduce
1. Review Blueprint model: has `originalPayload Json?` field
2. Review v1 `generateBlueprint()` — doesn't set `originalPayload`
3. Review v2 `runV2Pipeline()` — calls `runPipeline()` then `generateBlueprint()`
4. Neither path stores the research brief or content plan as `originalPayload`

### Expected Result
The `originalPayload` field could store the v2 pipeline research/plan outputs for later comparison in the Review phase (Sprint 13-14, TASK-236 "Original Version Preservation").

### Actual Result
`originalPayload` remains null after v2 pipeline runs. This is cosmetic now since Sprint 13 hasn't been built yet, but is a forward-compatibility concern.

### Fix Recommendation
Defer to Sprint 13 (TASK-236). No action needed now — noting for awareness.

### Test Reference
Code review against forward compatibility with Sprint 13/14 tasks

---

## QA Observations (Non-blocking)

### Observation 1: Plan prompt doesn't instruct AI on word counts per section
The plan prompt `buildPlanPrompt()` instructions say "contentBrief: 2-3 sentences describing what content to generate" but never mention word counts. Even if BUG-310 adds the schema field, the prompt also needs updating to instruct the AI to estimate word counts.

### Observation 2: Research phase `temperature: 0.4` vs Plan phase `temperature: 0.3`
Research uses 0.4 (more creative exploration), Plan uses 0.3 (more structured). This seems intentional and appropriate.

### Observation 3: V2 pipeline runs Research→Plan, then the full v1 generateBlueprint
The v2 pipeline currently does redundant work: it runs Research→Plan, then calls v1 `generateBlueprint()` which does its own content generation, page layouts, and forms from scratch. The v1 generator doesn't consume the Research/Plan outputs. This is acceptable as a transitional architecture — Sprint 12 TASK-217 will wire the plan output into generation. But it means pipeline time roughly doubles during Sprint 11.

### Observation 4: No `pipelinePhase` reset on re-generation
If a user re-triggers generation (e.g., going back through onboarding), the `generate-blueprint/route.ts` resets blueprint status but doesn't reset `Site.pipelinePhase`. Old pipeline phase data could leak into the next run. Low risk since the orchestrator sets it to "research" at the start, which would overwrite.

## Summary

**3 actionable bugs** (BUG-310 Major, BUG-311 Minor, BUG-313 deferred):
- **BUG-310 (Major):** Must fix — word count targets are essential for Sprint 12 Generate phase
- **BUG-311 (Minor):** Should fix — keyword data loss reduces research quality
- **BUG-313 (Cosmetic):** Defer to Sprint 13

Invoke `/dev BUG-310` and `/dev BUG-311` to fix the two actionable bugs, then re-run `/qa sprint-11` for retest.
