# TASK-267: Content Quality Dashboard

**Story:** US-062
**Priority:** P2
**Estimated Effort:** L
**Milestone:** M10 — Quality Framework

## Description
Create a simple admin dashboard page showing aggregate content quality metrics across all generated sites. This is a "Could" priority — implement only if time permits.

## Technical Approach
- Create `platform-app/src/app/admin/quality/page.tsx` (admin-only route)
- Query aggregate data from database:
  - Average word count per site (from blueprint payloads)
  - Average generation time (from research_briefs + content_plans durations)
  - Model usage breakdown (from provider/model fields)
  - Generation failure rate
- Render as a simple dashboard with metric cards
- Protect route with admin role check (or env-based access)

## Acceptance Criteria
- [ ] Dashboard page shows aggregate metrics
- [ ] Metrics include: avg word count, avg generation time, model breakdown, failure rate
- [ ] Page is admin-only (protected)
- [ ] Data aggregated from pipeline tables

## Dependencies
- TASK-214 (Pipeline Data Models — provides data to query)

## Files/Modules Affected
- `platform-app/src/app/admin/quality/page.tsx` (new)
