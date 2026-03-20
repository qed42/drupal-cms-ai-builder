# TASK-298: Settings and Help nav links return 404

**Type:** Bug
**Priority:** P1 — High
**Severity:** Medium
**Found:** Sprint 18 QA — Visual Review (2026-03-20)

## Description

The dashboard header navigation includes "Settings" and "Help" links that both lead to 404 pages. These are prominent nav items visible on every authenticated page — broken nav links erode user trust in a SaaS product.

## Steps to Reproduce

1. Log in and reach the dashboard
2. Click "Settings" in the top nav → 404
3. Click "Help" in the top nav → 404

## Expected Behavior

Either implement the pages or remove/disable the nav links until they're ready.

## Acceptance Criteria

- [ ] `/settings` either renders a settings page or the nav link is hidden/disabled with "Coming Soon"
- [ ] `/help` either renders a help page or the nav link is hidden/disabled with "Coming Soon"
- [ ] No 404 pages reachable from primary navigation

## Technical Notes

- Minimum viable: create placeholder pages with "Coming Soon" messaging
- Or: hide the nav items behind a feature flag until implemented
- The "Upgrade Plan (Coming Soon)" button on dashboard is a good pattern to follow — disabled with label
