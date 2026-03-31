# TASK-520: Preview security integration tests

**Story:** US-117
**Priority:** P0
**Estimate:** M
**Status:** To Do

## Description

Create integration-level security tests that verify the entire preview pipeline is hardened against malicious AI-generated content.

### Deliverables

1. **`platform-app/src/lib/preview/__tests__/security.test.ts`** — Tests:
   - iframe sandbox attribute is exactly `allow-scripts` (no additional permissions)
   - CSP meta tag present in generated srcdoc HTML
   - JSX containing dangerous code execution patterns is sanitized before inclusion
   - JSX containing network access patterns (fetch, XHR) is sanitized
   - JSX containing storage/cookie access patterns is sanitized
   - JSX containing parent frame access patterns is sanitized
   - PostMessage handler rejects messages with unknown types
   - PostMessage handler validates origin
   - Serialized preview data is HTML-entity-escaped (prevents script injection via data)
   - `connect-src: 'none'` in CSP blocks network requests from iframe

2. **Verify end-to-end flow**: buildPreviewHtml with intentionally malicious JSX produces sanitized output.

## Dependencies

- TASK-516 (buildPreviewHtml)
- TASK-519 (sanitize utilities)

## Acceptance Criteria

- [ ] 5+ security-specific test cases as required by US-117
- [ ] Tests verify defense-in-depth (sanitization + CSP + sandbox all work together)
- [ ] No false positives — safe JSX patterns are not flagged
- [ ] All tests pass
