# TASK-341: AI Transparency Patterns Research

**Story:** US-063
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M18 — UX Revamp

## Description
Research how AI-powered products communicate "what the AI is thinking" to users. Identify lightweight patterns for showing AI interpretation of user inputs without additional API calls — using data already computed during onboarding.

## Technical Approach
1. Audit AI transparency patterns in: ChatGPT, Jasper, Copy.ai, Midjourney, Perplexity, GitHub Copilot
2. Document patterns: streaming text, confidence indicators, "AI is learning X" cards, processing animations
3. Map each pattern to feasibility in our context (no extra API calls — insight from existing session state)
4. Catalog which onboarding steps already compute AI-derived data:
   - `idea` step → industry analysis from `/api/ai/analyze`
   - `pages` step → page suggestions from `/api/ai/suggest-pages`
   - `brand` step → color extraction from `/api/ai/extract-colors`
   - `audience`/`tone` steps → metadata already in session
5. Propose insight card copy templates for each step
6. Deliver research document

## Acceptance Criteria
- [ ] Research covers at least 5 AI products
- [ ] Document maps insights to each of our 11 onboarding steps
- [ ] Copy templates provided for insight cards at each applicable step
- [ ] Feasibility assessment confirming no new API endpoints needed

## Dependencies
- None

## Files/Modules Affected
- `project-management/sprint-outputs/s25-ai-transparency-research.md` (new)
