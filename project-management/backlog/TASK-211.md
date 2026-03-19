# TASK-211: OpenAI Provider Implementation

**Story:** US-038
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M7 — AI Content Pipeline

## Description
Implement the OpenAI provider class conforming to the AIProvider interface. Uses OpenAI's structured output (JSON schema via response_format) for `generateJSON` and standard completions for `generateText`.

## Technical Approach
- Create `platform-app/src/lib/ai/providers/openai.ts`
- Implement `generateJSON<T>()` using `response_format: { type: "json_schema", json_schema: ... }`
- Convert Zod schemas to JSON Schema for the response_format parameter
- Implement `generateText()` using standard chat completions
- Refactor existing `getOpenAIClient()` from `platform-app/src/lib/ai/client.ts` into this provider
- Handle OpenAI-specific error codes (429, 500, 503)

## Acceptance Criteria
- [ ] OpenAI provider implements AIProvider interface
- [ ] `generateJSON` uses structured output and validates response
- [ ] `generateText` returns plain text responses
- [ ] Existing OpenAI client usage is migrated to this provider
- [ ] Error handling covers rate limits, timeouts, and server errors

## Dependencies
- TASK-210 (AI Provider Interface)

## Files/Modules Affected
- `platform-app/src/lib/ai/providers/openai.ts` (new)
- `platform-app/src/lib/ai/client.ts` (refactor)
