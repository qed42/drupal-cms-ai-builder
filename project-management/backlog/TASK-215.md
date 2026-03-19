# TASK-215: Research Phase Implementation

**Story:** US-039
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M7 — AI Content Pipeline

## Description
Implement the Research phase that analyzes the user's business input and produces a structured ResearchBrief. This is the first phase of the content pipeline.

## Technical Approach
- Create `platform-app/src/lib/pipeline/phases/research.ts`
- Build research prompt from: idea, industry, audience, differentiators, follow-up answers, reference URLs, existing copy
- Call `generateValidatedJSON<ResearchBrief>(provider, prompt, researchBriefSchema)`
- Store result in `research_briefs` table with model, provider, and duration metadata
- Create `platform-app/src/lib/ai/prompts/research.ts` — prompt builder
- Research brief includes: industry terminology, compliance flags, positioning analysis, content themes per page, SEO opportunities, tone guidelines
- Target: < 15 seconds (NFR-01)

## Acceptance Criteria
- [ ] Research phase produces a valid ResearchBrief from onboarding data
- [ ] Brief stored in research_briefs table with version 1
- [ ] Brief includes industry-specific terminology and compliance flags
- [ ] Phase completes within 15 seconds
- [ ] Research prompt uses all available onboarding data (differentiators, follow-ups, etc.)

## Dependencies
- TASK-210 (AI Provider Interface)
- TASK-213 (Structured Output Validation)
- TASK-214 (Pipeline Data Models)

## Files/Modules Affected
- `platform-app/src/lib/pipeline/phases/research.ts` (new)
- `platform-app/src/lib/ai/prompts/research.ts` (new)
