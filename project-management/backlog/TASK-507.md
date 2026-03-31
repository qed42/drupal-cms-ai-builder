# TASK-507: Review Editor — Code Component Preview

**Story:** US-105 — Code Component Preview in Review Editor
**Priority:** P1
**Effort:** M
**Milestone:** M26 — Code Component Generation

## Description

Update the review editor to preview Code Component sections. Instead of the SDC component tree view, show a rendered JSX preview or syntax-highlighted code view for Code Component sections.

## Technical Approach

- Detect section type (SDC vs Code Component) from blueprint payload
- For Code Components: render JSX source with syntax highlighting (use `prism-react-renderer` or similar)
- Show Tailwind CSS in a collapsible panel
- Keep all existing edit/regenerate/insight functionality working
- Add "View Code" toggle for developers who want to see the raw JSX

## Acceptance Criteria

- [ ] Code Component sections display JSX preview with syntax highlighting
- [ ] CSS viewable in collapsible panel
- [ ] Existing SDC preview unchanged
- [ ] Regenerate button works for Code Component sections (calls Designer Agent)
- [ ] Section insights still functional

## Dependencies
- TASK-504

## Files to Modify

- `platform-app/src/app/onboarding/review/components/PagePreview.tsx`
