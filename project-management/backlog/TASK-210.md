# TASK-210: AI Provider Interface & Factory

**Story:** US-038
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M7 — AI Content Pipeline

## Description
Create the AI provider abstraction layer with a common interface, factory function, and environment variable configuration. This replaces the hardcoded OpenAI usage in the current generator.

## Technical Approach
- Create `platform-app/src/lib/ai/provider.ts` — `AIProvider` interface with `generateJSON<T>()` and `generateText()` methods
- Create `platform-app/src/lib/ai/factory.ts` — `getAIProvider(phase?)` factory that reads `AI_PROVIDER`, `AI_MODEL`, and `AI_MODEL_{PHASE}` env vars
- Define `GenerateOptions` interface: `{ model?, temperature?, maxTokens?, retries?, phase? }`
- Implement exponential backoff with jitter for rate limit (HTTP 429) handling in base provider
- Add env var documentation to `.env.example`

## Acceptance Criteria
- [ ] `AIProvider` interface defined with `generateJSON` and `generateText` methods
- [ ] Factory returns correct provider based on `AI_PROVIDER` env var
- [ ] Per-phase model override works via `AI_MODEL_RESEARCH`, `AI_MODEL_PLAN`, `AI_MODEL_GENERATE`
- [ ] Rate limit retry with exponential backoff implemented
- [ ] `.env.example` updated with new env vars

## Dependencies
- None (foundation task)

## Files/Modules Affected
- `platform-app/src/lib/ai/provider.ts` (new)
- `platform-app/src/lib/ai/factory.ts` (new)
- `platform-app/.env.example` (modify)
