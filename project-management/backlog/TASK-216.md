# TASK-216: Plan Phase Implementation

**Story:** US-040
**Priority:** P0
**Estimated Effort:** L
**Milestone:** M7 — AI Content Pipeline

## Description
Implement the Plan phase that uses the research brief to generate a structured content plan with per-page outlines, SEO keywords, CTAs, and word count targets.

## Technical Approach
- Create `platform-app/src/lib/pipeline/phases/plan.ts`
- Build plan prompt from: onboarding data (site name, pages, tone) + ResearchBrief
- Call `generateValidatedJSON<ContentPlan>(provider, prompt, contentPlanSchema)`
- Store result in `content_plans` table with reference to research brief
- Create `platform-app/src/lib/ai/prompts/plan.ts` — prompt builder
- Content plan includes: site map, per-page section outlines, word count targets, SEO keywords, CTA strategy, tone guidelines
- Target: < 15 seconds (NFR-02)

## Acceptance Criteria
- [ ] Plan phase produces a valid ContentPlan from research brief + onboarding data
- [ ] Plan stored in content_plans table linked to research brief
- [ ] Each page has sections with estimated word counts and key messages
- [ ] SEO keywords defined per page (2-3 primary)
- [ ] Phase completes within 15 seconds

## Dependencies
- TASK-215 (Research Phase)
- TASK-214 (Pipeline Data Models)

## Files/Modules Affected
- `platform-app/src/lib/pipeline/phases/plan.ts` (new)
- `platform-app/src/lib/ai/prompts/plan.ts` (new)
