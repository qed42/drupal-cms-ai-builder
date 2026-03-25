# Sprint 37: "Why This?" Tooltips & Dashboard Summary

**Milestone:** M20 — AI Transparency
**Duration:** 2 days
**Predecessor:** Sprint 36 (Generation Narrative & Metadata)

## Sprint Goal

Complete the transparency loop: show AI reasoning for every content decision in the review editor, and surface impact summaries on the dashboard.

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-414 | Build insights API endpoint (`/api/blueprint/[siteId]/insights`) + lazy-fetch hook in review page | US-068, US-069 | L | Sprint 36 complete | TODO |
| TASK-413 | Build SectionInsight tooltip component (native `<dialog>`, info icon on sections, image query display, "customized" note) | US-068 | M | TASK-414 | TODO |
| TASK-418 | Build PageInsightsPanel slide-out (quality score, keyword coverage, word count, link count, input-to-content mapping) | US-069 | M | TASK-414 | TODO |
| TASK-420 | Generate impact summary bullets at pipeline completion, store in `blueprint.payload._impact` | US-071 | S | TASK-405 (templates) | TODO |
| TASK-421 | Display ImpactSummary on dashboard SiteCard (server-rendered, pure presentation) | US-071 | S | TASK-420 | TODO |

**Note:** Original TASK-415 (info icon), TASK-416 (customized note), TASK-417 (image query in tooltip) were consolidated into TASK-413 per frontend architect's design — one component handles all tooltip variants. Original TASK-419 (input mapping display) was consolidated into TASK-418 — PageInsightsPanel includes the mapping section.

## Execution Order

```
Wave 1 (parallel): TASK-414, TASK-420
Wave 2 (parallel): TASK-413, TASK-418, TASK-421   ← TASK-413/418 depend on TASK-414; TASK-421 depends on TASK-420
```

## Dependencies & Risks

- **Hard dependency:** Sprint 36 must be complete — TASK-411/412 populate the `_meta` data that tooltips consume.
- **Risk:** Tooltip data mapper (TASK-414) is the most complex task. Section-to-plan mapping relies on index-based correspondence with fallback to heading matching. Plan for edge cases where section counts differ.
- **Risk:** Too many info icons may feel cluttered. Mitigation: icons are subtle (small "?" badge), tooltips are opt-in (click-to-open), and the info icon uses low-contrast styling until hovered.
- **Note:** TASK-420/421 (dashboard) are independent of the tooltip track and can ship even if tooltips need more polish.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| S | 2 | TASK-420, TASK-421 |
| M | 2 | TASK-413, TASK-418 |
| L | 1 | TASK-414 |
| **Total** | **5 tasks** | |

## Definition of Done

- [ ] Every section in the review editor has a clickable info (?) icon
- [ ] Section tooltips show: content brief, target keywords, tone source, and image search query (when applicable)
- [ ] Edited sections show "You've customized this section" disclaimer in tooltip
- [ ] `<dialog>` popover closes on outside click and Escape key
- [ ] `aria-haspopup="dialog"` and `aria-expanded` on trigger buttons
- [ ] Page-level insights panel shows: quality score (color-coded), keyword coverage, word count, link count
- [ ] Page insights panel shows "Your input → This page" mapping with at least 2 entries per page
- [ ] Dashboard site cards show 3-5 "Your inputs shaped" bullets (server-rendered, no client JS)
- [ ] Impact bullets hidden when no data is available (no empty section)
- [ ] Playwright test: open review editor → click section info icon → verify tooltip content
- [ ] Playwright test: verify dashboard card shows impact summary after generation
