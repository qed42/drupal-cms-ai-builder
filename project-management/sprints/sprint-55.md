# Sprint 55: Provisioning, Enhance & Review

**Milestone:** M26 — Code Component Generation
**Duration:** 4 days

## Sprint Goal

Complete the Code Component pipeline end-to-end — image enhancement for JSX, Drupal provisioning via config import, and review editor preview support.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-505 | Enhance phase — image replacement in JSX | M26 | M | TASK-504 | Pending |
| TASK-506 | Provisioning — import Code Component config entities | M26 | L | TASK-504 | Pending |
| TASK-507 | Review editor — Code Component preview | M26 | M | TASK-504 | Pending |

## Execution Order

```
Wave 1 (parallel): TASK-505, TASK-506, TASK-507
  - All three depend on TASK-504 but are independent of each other
  - TASK-505: Enhance phase JSX image parsing
  - TASK-506: Drupal config import via Drush
  - TASK-507: Review editor JSX syntax highlighting
```

## Dependencies & Risks

- TASK-506 requires a Drupal site with Canvas installed for testing
- TASK-505 needs to parse JSX for image placeholders — different from SDC prop matching
- TASK-507 may need `prism-react-renderer` or similar dependency

## Definition of Done

- [ ] Stock images replace placeholders in Code Component JSX
- [ ] Code Component config YAMLs imported into Drupal via `drush cim`
- [ ] Mixed SDC + Code Component pages render in Canvas
- [ ] Review editor shows JSX syntax-highlighted preview for code sections
- [ ] Regenerate works for Code Component sections
- [ ] Full end-to-end: onboarding → generate (code mode) → review → provision → live site
- [ ] No TypeScript compilation errors
