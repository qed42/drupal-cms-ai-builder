# TASK-212: Anthropic Provider Implementation

**Story:** US-038
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M7 — AI Content Pipeline

## Description
Implement the Anthropic provider class conforming to the AIProvider interface. Uses Anthropic's tool use for structured JSON output and standard messages for text generation.

## Technical Approach
- Install `@anthropic-ai/sdk` package
- Create `platform-app/src/lib/ai/providers/anthropic.ts`
- Implement `generateJSON<T>()` using Anthropic tool use: define a tool with the JSON schema, force tool use, extract structured result
- Implement `generateText()` using standard messages API
- Handle Anthropic-specific error codes and rate limits
- Add `ANTHROPIC_API_KEY` to `.env.example`

## Acceptance Criteria
- [ ] Anthropic provider implements AIProvider interface
- [ ] `generateJSON` uses tool use for structured output
- [ ] `generateText` returns plain text responses
- [ ] Switching `AI_PROVIDER=anthropic` works without code changes
- [ ] Error handling covers rate limits and API errors

## Dependencies
- TASK-210 (AI Provider Interface)

## Files/Modules Affected
- `platform-app/src/lib/ai/providers/anthropic.ts` (new)
- `platform-app/package.json` (add @anthropic-ai/sdk)
- `platform-app/.env.example` (add ANTHROPIC_API_KEY)
