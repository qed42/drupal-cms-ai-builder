# TASK-502: Code Component Validator (HTML, A11y, Security)

**Story:** US-100 — Code Component Validation Pipeline
**Priority:** P0
**Effort:** M
**Milestone:** M26 — Code Component Generation

## Description

Build a validation pipeline for AI-generated Code Component output. Validates JSX structure, accessibility, Tailwind CSS usage, animation safety, and security (no malicious JS patterns).

## Technical Approach

- **JSX validation:** Parse with a lightweight JSX parser, verify valid React component structure
- **Accessibility:** Check for `aria-label`, `role` attributes, heading hierarchy, alt text on images
- **Animation safety:** Verify `motion-reduce:` Tailwind variants present when animations used
- **Security:** Disallow `eval`, `fetch`, `XMLHttpRequest`, `document.cookie`, `window.location` in component JS
- **Tailwind CSS:** Verify no raw CSS `@import` or external `url()` references
- Return `ValidationResult` with pass/fail + actionable error messages for LLM retry

## Acceptance Criteria

- [ ] Validates JSX component structure (must export default)
- [ ] Catches missing accessibility attributes
- [ ] Detects animations without `motion-reduce` fallback
- [ ] Blocks dangerous JS patterns
- [ ] Returns structured errors usable as LLM retry feedback
- [ ] Unit tests for each validation rule

## Dependencies
- TASK-501

## Files to Create

- `platform-app/src/lib/code-components/validator.ts`
- `platform-app/src/lib/code-components/__tests__/validator.test.ts`
