# Sprint 48: UX Modernization — Step Consolidation Part 1

**Milestone:** M25 — Onboarding UX Modernization
**Duration:** 2 days
**Predecessor:** Sprint 47 (Foundation — TODO)
**Architecture:** `architecture-onboarding-ux-modernization.md` (ADR-1)

## Sprint Goal

Build the two largest composite onboarding pages — `describe` (merging name + idea + audience) and `style` (merging theme + design + tone). These reduce the step count from 13 to 7 remaining unique steps.

## Tasks

| ID | Task | Effort | Depends On | Status |
|----|------|--------|------------|--------|
| TASK-478 | Composite step — Describe page (name + idea + audience) | L | TASK-474, TASK-475 | TODO |
| TASK-479 | Composite step — Style page (theme + design + tone) | L | TASK-474 | TODO |

## Execution Order

```
Wave 1 (parallel): TASK-478, TASK-479
  - Both are independent composite pages
  - Each creates a new page, migrates existing UI, and adds redirects
  - TASK-478 is the more complex one (3 inputs + 2 AI endpoints + inference card merge)
  - TASK-479 merges 3 aesthetic selections into sections
```

## Page Architecture

### TASK-478: `/onboarding/describe`
```
┌──────────────────────────────┬─────────────────────────┐
│ Section 1: Business Name     │                         │
│ [text input, xl, autofocus]  │     ArchiePanel         │
│                              │                         │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  Tips → InferenceCard   │
│ Section 2: Description       │  (combined analysis:    │
│ [textarea, 4 rows]           │   industry, services,   │
│ [validation hints]           │   audience, pain points) │
│                              │                         │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │                         │
│ Section 3: Target Audience   │                         │
│ [text input + AI pills]      │                         │
│                              │                         │
│        [Continue →]          │                         │
└──────────────────────────────┴─────────────────────────┘
```

### TASK-479: `/onboarding/style`
```
┌──────────────────────────────┬─────────────────────────┐
│ Section 1: Visual Theme      │                         │
│ [3 theme radio cards, grid]  │     ArchiePanel         │
│                              │                         │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  Tips → InferenceCard   │
│ Section 2: Design Source     │  (combined: theme +     │
│ [2 radio options, inline]    │   tone + personality)   │
│                              │                         │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │                         │
│ Section 3: Brand Voice       │                         │
│ [tone cards, 2-col grid]     │                         │
│ [differentiator input]       │                         │
│ [▶ Advanced options]         │                         │
│                              │                         │
│        [Continue →]          │                         │
└──────────────────────────────┴─────────────────────────┘
```

## Dependencies & Risks

- **AI endpoint coordination** — The `describe` page triggers 3 AI calls (validate-idea, analyze, suggest-audiences). Must sequence correctly: validate → analyze (on success) → suggest-audiences (on section focus).
- **Session data shape** — Existing session data uses separate fields for name, idea, audience. Composite page saves all three atomically. The `/api/onboarding/save` endpoint already supports partial updates — no API change needed.
- **Test rewrite scope** — Both tasks remove 3 old pages each. Test specs referencing `/onboarding/name`, `/onboarding/idea`, `/onboarding/audience`, `/onboarding/theme`, `/onboarding/design`, `/onboarding/tone` must be rewritten.
- **Mobile scroll depth** — Composite pages are longer. Use `scroll-mt-24` on sections and sticky Continue button on mobile.

## Effort Summary

| Size | Count | Tasks |
|------|-------|-------|
| L | 2 | TASK-478, TASK-479 |
| **Total** | **2 tasks** | |

## Definition of Done

- [ ] `/onboarding/describe` collects name, idea, and audience on one page
- [ ] `/onboarding/style` collects theme, design source, and tone on one page
- [ ] AI validation fires correctly in describe page (blur + focus triggers)
- [ ] InferenceCards show combined analysis for each composite page
- [ ] Old URLs (`/name`, `/idea`, `/audience`, `/theme`, `/design`, `/tone`) redirect
- [ ] Session save works atomically for merged fields
- [ ] Mobile layout scrollable, no overlap
- [ ] Tests updated for new page structure
