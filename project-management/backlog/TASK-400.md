# TASK-400: Enrich `/api/ai/suggest-audiences` with painPoints

**Story:** US-073
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M20 — AI Transparency

## Description
Add a `painPoints` field to the suggest-audiences API response. The AI prompt already generates audience suggestions — extend it to also infer 2-3 customer pain points based on the industry and audience context.

## Technical Approach
1. Read `platform-app/src/app/api/ai/suggest-audiences/route.ts` to understand current prompt
2. Modify the AI prompt to include: "Also infer 2-3 common pain points that the target audience experiences related to this business/industry. Return as `painPoints` array."
3. Add `painPoints: z.array(z.string())` to the response Zod schema
4. Keep prompt addition to <100 tokens
5. Fallback: if AI doesn't return painPoints, default to empty array

## Acceptance Criteria
- [ ] `/api/ai/suggest-audiences` response includes `painPoints: string[]` with 2-3 items
- [ ] Pain points are relevant to the industry + audience (e.g., dental + families → "finding a dentist good with kids")
- [ ] Latency increase is <500ms
- [ ] Existing `suggestions` field is unchanged
- [ ] Backward compatible

## Dependencies
- None

## Files Affected
- `platform-app/src/app/api/ai/suggest-audiences/route.ts`
- AI prompt file used by the suggest-audiences endpoint
