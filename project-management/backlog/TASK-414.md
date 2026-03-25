# TASK-414: Build insights data mapper and lazy-fetch hook

**Story:** US-068, US-069
**Priority:** P2
**Estimated Effort:** L
**Milestone:** M20 — AI Transparency

## Description
Build the data mapping layer that connects rendered sections to their originating plan data, and the lazy-fetch mechanism that loads insights only when the first info icon is clicked.

## Technical Approach
1. Create `/api/blueprint/[siteId]/insights/route.ts` — reads ResearchBrief, ContentPlan, Blueprint._review for the siteId. Projects only needed fields. Sets `Cache-Control: private, max-age=3600`.
2. In review page, add lazy-fetch state:
   ```typescript
   const [insightsData, setInsightsData] = useState<BlueprintInsights | null>(null);
   const insightsFetched = useRef(false);

   function handleInsightClick(sectionIndex: number) {
     if (!insightsFetched.current) {
       fetch(`/api/blueprint/${siteId}/insights`).then(r => r.json()).then(setInsightsData);
       insightsFetched.current = true;
     }
     setActiveInsight(sectionIndex);
   }
   ```
3. Map section data: for each section at `[pageIndex][sectionIndex]`, look up `insightsData.contentPlan.pages[pageSlug].sections[sectionIndex]` for contentBrief and targetKeywords
4. Pass mapped data as props to SectionInsight components
5. Handle mismatch gracefully (section count differs between plan and blueprint)

## Acceptance Criteria
- [ ] `/api/blueprint/{siteId}/insights` returns ResearchBrief + ContentPlan + review scores in <100ms
- [ ] Insights data is fetched only on first info-icon click (not on page load)
- [ ] After first fetch, subsequent info-icon clicks use cached data (no re-fetch)
- [ ] Section-to-plan mapping works correctly when section counts match
- [ ] When section counts don't match, available data is shown (partial is better than nothing)
- [ ] Response includes ResearchBrief tone guidance and audience pain points for section tooltips
- [ ] API validates siteId ownership (user can only access their own insights)

## Dependencies
- TASK-412 (section _meta in blueprint)
- TASK-410 (ResearchBrief + ContentPlan persistence verified)

## Files Affected
- `platform-app/src/app/api/blueprint/[siteId]/insights/route.ts` (NEW)
- `platform-app/src/app/onboarding/review/page.tsx` (add lazy-fetch logic)
- `platform-app/src/lib/transparency/types.ts` (BlueprintInsightsSchema)
