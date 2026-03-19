# TASK-213: Structured Output Validation with Zod

**Story:** US-043
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M7 — AI Content Pipeline

## Description
Create a validation wrapper that enforces structured output from AI calls using Zod schemas. Implements retry logic that appends validation errors to the prompt for self-correction.

## Technical Approach
- Create `platform-app/src/lib/ai/validation.ts`
- Implement `generateValidatedJSON<T>(provider, prompt, zodSchema, options?)` wrapper
- On validation failure: retry up to 2 times, appending Zod error details to the prompt
- After all retries exhausted: throw descriptive error
- Install `zod-to-json-schema` package for converting Zod schemas to JSON Schema (needed by OpenAI's response_format)
- Define Zod schemas for: `ResearchBrief`, `ContentPlan`, `PageLayout` (enhanced)

## Acceptance Criteria
- [ ] `generateValidatedJSON` validates AI output against Zod schema
- [ ] Retry logic appends validation errors to prompt (max 2 retries)
- [ ] Zod schemas defined for all pipeline phase outputs
- [ ] Failed validation after retries throws clear error
- [ ] Validation errors are logged for debugging

## Dependencies
- TASK-210 (AI Provider Interface)

## Files/Modules Affected
- `platform-app/src/lib/ai/validation.ts` (new)
- `platform-app/src/lib/pipeline/schemas.ts` (new — Zod schemas)
- `platform-app/package.json` (add zod-to-json-schema)
