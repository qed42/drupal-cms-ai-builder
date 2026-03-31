# TASK-519: JSX sanitization and security utilities

**Story:** US-117
**Priority:** P0
**Estimate:** M
**Status:** To Do

## Description

Implement pre-rendering JSX sanitization and security utilities used by the preview system. These utilities provide defense-in-depth by stripping dangerous code patterns before JSX enters the iframe.

### Deliverables

1. **`platform-app/src/lib/preview/sanitize.ts`** — Functions:
   - `sanitizeJsx(jsx: string): string` — strips dangerous patterns (see architecture doc section 5.4 for full list of blocked patterns including code execution, network access, storage access, and parent frame access)
   - `isPostMessageAllowed(type: string): boolean` — whitelist check against allowed message types
   - `validatePostMessageOrigin(origin: string): boolean` — validates origin is `null` (srcdoc iframe) or matches expected origin
   - `CSP_META_TAG: string` — constant with the CSP meta tag content from architecture spec

2. **Unit tests** (`platform-app/src/lib/preview/__tests__/sanitize.test.ts`):
   - Each dangerous pattern is neutralized
   - Safe JSX passes through unchanged
   - PostMessage whitelist rejects unknown types
   - Origin validation works for srcdoc and expected origins

## Dependencies

- None (standalone utilities)

## Acceptance Criteria

- [ ] All 10+ dangerous patterns from architecture spec are blocked
- [ ] Safe JSX is not modified by sanitization
- [ ] PostMessage type whitelist is strict (only listed types pass)
- [ ] CSP meta tag matches architecture specification exactly
- [ ] Unit tests cover each pattern individually
