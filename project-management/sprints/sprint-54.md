# Sprint 54: Designer Agent & Pipeline Integration

**Milestone:** M26 — Code Component Generation
**Duration:** 5 days

## Sprint Goal

Implement the Designer Agent (AI-generated React/Tailwind sections) and integrate it into the pipeline with mode branching.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-503 | Designer Agent — system prompt & Zod output schema | US-101 | L | TASK-501, TASK-502 | Complete |
| TASK-508 | Designer Agent — generation function with validation loop | US-101 | L | TASK-503 | Complete |
| TASK-504 | Branch Generate phase on generation mode | US-102 | L | TASK-500, TASK-508 | Complete |

## Execution Order

```
Wave 1: TASK-503
  - System prompt, few-shot examples, Zod schema
  - Can be developed and tested independently (prompt unit tests)

Wave 2: TASK-508
  - Core generateCodeComponent() function
  - Depends on TASK-503 for prompt builder and schema
  - Validation loop using TASK-502 validator

Wave 3: TASK-504
  - Pipeline orchestrator branching
  - Depends on TASK-508 for Designer Agent
  - Produces full BlueprintBundle with _codeComponents
```

## Dependencies & Risks

- **TASK-503 is prompt-engineering heavy** — output quality depends on system prompt craftsmanship and few-shot examples. Plan iteration time.
- **TASK-508 has two retry levels** — Zod-level (built-in) and validator-level (custom). Test both paths.
- **TASK-504 modifies the orchestrator** — must verify SDC mode unchanged (regression test).
- **Token costs** — code component generation is 2-3x more expensive than SDC mode. Monitor during testing.

## Definition of Done

- [ ] Designer Agent generates valid React/Tailwind for 9+ section types
- [ ] Output passes validator checks (a11y, security, motion-reduce)
- [ ] Pipeline branches correctly on `generationMode`
- [ ] SDC mode unchanged (no regression)
- [ ] Blueprint payload contains `_codeComponents[]` with config YAMLs
- [ ] Progress messages emitted for code component generation
- [ ] No TypeScript compilation errors
- [ ] Unit tests for prompt builder, designer agent, and generate phase
