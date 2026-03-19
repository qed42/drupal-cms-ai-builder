# TASK-261: Manual Test Scripts

**Story:** US-057
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M10 — Quality Framework

## Description
Create step-by-step manual test scripts for each synthetic test case, documenting exact inputs, expected outputs per phase, and pass/fail criteria.

## Technical Approach
- Create `project-management/test-cases/` directory
- One markdown file per test case: `TC-001-healthcare-dental.md`, etc.
- Each script documents:
  - Exact onboarding inputs (copy-pasteable into the wizard)
  - Expected research brief outputs (key findings to verify)
  - Expected content plan structure (page outlines to check)
  - Content quality checkpoints: word count per page, industry terminology presence, CTA relevance
  - Pass/fail criteria tied to the evaluation rubric
- Scripts should be executable by someone unfamiliar with the system

## Acceptance Criteria
- [ ] 10+ manual test scripts created
- [ ] Each script has step-by-step onboarding inputs
- [ ] Each script has expected outputs per pipeline phase
- [ ] Pass/fail criteria are clear and measurable
- [ ] Scripts are self-contained (no assumed knowledge)

## Dependencies
- TASK-260 (Synthetic Test Case Definitions)

## Files/Modules Affected
- `project-management/test-cases/TC-001-healthcare-dental.md` (new)
- `project-management/test-cases/TC-002-legal-family-law.md` (new)
- ... (10+ files)
