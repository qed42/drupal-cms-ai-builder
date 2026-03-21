# TASK-342: Live Preview UX Research & Wireframes

**Story:** US-063
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M18 — UX Revamp

## Description
Research split-pane and side-panel preview patterns in website builders. Evaluate feasibility of a lightweight preview panel showing how onboarding choices affect the site layout. Produce wireframes for the split-pane onboarding layout.

## Technical Approach
1. Audit preview patterns in: Webflow, Framer, Squarespace, Wix, WordPress block editor
2. Document:
   - Split-pane ratios (50/50, 60/40, etc.)
   - What the preview shows at each stage (skeleton, wireframe, live)
   - How preview updates are triggered (on blur, debounced keystroke, button click)
   - Mobile handling (collapsed, bottom sheet, omitted)
3. Evaluate our feasibility:
   - Desktop (≥1024px): split-pane with `SiteSkeletonPreview`
   - Tablet: consider collapsible side panel
   - Mobile (<768px): no preview pane, use inline `AiInsightCard` instead
4. Create wireframes for:
   - Split-pane layout for input steps (name, idea, audience)
   - Split-pane layout for design steps (pages, design, brand, fonts) with richer preview
   - Recipe card view for review-settings step
   - Mobile stacked layout
5. Define state sync: `useOnboarding` hook → debounced preview update (300ms)

## Acceptance Criteria
- [ ] Research covers at least 4 builder products
- [ ] Wireframes for desktop split-pane, tablet, and mobile layouts
- [ ] Technical feasibility assessment for preview rendering approach
- [ ] Recommended split-pane ratio and breakpoint strategy

## Dependencies
- TASK-340 (SaaS research informs layout decisions)

## Files/Modules Affected
- `project-management/sprint-outputs/s25-preview-ux-research.md` (new)
