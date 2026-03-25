# TASK-399: Enrich `/api/ai/analyze` with detectedServices

**Story:** US-073
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M20 — AI Transparency

## Description
Add a `detectedServices` field to the analyze API response. The AI prompt already classifies industry and extracts keywords — extend it to also extract 2-5 service/offering mentions from the business idea text.

## Technical Approach
1. Read `platform-app/src/app/api/ai/analyze/route.ts` to understand current prompt and response parsing
2. Modify the AI prompt to include: "Also extract 2-5 specific services or offerings mentioned or implied in the business description. Return as `detectedServices` array."
3. Add `detectedServices: z.array(z.string())` to the response Zod schema
4. Keep prompt addition to <100 tokens to minimize latency impact
5. Fallback: if AI doesn't return detectedServices, default to empty array

## Acceptance Criteria
- [ ] `/api/ai/analyze` response includes `detectedServices: string[]` with 2-5 items
- [ ] Services are extracted from the idea text (e.g., "family dental practice" → ["general dentistry", "cosmetic procedures", "pediatric care"])
- [ ] Latency increase is <500ms compared to current baseline
- [ ] Existing response fields (industry, keywords, compliance_flags) are unchanged
- [ ] Empty/vague ideas return `detectedServices: []` gracefully
- [ ] Backward compatible — existing consumers ignore the new field

## Dependencies
- None

## Files Affected
- `platform-app/src/app/api/ai/analyze/route.ts`
- AI prompt file used by the analyze endpoint
