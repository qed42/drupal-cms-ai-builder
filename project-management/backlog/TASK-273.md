# TASK-273: Onboarding Visual Overhaul — Step Icons, Progress Indicator, Start Page

**Story:** ONB-1, ONB-2, ONB-7
**Priority:** P0
**Effort:** L
**Sprint:** 15

## Description

Transform the onboarding wizard from 10 identical dark screens into visually distinct, engaging steps.

### Deliverables

1. **Step-specific visuals (ONB-1):** Each of the 10 onboarding steps gets a unique icon or illustration relevant to its topic. Remove the generic pulsing bars animation. Options: Lucide icons at hero size, simple SVG illustrations, or styled emoji/iconography
2. **Labeled progress indicator (ONB-2):** Replace dot indicators with a visible, labeled progress bar showing: "Step 3 of 10 — Your Audience" or a segmented progress bar with step names
3. **Start page hero (ONB-7):** The first screen communicates a clear value proposition with visual impact. Not just "Let's shape your big idea" — a hero section that sells the outcome with a compelling headline, subheadline, and visual

### Implementation Notes

- Icon library: use Lucide (already likely in the project via shadcn) for step icons
- Progress bar: segmented bar component showing completed/current/upcoming steps with labels
- Start page: can include a mock website screenshot or abstract illustration showing the transformation from "answers" to "website"
- Consider varying background treatments per step or step-group for visual rhythm

## Acceptance Criteria

- [ ] Each onboarding step has a unique visual element (no generic pulsing bars)
- [ ] Progress indicator shows step number, total, and current step name
- [ ] Start page has compelling hero with value proposition
- [ ] Visual elements are relevant to each step's topic (e.g., palette icon for colors, globe for audience)
- [ ] Transitions between steps feel intentional (not hard cuts)

## Dependencies

- TASK-271 (brand identity — colors, fonts for consistent styling)
