# Sprint 54: Designer Agent & Pipeline Integration

**Milestone:** M26 — Code Component Generation
**Duration:** 5 days

## Sprint Goal

Implement the Designer Agent (AI-generated React/Tailwind sections) and integrate it into the pipeline with mode branching.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-503 | Designer Agent — section-level JSX/Tailwind generation | M26 | XL | TASK-501, TASK-502 | Pending |
| TASK-504 | Branch Generate phase on generation mode | M26 | L | TASK-500, TASK-501, TASK-503 | Pending |

## Execution Order

```
Wave 1: TASK-503
  - Designer Agent with system prompt, structured output, retry loop
  - Must land first — TASK-504 consumes its output

Wave 2: TASK-504
  - Pipeline orchestrator branching
  - Calls Designer Agent per section in code_components mode
```

## Dependencies & Risks

- TASK-503 is XL — prompt engineering and output quality are the main risks
- Token costs will be higher than SDC mode (full JSX generation vs prop filling)
- Need reference JSX examples for each section type to guide the LLM
- TASK-504 modifies the orchestrator — must not regress SDC mode

## Definition of Done

- [ ] Designer Agent generates valid React/Tailwind for 9+ section types
- [ ] Output passes validator checks (a11y, security, motion-reduce)
- [ ] Pipeline branches correctly on `generationMode`
- [ ] SDC mode unchanged (no regression)
- [ ] Blueprint payload contains `_codeComponents[]` with config YAMLs
- [ ] Progress messages emitted for code component generation
- [ ] No TypeScript compilation errors
