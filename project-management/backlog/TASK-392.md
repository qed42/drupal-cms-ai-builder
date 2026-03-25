# TASK-392: Create input hash utility for cache invalidation

**Story:** US-066
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M20 — AI Transparency

## Description
Create a utility function that computes a deterministic SHA-256 hash from the onboarding fields that affect Research output. Used by the preview API, save API, and pipeline orchestrator.

## Technical Approach
1. Create `platform-app/src/lib/transparency/input-hash.ts`
2. Implement `computeInputHash(data: OnboardingData): string`
3. Extract and sort preview-relevant fields: idea, audience, industry, tone, pages (sorted by slug), differentiators, followUpAnswers (sorted by key)
4. JSON.stringify the sorted structure, then SHA-256 hash it
5. Use Node.js `crypto.createHash("sha256")` — server-only, not in client bundle

## Acceptance Criteria
- [ ] Same inputs produce identical hash regardless of field ordering in the source object
- [ ] Different inputs produce different hashes
- [ ] Undefined/null fields are handled consistently (treated as absent)
- [ ] Only preview-relevant fields affect the hash — changes to name, colors, fonts, logo_url, design_source do NOT change the hash
- [ ] Unit tests cover: identical inputs, differing inputs, field ordering, null handling

## Dependencies
- None

## Files Affected
- `platform-app/src/lib/transparency/input-hash.ts` (NEW)
