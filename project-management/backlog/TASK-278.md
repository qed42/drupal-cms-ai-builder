# TASK-278: Generation Contextual Messages & Error Clarity

**Story:** GEN-2, GEN-6
**Priority:** P1
**Effort:** M
**Sprint:** 17

## Description

Add contextual messages during generation that show specific work being done, and improve error state messaging.

### Deliverables

1. **Contextual messages (GEN-2):** Messages update during generation to show specific work: "Learning about dental practices in Portland...", "Designing your About page...", "Writing homepage content..."
2. **Error clarity (GEN-6):** Error states explain what happened in plain language and whether user data is safe: "We hit a snag generating your content, but all your settings are saved. You can try again."

## Acceptance Criteria

- [ ] Generation shows business-specific contextual messages during each phase
- [ ] Error states explain issues in plain language
- [ ] Error states reassure users their data is saved
- [ ] Retry option available from error state

## Dependencies

- TASK-275 (Sprint 15 generation UX labels)
