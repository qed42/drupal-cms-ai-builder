# TASK-276: Dashboard Redesign — Site Previews & Navigation

**Story:** DASH-1, DASH-2, DASH-4
**Priority:** P0
**Effort:** M
**Sprint:** 15

## Description

Upgrade the dashboard from a flat card layout to a professional site management interface.

### Deliverables

1. **Site card previews (DASH-1):** Each site card shows a visual preview — either a real screenshot/thumbnail of the generated site, or a stylized placeholder using the site's brand colors and page structure. Replace the plain text card
2. **Navigation structure (DASH-2):** Add sidebar or top nav with: Sites (active), Settings, Help/Support. Billing can be a stub/placeholder for now
3. **Developer actions hidden (DASH-4):** Move "Download Blueprint JSON" and similar developer/debug actions behind a "..." overflow menu, not shown as primary actions

### Implementation Notes

- Site preview: for MVP, generate a stylized card using the site's color palette + a miniaturized page structure representation (no real screenshots needed yet)
- Navigation: simple sidebar with icon + label, collapsible on mobile
- Overflow menu: use a dropdown/popover triggered by a "..." icon button on each site card
- Dashboard header should include the product logo (from TASK-271)

## Acceptance Criteria

- [ ] Each site card shows a visual preview (colors + structure, not plain text)
- [ ] Dashboard has a navigation sidebar/top nav
- [ ] Developer actions are behind an overflow menu
- [ ] Product logo in dashboard header
- [ ] Responsive layout works on mobile

## Dependencies

- TASK-271 (brand identity — colors, logo)
