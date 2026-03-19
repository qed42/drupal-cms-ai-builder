# Sprint 09 Output: AI Provider Foundation & Pipeline Infrastructure

**Milestone:** M7 — AI Content Pipeline
**Status:** Complete

## Deliverables

### TASK-205: Onboarding Session Schema Update
- Extracted `OnboardingData` interface from `generator.ts` into `types.ts`
- Added v2 enrichment fields: `followUpAnswers`, `differentiators`, `referenceUrls`, `existingCopy`
- Added `description` field to `OnboardingPageSelection` for AI-generated page descriptions
- All v2 fields are optional — backward compatible with existing v1 onboarding sessions

### TASK-210: AI Provider Interface & Factory
- Created `AIProvider` interface with `generateJSON<T>()` and `generateText()` methods
- Created `getAIProvider()` factory that reads `AI_PROVIDER` env var (supports `openai`, `anthropic`)
- Implemented `resolveModel()` with per-phase override: `AI_MODEL_RESEARCH`, `AI_MODEL_PLAN`, `AI_MODEL_GENERATE`
- Implemented exponential backoff with jitter for rate limit handling
- Helper utilities: `isRateLimitError()`, `isRetryableError()`, `backoffDelay()`

### TASK-211: OpenAI Provider Implementation
- Created `OpenAIProvider` class implementing `AIProvider` interface
- `generateJSON` uses OpenAI's native `response_format: { type: "json_schema" }` with strict mode
- Uses Zod v4's built-in `toJSONSchema()` for schema conversion (no external dependency needed)
- Retry logic with exponential backoff on 429/5xx errors

### TASK-212: Anthropic Provider Implementation
- Created `AnthropicProvider` class implementing `AIProvider` interface
- `generateJSON` uses Anthropic's tool use pattern: defines tool with JSON schema, forces tool use, extracts structured result
- `generateText` uses standard messages API
- Installed `@anthropic-ai/sdk` package
- Same retry strategy as OpenAI provider

### TASK-213: Structured Output Validation (Zod)
- Created `generateValidatedJSON()` wrapper with retry-on-validation-failure logic
- On Zod validation failure: retries up to 2 times, appending formatted error details to prompt for AI self-correction
- Defined pipeline Zod schemas: `ResearchBriefSchema`, `ContentPlanSchema`, `BlueprintOutputSchema`
- Used Zod v4 API (`z.record(key, value)` syntax, `z.ZodType` generics)

### TASK-214: Pipeline Data Models (Prisma Migration)
- Added `ResearchBrief` model with `[siteId, version]` unique constraint
- Added `ContentPlan` model linked to `ResearchBrief` with `[siteId, version]` unique constraint
- Added `BlueprintVersion` model with `[blueprintId, version]` unique constraint
- Added `pipelinePhase` and `pipelineError` fields to Site model
- Added `originalPayload` field to Blueprint model
- All relations properly defined with cascade deletes

## New Files
- `platform-app/src/lib/ai/provider.ts` — AIProvider interface, retry utilities
- `platform-app/src/lib/ai/factory.ts` — Provider factory and model resolution
- `platform-app/src/lib/ai/providers/openai.ts` — OpenAI provider implementation
- `platform-app/src/lib/ai/providers/anthropic.ts` — Anthropic provider implementation
- `platform-app/src/lib/ai/validation.ts` — Validated JSON generation with retry
- `platform-app/src/lib/pipeline/schemas.ts` — Zod schemas for pipeline phases

## Modified Files
- `platform-app/src/lib/blueprint/types.ts` — Added OnboardingData interface with v2 fields
- `platform-app/src/lib/blueprint/generator.ts` — Import OnboardingData from types
- `platform-app/prisma/schema.prisma` — Added 3 new models, extended Site and Blueprint
- `platform-app/.env.example` — Added AI provider configuration vars
- `platform-app/package.json` — Added @anthropic-ai/sdk, zod dependencies

## Notes
- Zod v4 is installed (4.3.6) — uses `z.ZodType<T>` instead of v3's `ZodSchema<T>`, and `z.record(key, value)` instead of `z.record(value)`
- Zod v4 has built-in `toJSONSchema()` — no need for `zod-to-json-schema` package
- Pre-existing build issue: `useSearchParams()` without Suspense boundary on `/onboarding/progress` (not related to sprint 09)
- TypeScript compiles clean with `tsc --noEmit`
