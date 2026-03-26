# TASK-432: Add InferenceCard to brand step — "Archie extracted your brand"

**Story:** US-079
**Effort:** S
**Status:** TODO

## Description
Add a dynamic InferenceCard to the brand step that shows what Archie extracted after color extraction completes. The color data is already available in component state from the existing extraction logic.

## Implementation

```tsx
// In brand/page.tsx, add to StepLayout's insightSlot:
<InferenceCard
  title="Archie extracted your brand"
  items={[
    { label: "Primary color", value: primaryColor, type: "text" },
    { label: "Palette", value: `${colors.length} colors extracted`, type: "text" },
  ]}
  explanation="These colors will be applied to buttons, headings, and backgrounds across your site."
  onConfirm={() => { /* dismiss */ }}
  onEdit={() => { /* scroll to color swatches */ }}
  editLabel="Adjust colors above"
  isLoading={extracting}
/>
```

## Key Considerations
- Only show card when a logo/brand kit is uploaded and colors are extracted
- Don't show card if user manually picks colors without uploading
- Card should show the extracted primary color value (hex or swatch)
- Loading state during "Extracting colors..." should use InferenceCard skeleton

## Files
- `platform-app/src/app/onboarding/brand/page.tsx`

## Acceptance Criteria
- [ ] InferenceCard appears after color extraction completes
- [ ] Shows primary color and total palette count
- [ ] Loading skeleton shown during extraction
- [ ] Card does not appear if no upload was made
- [ ] Edit action scrolls to color swatch editor
