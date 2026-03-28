# Sprint 53: Code Component Foundation

**Milestone:** M26 — Code Component Generation
**Duration:** 3 days

## Sprint Goal

Establish the foundation for Code Component generation — onboarding mode selection, TypeScript interfaces, config YAML builder, and validation pipeline.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-500 | Generation mode in onboarding data & UI | M26 | M | None | Pending |
| TASK-501 | CodeComponentGenerator interface & config YAML builder | M26 | M | None | Pending |
| TASK-502 | Code Component validator (JSX, a11y, security) | M26 | M | TASK-501 | Pending |

## Execution Order

```
Wave 1 (parallel): TASK-500, TASK-501
Wave 2:            TASK-502 (depends on TASK-501 types)
```

## Definition of Done

- [ ] generationMode field in OnboardingData and Prisma schema
- [ ] Onboarding UI shows design approach selection
- [ ] CodeComponentOutput type and buildConfigYaml() function working
- [ ] Validator catches JSX errors, a11y issues, dangerous JS, missing motion-reduce
- [ ] Unit tests for config builder and validator
- [ ] No TypeScript compilation errors
