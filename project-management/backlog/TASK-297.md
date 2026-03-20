# TASK-297: Dashboard shows "Untitled Site" after naming project in onboarding

**Type:** Bug
**Priority:** P1 — High
**Severity:** Medium
**Found:** Sprint 18 QA — Visual Review (2026-03-20)

## Description

After entering a project name ("Sunny Side Bakery") in onboarding step 2 and proceeding through the wizard, returning to the dashboard still shows the site as "Untitled Site" with avatar "U". The name entered during onboarding is not persisted to the site record or the dashboard doesn't read the updated value.

## Steps to Reproduce

1. Start onboarding from dashboard ("Continue Setup")
2. Enter a project name in step 2 (e.g., "Sunny Side Bakery")
3. Proceed through steps 3-10
4. Navigate back to dashboard (or click Back until you reach dashboard)
5. Site card still shows "Untitled Site" with "U" avatar

## Expected Behavior

Dashboard should reflect the project name entered during onboarding. The avatar should show "S" (first letter of "Sunny Side Bakery").

## Acceptance Criteria

- [ ] Project name entered in step 2 is persisted to the site record in the database
- [ ] Dashboard site card shows the actual project name
- [ ] Avatar letter updates to match the first character of the project name
- [ ] Name persists across page refreshes

## Technical Notes

- Check if the onboarding name step actually calls an API to update the site record
- May be a frontend-only state issue (name stored in wizard state but never sent to backend)
