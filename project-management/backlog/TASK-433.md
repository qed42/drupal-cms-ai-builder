# TASK-433: Add InferenceCard to fonts step — "How Archie uses your fonts"

**Story:** US-079
**Effort:** S
**Status:** TODO

## Description
Add a static explanation InferenceCard to the fonts step that shows how Archie will apply the selected fonts. This is a static card (no AI processing) that reflects the user's current selections.

## Implementation

```tsx
// In fonts/page.tsx, add to StepLayout's insightSlot:
<InferenceCard
  title="How Archie uses your fonts"
  items={[
    { label: "Headings", value: selectedHeading || "Not yet selected", type: "text" },
    { label: "Body text", value: selectedBody || "Not yet selected", type: "text" },
  ]}
  explanation="Your heading font appears in hero sections and page titles. Body font is used for paragraphs and descriptions."
  onConfirm={() => { /* dismiss */ }}
  onEdit={() => { /* scroll to font selector */ }}
  editLabel="Change selection"
/>
```

## Key Considerations
- Card updates reactively as user changes font selections
- No loading state needed — this is not AI-driven
- Show "Not yet selected" placeholder if no font chosen yet
- Card should always be visible (not conditionally shown after an API call)

## Files
- `platform-app/src/app/onboarding/fonts/page.tsx`

## Acceptance Criteria
- [ ] InferenceCard renders on fonts step
- [ ] Shows currently selected heading and body fonts
- [ ] Updates when user changes font selection
- [ ] Edit action scrolls to font selector
