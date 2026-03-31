# Sprint 56: Design Tokens Integration & Quality Rules

**Milestone:** M27 — Design Rules Engine
**Duration:** 3 days

## Sprint Goal

Complete the design tokens pipeline end-to-end — verify token injection into generation prompts, add P1 quality rules (heading hierarchy, color patterns, intra-section spacing), fix open bugs, and enable design rules by default.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-509 | Wire design tokens into generation prompt | US-108 | M | — | Done |
| TASK-510 | Heading hierarchy, color patterns, intra-section spacing | US-109 | M | TASK-509 | Done |
| TASK-511 | Enable design rules by default (remove feature flag) | US-110 | S | TASK-509, TASK-510 | Done |
| TASK-512 | Fix BUG-053-001: industry-based mode defaults | US-098 | S | — | Done (prior session) |
| TASK-513 | Fix BUG-054-001: missing list prop types | US-099 | S | — | Done |
| TASK-499 | Fix progress page "ready" messaging | US-097 | S | — | Done |

## Execution Order

```
Wave 1 (parallel): TASK-509, TASK-512, TASK-513, TASK-499
  - TASK-509: Verify/complete token injection into generation pipeline
  - TASK-512: Industry-based generation mode defaults (independent UX fix)
  - TASK-513: Add missing list:text and list:integer prop types (independent bug fix)
  - TASK-499: Fix progress page "ready" messaging (independent UX fix)

Wave 2: TASK-510
  - Depends on TASK-509 to confirm token injection works
  - Adds P1 quality rules to YAML and prompt compiler

Wave 3: TASK-511
  - Depends on TASK-509 + TASK-510 — enable rules by default only after all rules are validated
  - Smallest task — flip the feature flag default
```

## Dependencies & Risks

- **TASK-509 is primarily verification** — the wiring may already work. Risk is low but we need to confirm the full path with an integration test.
- **TASK-510 extends the type system** — needs careful backward compatibility with existing YAML files and prompt output.
- **TASK-511 must be last** — enabling by default before all rules are validated would ship incomplete quality improvements.
- **TASK-512 and TASK-513 are independent bug fixes** — can be done in parallel with the main design rules work.

## Definition of Done

- [ ] Design tokens appear in code component generation prompts when rules are enabled
- [ ] Section index available for background alternation awareness
- [ ] Heading hierarchy, color usage, and intra-section spacing rules defined and emitted
- [ ] Design rules enabled by default for code_components mode
- [ ] Industry-based generation mode defaults work on the style page
- [ ] list:text and list:integer prop types accepted by schema
- [ ] Progress page shows "ready for review" after generation, "is live!" after provisioning
- [ ] All existing 37 rules engine tests pass + new tests
- [ ] All 106 existing platform-app tests pass (no regression)
- [ ] No TypeScript compilation errors
