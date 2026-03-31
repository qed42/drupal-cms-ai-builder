# TASK-515: Sucrase-based JSX transpilation module

**Story:** US-111
**Priority:** P0
**Estimate:** M
**Status:** To Do

## Description

Create the client-side JSX transpilation module using Sucrase, with transpilation caching.

### Deliverables

1. **Add `sucrase` dependency** to `platform-app/package.json`

2. **`platform-app/src/lib/preview/transpile.ts`** — Functions:
   - `transpileJsx(jsx: string): TranspileResult` — Sucrase transform with `jsx` and `typescript` plugins
   - `TranspileResult` type: `{ code: string } | { error: string }`
   - In-memory `Map<string, string>` cache keyed by content hash (avoid re-transpiling unchanged sections)
   - `clearTranspileCache()` for testing

3. **Unit tests** (`platform-app/src/lib/preview/__tests__/transpile.test.ts`):
   - Valid JSX → JS output
   - JSX with TypeScript annotations → JS output
   - Invalid JSX → error result (not throw)
   - Cache hit on same input
   - Multiple components transpiled correctly

## Dependencies

- None (uses sucrase directly)

## Acceptance Criteria

- [ ] Sucrase transpiles all JSX patterns produced by the Designer Agent
- [ ] Cache prevents re-transpilation of unchanged sections
- [ ] Invalid JSX returns error result, never throws
- [ ] Transpilation completes in <10ms per section
- [ ] Unit tests pass
