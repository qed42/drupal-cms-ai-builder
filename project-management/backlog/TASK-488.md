# TASK-488: Expand PipelineProgress Phase Cards with Live Artifacts

**Story:** US-093
**Effort:** M
**Milestone:** M20 — AI Transparency

## Description
Upgrade PipelineProgress phase cards to show what was produced, not just status. Research card shows detected industry/services, plan card shows page list, generate card shows live content preview, enhance card shows image match progress.

## Technical Approach

### Extended PhaseStatus
```typescript
interface PhaseStatus {
  status: "pending" | "in_progress" | "complete" | "failed";
  durationMs?: number;
  summary?: string;
  error?: string;
  messages?: string[];      // NEW: reasoning messages
  artifacts?: {             // NEW: structured output
    industry?: string;
    services?: string[];
    complianceFlags?: string[];
    pages?: string[];
    currentPage?: string;
    currentPageIndex?: number;
    totalPages?: number;
    contentPreview?: string; // First ~150 chars of current page hero
    imagesPlaced?: number;
    imagesTotal?: number;
    userImagesMatched?: number;
  };
}
```

### Phase Card Enhancements

1. **Research (complete)**: Show `industry · N services · compliance flags` as pills
2. **Plan (complete)**: Show page names as small pills in a flex-wrap row
3. **Generate (in_progress)**: Show "Page X of Y: {pageName}" + content preview block with left border accent, serif font, max 3 lines with gradient mask
4. **Generate (complete)**: Show "{N} pages written" + page name pills
5. **Enhance (in_progress)**: Show "{N} of {total} images · {M} user photos matched"
6. **Enhance (complete)**: Show final counts

### Content Preview Block
- Styled as a quote block: `border-l-2 border-brand-500/30 pl-3`
- Text: `text-sm text-white/50 italic` with serif font hint
- Max 3 lines with `line-clamp-3`
- Fades in when contentPreview updates

## Acceptance Criteria
- [ ] Research card shows industry, services, and compliance when complete
- [ ] Plan card shows page name pills when complete
- [ ] Generate card shows live page progress (X of Y) and content preview
- [ ] Enhance card shows image placement progress
- [ ] All artifacts fade in smoothly (200ms)
- [ ] No layout shift — card height accommodates artifacts from initial render
- [ ] Backward compatible — works with existing status data that has no artifacts

## Dependencies
- TASK-486 (backend must emit artifacts in status response)

## Files
- `platform-app/src/components/onboarding/PipelineProgress.tsx` (edit)
