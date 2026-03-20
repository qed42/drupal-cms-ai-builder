# TASK-302: Revise section count ranges across all page types — raise minimums

**Type:** Enhancement / Bug Fix
**Priority:** P1 — High
**Severity:** Medium
**Found:** Sprint 18 QA — Visual Review (2026-03-20)

## Description

Generated pages are consistently landing at the minimum section count (2-3 folds), producing thin-feeling pages. The AI gravitates toward the lower bound of `sectionCountRange`, so the minimums need to be raised to ensure professional-looking output.

Current vs. proposed ranges:

| Page Type | Current | Proposed | Rationale |
|-----------|---------|----------|-----------|
| Home | 5-7 | 7-9 | Flagship page — hero, features, about teaser, testimonials, stats, services preview, CTA |
| About | 4-6 | 6-8 | Story-driven — hero, narrative, team, values, milestones, partnership logos, CTA |
| Services | 4-7 | 6-9 | Hero, service cards, detail sections, process, testimonials, FAQ, CTA |
| Contact | 2-3 | 4-5 | Hero, contact info, form section, map/hours, CTA |
| Portfolio | 3-5 | 5-7 | Hero, intro text, gallery, case study detail, client logos, CTA |
| Pricing | 3-5 | 5-7 | Hero, pricing cards, comparison, features, FAQ, testimonials, CTA |
| FAQ | 2-4 | 4-6 | Hero, intro text, accordion sections grouped by category, CTA |
| Team | 3-5 | 5-7 | Hero, intro narrative, leadership grid, culture/values, careers teaser, CTA |
| Landing | 4-6 | 6-8 | Conversion-focused — hero, problem/solution, features, social proof, pricing, urgency, CTA |
| Generic | 3-5 | 5-7 | Balanced fallback — professional depth for any page type |

**Key principle:** Raise every minimum by 2, raise maximum by 2. No page type should have a minimum below 4.

## Acceptance Criteria

- [ ] All `sectionCountRange` values updated per the table above
- [ ] The global reminder text updated to reflect new minimums (currently says "at least 4-5")
- [ ] `formatRulesForPlan()` output reflects updated ranges
- [ ] `formatRulesForPage()` output reflects updated ranges
- [ ] Plan validation in `phases/plan.ts` uses updated minimums for depth checks
- [ ] Token budget scaling in `phases/generate.ts` adjusted if needed for higher section counts
- [ ] Existing unit tests for page-design-rules updated to match new ranges
- [ ] No regression in generation pipeline — pages generate successfully with higher section counts

## Dependencies

- Should be done alongside or after TASK-301 (contact form) since contact page range changes overlap
- Token budget cap (currently 8000) WILL need adjustment — max sections now go up to 9. Raise cap to 10000 or adjust formula.

## Files to Modify

1. `platform-app/src/lib/ai/page-design-rules.ts` — Update all `sectionCountRange` values
2. `platform-app/src/lib/pipeline/phases/plan.ts` — Verify depth validation uses correct minimums
3. `platform-app/src/lib/pipeline/phases/generate.ts` — Check token budget cap accommodates higher sections
4. `platform-app/tests/page-design-rules.test.ts` — Update test expectations

## Technical Notes

- The AI prompt already includes "Do NOT produce pages with only 2-3 sections" — but the design rules themselves allowed 2-3, creating a contradiction. This fix aligns the rules with the intent.
- Token budget formula: `base 4000 + 500 per section above 3, capped at 8000`. With max 9 sections, budget would be 4000 + 3000 = 7000, but cap needs raising to ~10000 to give headroom for content-heavy pages.
- Monitor generation quality after change — if AI struggles with higher section counts for utility pages (FAQ, Contact), we can always dial back selectively.
