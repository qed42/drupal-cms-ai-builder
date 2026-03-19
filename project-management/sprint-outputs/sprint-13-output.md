# Sprint 13 QA Report

**Milestone:** M8 — Content Review & Editing
**Date:** 2026-03-19
**Status:** Pass (3 bugs found — 1 High, 1 Medium, 1 Low)

## Test Results

| Task | Tests Written | Passed | Failed | Notes |
|------|--------------|--------|--------|-------|
| TASK-230 Blueprint-to-Markdown Renderer | 7 | 7 | 0 | Component labels, prop extraction, markdown output |
| TASK-231 Review Page Layout | 7 | 7 | 0 | Route, sidebar, preview, auth protection |
| TASK-232 Inline Section Editor | 10 | 10 | 0 | Edit/done toggle, auto-save, API validation |
| TASK-236 Original Version Preservation | 5 | 5 | 0 | First-edit preservation, immutability, versions API |
| TASK-238 Approve & Provision Flow | 7 | 7 | 0 | Button state, provision/start integration |
| Integration & Regression | 8 | 8 | 0 | Progress→Review flow, save status, blueprint API |
| **Total** | **44** | **44** | **0** | |

## Compilation & Regression
- TypeScript: **PASS** (0 errors)
- Sprint 10 regression: **PASS** (17/17)
- Sprint 11 regression: **PASS** (14/14)
- Sprint 12 regression: **PASS** (8/8)
- Sprint 13 dev tests: **PASS** (36/36)
- Sprint 13 QA tests: **PASS** (44/44)
- **Total regression: 119/119 passed**

## Bugs Found

| Bug ID | Task | Severity | Description | Status |
|--------|------|----------|-------------|--------|
| BUG-S13-001 | TASK-232/236 | High | Next.js route conflict: `[id]` and `[siteId]` dynamic segments coexist at `/api/blueprint/` | Open |
| BUG-S13-002 | TASK-238 | Medium | `handleApprove` and `handleSkip` are identical duplicate functions | Open |
| BUG-S13-003 | TASK-231 | Medium | No exit navigation from review page — user trapped without approve/skip | Open |

---

## BUG-S13-001: Dynamic route conflict — `[id]` vs `[siteId]` at same level

**Task:** TASK-232, TASK-236
**Severity:** High
**Status:** Open

### Steps to Reproduce
1. Observe the directory structure at `src/app/api/blueprint/`
2. Both `[id]/` and `[siteId]/` exist as sibling dynamic segments
3. `[siteId]/route.ts` handles `GET /api/blueprint/:siteId`
4. `[id]/edit/route.ts` handles `PATCH /api/blueprint/:id/edit`
5. `[id]/versions/route.ts` handles `GET /api/blueprint/:id/versions`

### Expected Result
Each API route has a unique, unambiguous path pattern. Dynamic segments at the same level should have the same parameter name.

### Actual Result
Two different parameter names (`[id]` and `[siteId]`) exist at the same routing level. While Next.js may disambiguate via sub-path matching in development mode, this is:
- An anti-pattern that violates Next.js routing conventions
- Risk of build failures in production (static generation)
- Confusing semantics: the existing route uses siteId, the new routes use blueprint ID

### Recommended Fix
Consolidate under a single dynamic segment. Options:
- **Option A:** Move edit/versions routes under `[siteId]` and look up blueprint by siteId internally: `/api/blueprint/[siteId]/edit`, `/api/blueprint/[siteId]/versions`
- **Option B:** Nest edit/versions under a `versions` or `edit` path that doesn't conflict: `/api/blueprint/edit/[blueprintId]`

### Test Reference
`tests/sprint-13-qa.test.ts: "BUG-S13-001: Dynamic route conflict"`

---

## BUG-S13-002: Duplicate `handleApprove` / `handleSkip` functions

**Task:** TASK-238
**Severity:** Medium
**Status:** Open

### Steps to Reproduce
1. Open `src/app/onboarding/review/components/ApproveButton.tsx`
2. Compare `handleApprove()` (lines 24-41) with `handleSkip()` (lines 44-61)
3. Both functions are byte-for-byte identical

### Expected Result
DRY code — a single shared function for provisioning, called by both buttons.

### Actual Result
Two identical 18-line functions. Both call the same endpoint, send the same body, and redirect to the same page. If the provisioning logic changes, both must be updated.

### Recommended Fix
Extract a single `startProvisioning()` function used by both handlers. The skip button could optionally set a flag or simply call the same function directly.

### Test Reference
`tests/sprint-13-qa.test.ts: "BUG-S13-002: handleApprove and handleSkip are duplicated"`

---

## BUG-S13-003: No exit navigation from review page

**Task:** TASK-231
**Severity:** Medium
**Status:** Open

### Steps to Reproduce
1. Complete onboarding and generation
2. Click "Review Your Content" to enter the review page
3. Try to navigate back to the dashboard without approving

### Expected Result
A "Back to Dashboard" link or close button is available in the header or sidebar, allowing users to leave the review page and return later.

### Actual Result
The only ways out are:
- "Approve & Build Site" button (requires viewing all pages)
- "Skip review" link (only visible when not all pages are viewed — triggers provisioning)
- Browser back button (undiscoverable)

The error state does show a "Go to Dashboard" link, but the normal state does not.

### Recommended Fix
Add a "Back to Dashboard" link in the review page header (top bar), or a close/back icon. The user should be able to leave the review page and return to it later from the dashboard.

### Test Reference
`tests/sprint-13-qa.test.ts: "BUG-S13-003: No exit navigation from review page"`

---

## Observations
1. The `blueprintPageToMarkdown` and `blueprintToMarkdown` functions in the markdown renderer are exported but currently unused — the review UI renders props directly via React components rather than converting to markdown strings. These functions may be useful for Sprint 14's download-as-markdown feature (TASK-239).
2. Only one section can be edited at a time (single `editingSection` state). This is intentional per the implementation but worth noting for UX feedback.
3. The review page uses `useSearchParams()` without a Suspense boundary — this is a pre-existing pattern across all onboarding pages that will need to be addressed before production builds.

## Tasks Delivered

| ID | Task | Status | Files |
|----|------|--------|-------|
| TASK-230 | Blueprint-to-Markdown Renderer | Done | `src/lib/blueprint/markdown-renderer.ts` |
| TASK-231 | Review Page Layout | Done | `src/app/onboarding/review/page.tsx`, `components/PageSidebar.tsx`, `components/PagePreview.tsx` |
| TASK-232 | Inline Section Editor | Done | `PagePreview.tsx`, `hooks/useAutoSave.ts`, `api/blueprint/[id]/edit/route.ts` |
| TASK-236 | Original Version Preservation | Done | `api/blueprint/[id]/edit/route.ts`, `api/blueprint/[id]/versions/route.ts` |
| TASK-238 | Approve & Provision Flow | Done | `components/ApproveButton.tsx`, modified `api/provision/start/route.ts` |
