# TASK-275: Generation Progress UX — User-Friendly Labels & Completion State

**Story:** GEN-1, GEN-4
**Priority:** P0
**Effort:** M
**Sprint:** 15

## Description

Replace technical pipeline labels with user-meaningful language and add a meaningful completion state.

### Deliverables

1. **User-friendly phase labels (GEN-1):** Replace "Research → Plan → Generate" with:
   - "Analyzing your business..." (Research phase)
   - "Designing your pages..." (Plan phase)
   - "Writing your content..." (Generate phase)
2. **Completion state with preview (GEN-4):** When generation finishes, show a summary of what was generated:
   - Number of pages created
   - Key content highlights
   - Design preview or stylized summary
   - Clear CTA: "Review Your Website" (leads to content review page)
   - Not just a green checkmark and "Your website is ready!"

### Implementation Notes

- Update `PipelineProgress.tsx` component label mappings
- Update `provision/status` API response or add a label transformation layer in the frontend
- Completion state: pull from the generated blueprint to show page count, page names, and a mini-preview
- Consider a subtle celebration animation on completion (confetti is P2, but a check-to-summary transition is P0)

## Acceptance Criteria

- [ ] No internal pipeline terms ("Research", "Plan", "Generate") visible to users
- [ ] Each phase shows user-meaningful description of what's happening
- [ ] Completion state shows what was generated (page count, page names)
- [ ] Clear CTA button to proceed to content review
- [ ] Error states explain the issue in plain language

## Dependencies

- TASK-271 (brand identity for consistent styling)
