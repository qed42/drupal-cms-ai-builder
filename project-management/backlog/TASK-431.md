# TASK-431: Add InferenceCard to pages step — "Archie planned your site"

**Story:** US-079
**Effort:** S
**Status:** TODO

## Description
Add a dynamic InferenceCard to the pages step that shows what Archie planned after AI page suggestions load. The data is already available in component state from the page suggestions API response.

## Implementation

```tsx
// In pages/page.tsx, add to StepLayout's insightSlot:
<InferenceCard
  title="Archie planned your site"
  items={[
    { label: "Pages", value: `${pages.length} pages`, type: "text" },
    { label: "Structure", value: pages.map(p => p.title), type: "list" },
  ]}
  explanation="This structure is based on your industry and what similar businesses need. You can add or remove pages above."
  onConfirm={() => { /* dismiss */ }}
  onEdit={() => { /* scroll to page list */ }}
  editLabel="Edit pages above"
  isLoading={pagesLoading}
/>
```

## Key Considerations
- Show loading skeleton while pages are being fetched from AI
- Card should appear after suggestions load, not on initial mount
- "Edit pages above" should scroll to the page list, not navigate away
- If user manually adds/removes pages, card should update item count

## Files
- `platform-app/src/app/onboarding/pages/page.tsx`

## Acceptance Criteria
- [ ] InferenceCard appears after page suggestions load
- [ ] Shows correct page count and page title list
- [ ] Loading skeleton shown during AI analysis
- [ ] Edit action scrolls to page list
