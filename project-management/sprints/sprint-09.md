# Sprint 09: AI Provider Foundation & Pipeline Infrastructure

**Milestone:** M7 — AI Content Pipeline
**Duration:** 1 week

## Sprint Goal
Establish the AI provider abstraction layer, structured output validation, and database models that all subsequent pipeline work depends on.

## Tasks
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-205 | Onboarding Session Schema Update | US-033/034/035/036 | S | Done |
| TASK-210 | AI Provider Interface & Factory | US-038 | M | Done |
| TASK-211 | OpenAI Provider Implementation | US-038 | M | Done |
| TASK-212 | Anthropic Provider Implementation | US-038 | M | Done |
| TASK-213 | Structured Output Validation (Zod) | US-043 | M | Done |
| TASK-214 | Pipeline Data Models (Prisma Migration) | US-044 | M | Done |

## Dependencies & Risks
- TASK-210 is the foundation — blocks TASK-211, TASK-212, TASK-213
- TASK-211 and TASK-212 can be developed in parallel
- Risk: Anthropic structured output via tool use may behave differently than OpenAI's JSON schema mode — allocate time for provider-specific quirks
- TASK-214 (Prisma migration) should be done early — other sprints depend on these models

## Definition of Done
- [ ] Both OpenAI and Anthropic providers pass unit tests with `generateJSON` and `generateText`
- [ ] Switching `AI_PROVIDER` env var correctly routes to the right provider
- [ ] Zod validation wrapper retries on invalid output
- [ ] Prisma migration applied: ResearchBrief, ContentPlan, BlueprintVersion tables created
- [ ] OnboardingData interface extended with v2 fields
- [ ] All code committed
