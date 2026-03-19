# TASK-272: Auth Screen Redesign — Split Layout with Value Proposition

**Story:** AUTH-1, AUTH-2, AUTH-4, AUTH-7
**Priority:** P0
**Effort:** M
**Sprint:** 15

## Description

Redesign login and register pages to communicate product identity and value. Replace the current centered-card-on-dark-gradient with a split layout.

### Deliverables

1. **Split layout (AUTH-2):** Left panel with value proposition visual (illustration, screenshot, or benefit statements). Right panel with auth form
2. **Logo placement (AUTH-1):** Product logo visible above or within the auth form
3. **Visual distinction (AUTH-4):** Auth screen background/styling is distinct from onboarding (not the same dark gradient everywhere)
4. **Value copy (AUTH-7):** Register page communicates specific value: "AI builds your Drupal website in under 5 minutes" — not generic "Start building"

### Implementation Notes

- Reuse brand tokens from TASK-271
- Consider light background for auth pages to break the dark-only pattern
- Left panel can use a simple illustration or styled text with product screenshots
- Mobile: stack vertically (value prop above, form below)

## Acceptance Criteria

- [ ] Login page has split layout with value proposition panel
- [ ] Register page has split layout with specific value messaging
- [ ] Product logo visible on both auth pages
- [ ] Auth pages are visually distinct from onboarding flow
- [ ] Responsive: works on mobile (stacked layout)

## Dependencies

- TASK-271 (brand identity — colors, logo, fonts)
