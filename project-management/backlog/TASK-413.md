# TASK-413: Build SectionInsight tooltip component

**Story:** US-068
**Priority:** P2
**Estimated Effort:** M
**Milestone:** M20 — AI Transparency

## Description
Build the SectionInsight component that renders a tooltip/popover showing AI reasoning for a specific section. Uses native `<dialog>` element for zero-dependency popover behavior.

## Technical Approach
1. Create `platform-app/src/app/onboarding/review/components/SectionInsight.tsx` ("use client")
2. Trigger: info (?) icon button next to existing edit button on each section
3. Popover content:
   - "Based on:" list of source inputs (tone, audience, keywords)
   - Content brief (what the AI was told to write)
   - Target SEO keywords (as badges)
   - Image search query (if image section): "Searched: '{query}'"
   - "You've customized this section" note (if `isEdited`)
4. Implementation: `<dialog>` with `.show()` (non-modal), close on outside click + Escape
5. Position: relative to trigger button via CSS (not absolute positioning library)

## Component Specification
```typescript
interface SectionInsightProps {
  contentBrief?: string;
  targetKeywords?: string[];
  imageQuery?: string;
  toneGuidance?: string;
  audiencePainPoints?: string[];
  isEdited?: boolean;
}
```

## Acceptance Criteria
- [ ] Info icon appears on each section in the review editor
- [ ] Clicking opens a popover with AI reasoning data
- [ ] Shows content brief, keywords, and image query when available
- [ ] Shows "customized" note when section has been edited
- [ ] Closes on outside click and Escape key
- [ ] `aria-haspopup="dialog"` on trigger, `aria-expanded` toggles
- [ ] Focus returns to trigger button on close
- [ ] No external library dependency

## Dependencies
- TASK-412 (section _meta data available in blueprint)

## Files Affected
- `platform-app/src/app/onboarding/review/components/SectionInsight.tsx` (NEW)
- `platform-app/src/app/onboarding/review/components/PagePreview.tsx` (add info icon)
