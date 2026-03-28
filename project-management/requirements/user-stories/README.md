# User Stories Index

Generated from PRD v1.0 on 2026-03-17. Updated through M25 on 2026-03-28.

## Milestone Completion Status

| Milestone | Stories | Sprints | Status |
|-----------|---------|---------|--------|
| M1 — Platform Foundation & Onboarding | 9 | 01–02 | COMPLETE |
| M2 — AI Site Generation Engine | 8 | 02–04 | COMPLETE |
| M3 — Site Editing & Refinement | 6 | 03–05 | COMPLETE |
| M4 — Lead Capture & Forms | 3 | 05 | COMPLETE |
| M5 — Publishing & Subscription | 6 | — | DEFERRED |
| M6 — Onboarding Enrichment | 5 | 09–10 | COMPLETE |
| M7 — AI Content Pipeline | 8 | 09–12 | COMPLETE |
| M8 — Content Review & Editing | 8 | 13–14 | COMPLETE |
| M9 — Provisioning Hardening | 3 | 18–20 | COMPLETE |
| M10 — Quality Framework | 6 | 14 | PARTIAL |
| M18 — UX Revamp | 1 | 25–29 | COMPLETE |
| M20 — AI Transparency | 16 | 30–39, 51 | MOSTLY COMPLETE |
| M21 — Content Quality Hardening | 3 | 20–21, 38 | COMPLETE |
| M22 — User-Uploaded Images | 6 | 38–41 | COMPLETE |
| M23 — AWS Deployment | 4 | 44 | COMPLETE |
| M24 — UI Component System | 1 | 45–46 | COMPLETE |
| M25 — Onboarding UX Modernization | — | 47–50 | COMPLETE |

---

## Milestones & Epics

### M1 — Platform Foundation & Onboarding
The front door: user registration, trial activation, and the complete 5-step onboarding wizard.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-001 | User Registration | P0 | User Account & Trial | None | DONE |
| US-002 | Free Trial Activation | P0 | User Account & Trial | US-001 | DONE |
| US-005 | Site Basics Input (Step 1) | P0 | Onboarding Wizard | US-001 | DONE |
| US-006 | Industry Selection (Step 2) | P0 | Onboarding Wizard | US-005 | DONE |
| US-007 | Brand Input (Step 3) | P0 | Onboarding Wizard | US-006 | DONE |
| US-008 | Business Context (Step 4) | P0 | Onboarding Wizard | US-007 | DONE |
| US-009 | Dynamic Industry Questions (Step 5) | P0 | Onboarding Wizard | US-006, US-008 | DONE |
| US-010 | Compliance Inference | P1 | Onboarding Wizard | US-009 | DONE |
| US-011 | Save & Resume Onboarding | P2 | Onboarding Wizard | US-005–009 | DONE |

### M2 — AI Site Generation Engine
The "magic moment": AI generates a complete, branded, industry-aware website from onboarding data.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-012 | Content Type Auto-Creation | P0 | AI Generation | US-009 | DONE |
| US-013 | Page Generation with SDC Components | P0 | AI Generation | US-012 | DONE |
| US-014 | SEO Content Generation | P0 | AI Generation | US-013 | DONE |
| US-015 | CTA Generation & Placement | P0 | AI Generation | US-013, US-008 | DONE |
| US-016 | Brand Token Application | P0 | AI Generation | US-007, US-013 | DONE |
| US-017 | Structured Content Population | P0 | AI Generation | US-012, US-014 | DONE |
| US-018 | Industry-Specific Content & Disclaimers | P1 | AI Generation | US-010, US-014 | DONE |
| US-019 | Generation Progress UI | P1 | AI Generation | US-012–018 | DONE |

### M3 — Site Editing & Refinement
Post-generation editing via Canvas: inline editing, section regeneration, page management.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-020 | Canvas Page Editor Integration | P0 | Review & Editing | US-013 | DONE |
| US-021 | Section-Level AI Regeneration | P0 | Review & Editing | US-020 | DONE |
| US-022 | Content Inline Editing | P0 | Review & Editing | US-020 | DONE |
| US-023 | Page Add & Remove | P0 | Review & Editing | US-020 | DONE |
| US-024 | Component Swap | P2 | Review & Editing | US-020 | DEFERRED |
| US-025 | Media Management | P2 | Review & Editing | US-020 | DEFERRED |

### M4 — Lead Capture & Forms
Auto-generated forms, submission storage, and email notifications.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-026 | Contact Form Auto-Generation | P0 | Lead Capture | US-013 | DONE |
| US-027 | Form Submission Storage & Notifications | P0 | Lead Capture | US-026 | DONE |
| US-028 | Smart Form Fields | P2 | Lead Capture | US-026, US-009 | DEFERRED |

### M5 — Publishing & Subscription (DEFERRED)
Go-live: draft/publish workflow, one-click publish, trial management, subscription.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-029 | Draft Mode & Content Preview | P0 | Publishing | US-013 | DEFERRED |
| US-030 | One-Click Publish | P0 | Publishing | US-029, US-002 | DEFERRED |
| US-031 | Custom Domain Support | P2 | Publishing | US-030 | DEFERRED |
| US-032 | SSL Provisioning | P0 | Publishing | US-030 | DEFERRED |
| US-003 | Trial Expiry Notifications | P1 | User Account & Trial | US-002, US-030 | DEFERRED |
| US-004 | Subscription Activation | P1 | User Account & Trial | US-002 | DEFERRED |

---

## Content Generation v2

### M6 — Onboarding Enrichment
Enhanced wizard with industry questions, tone selection, and richer page suggestions.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-033 | Industry-Specific Follow-up Questions | P0 | Onboarding Enhancements | US-006 | DONE |
| US-034 | Key Differentiators & Tone Selection | P0 | Onboarding Enhancements | US-006, US-008 | DONE |
| US-035 | Reference URL & Existing Copy Input | P1 | Onboarding Enhancements | US-034 | DONE |
| US-036 | Enhanced AI Page Suggestions | P0 | Onboarding Enhancements | US-005, US-006 | DONE |
| US-037 | Custom Page Addition | P1 | Onboarding Enhancements | US-036 | DONE |

### M7 — AI Content Pipeline
Multi-phase generation (Research -> Plan -> Generate) with provider abstraction and structured output.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-038 | AI Provider Abstraction Layer | P0 | AI Content Pipeline | None | DONE |
| US-039 | Research Phase | P0 | AI Content Pipeline | US-038, US-033, US-034 | DONE |
| US-040 | Plan Phase with User Approval | P0 | AI Content Pipeline | US-038, US-039 | DONE |
| US-041 | Per-Page Content Generation | P0 | AI Content Pipeline | US-038, US-040 | DONE |
| US-042 | Pipeline Phase Visibility UI | P0 | AI Content Pipeline | US-039, US-040, US-041 | DONE |
| US-043 | Structured Output Enforcement & Retries | P0 | AI Content Pipeline | US-038 | DONE |
| US-044 | Pipeline Data Persistence & Versioning | P0 | AI Content Pipeline | US-039, US-040 | DONE |
| US-045 | Phase Retry & Re-run | P1 | AI Content Pipeline | US-044, US-042 | DONE |

### M8 — Content Review & Editing
Pre-provisioning content review, inline editing, and per-section/page regeneration.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-046 | Markdown Content Preview Page | P0 | Content Review & Editing | US-041 | DONE |
| US-047 | Inline Content Editing | P0 | Content Review & Editing | US-046 | DONE |
| US-048 | Per-Section AI Regeneration | P0 | Content Review & Editing | US-046, US-038 | DONE |
| US-049 | Per-Page Regeneration | P1 | Content Review & Editing | US-048 | DONE |
| US-050 | Page Add/Remove from Review | P0 | Content Review & Editing | US-046, US-048 | DONE |
| US-051 | Version Comparison & Original Preservation | P0 | Content Review & Editing | US-047 | DONE |
| US-052 | Approve & Provision Flow | P0 | Content Review & Editing | US-046, US-047 | DONE |
| US-053 | Blueprint & Content Download | P1 | Content Review & Editing | US-046 | DONE |

### M9 — Provisioning Hardening
Step-level progress, database isolation, and failure handling.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-054 | Step-Level Provisioning Progress with Timing | P0 | Provisioning UX | US-052 | DONE |
| US-055 | Per-Site Database Isolation | P0 | Provisioning UX | None | DONE |
| US-056 | Provisioning Failure Detail & Retry | P0 | Provisioning UX | US-054 | DONE |

### M10 — Quality Framework (PARTIAL)
Test suites, evaluation rubric, automated E2E tests, and communication artifacts.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-057 | Synthetic Test Cases & Manual Scripts | P0 | Quality Assurance | US-039, US-040, US-041 | DONE |
| US-058 | Automated Playwright E2E Tests | P0 | Quality Assurance | US-057, US-046, US-042 | DONE |
| US-059 | Content Evaluation Rubric | P0 | Quality Assurance | US-057 | DONE |
| US-060 | Content Quality Validation & Comparison Artifacts | P1 | Quality Assurance | US-059, US-057 | DEFERRED |
| US-061 | Vision Deck & Content Comparisons | P1 | Vision & Communication | US-060 | DEFERRED |
| US-062 | Content Quality Dashboard | P2 | Vision & Communication | US-059, US-044 | DEFERRED |

---

## Post-v2 Milestones

### M18 — UX Revamp
Research-driven modernization of the onboarding journey and dashboard experience.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-063 | Modern Onboarding Journey & Dashboard Experience | P0 | Onboarding UX Modernization | None | DONE |

### M20 — AI Transparency
Make AI decision-making visible and trustworthy throughout the product via "Archie" persona.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-064 | AI Inference Cards on Input Steps | P1 | Transparent AI Onboarding | None | DONE |
| US-065 | AI Strategy Preview on Review Settings Page | P1 | Transparent AI Onboarding | US-066 | DONE |
| US-066 | Research Preview API Endpoint | P1 | Transparent AI Onboarding | None | DONE |
| US-067 | Live Generation Narrative on Progress Page | P2 | Transparent AI Onboarding | None | PENDING |
| US-068 | "Why This?" Section Tooltips in Review Editor | P2 | Transparent AI Onboarding | US-069 | PENDING |
| US-069 | Page-Level Insights Panel in Review Editor | P2 | Transparent AI Onboarding | TASK-290/291/292 | PENDING |
| US-070 | Store Pipeline Metadata for Transparency | P1 | Transparent AI Onboarding | None | DONE |
| US-071 | Input Impact Summary on Dashboard Site Card | P3 | Transparent AI Onboarding | US-070 | PENDING |
| US-072 | Inference Card UI Component | P1 | Transparent AI Onboarding | None | DONE |
| US-073 | Enrich Analyze API Response for Inference Cards | P1 | Transparent AI Onboarding | None | DONE |
| US-077 | Conversational Step Labels & Section Names | P1 | Transparent AI Onboarding | None | DONE |
| US-078 | Contextual Navigation Buttons | P1 | Transparent AI Onboarding | None | DONE |
| US-079 | "Archie" AI Persona Branding & InferenceCards | P1 | Transparent AI Onboarding | None | DONE |
| US-080 | AI Transparency in Page Layout | P1 | Transparent AI Onboarding | None | DONE |
| US-090 | Split-Pane Layout for AI-Heavy Steps | P1 | Transparent AI Onboarding | US-072, US-073 | DONE |
| US-093 | Engaging AI Progress ("Archie's Workshop") | P1 | Transparent AI Onboarding | US-090 | DONE |

### M21 — Content Quality Hardening
Post-generation quality checks, hero headline improvements, and design review automation.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-074 | Marketing-Grade Hero Headlines | P0 | Content Quality & SEO | None | DONE |
| US-075 | Unique Stock Images Per Section | P1 | Content Quality & SEO | None | DONE |
| US-076 | Automated Design Review Pass in Pipeline | P1 | Content Quality & SEO | US-074 | DONE |

### M22 — User-Uploaded Images
Allow users to upload custom images and have them provisioned to their Drupal site.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-081 | Allow Users to Upload Custom Images | P0 | Image Pipeline | None | DONE |
| US-082 | Image Library Management | P1 | Image Pipeline | US-081 | DONE |
| US-083 | Asset Management Interface | P1 | Image Pipeline | US-081 | DONE |
| US-084 | Image Validation & Optimization | P1 | Image Pipeline | US-081 | DONE |
| US-085 | User Image Provisioning to Drupal | P0 | Image Pipeline | US-081 | DONE |
| US-091 | Separate Image Resolution from Content Generation | P0 | Image Pipeline | None | DONE |

### M23 — AWS Deployment
Infrastructure setup for production deployment on AWS.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-086 | AWS Infrastructure Setup | P0 | Infrastructure | None | DONE |
| US-087 | Drupal Provisioning on AWS | P0 | Infrastructure | US-086 | DONE |
| US-088 | Database and File Storage on AWS | P0 | Infrastructure | US-086 | DONE |
| US-089 | DNS & SSL Configuration | P0 | Infrastructure | US-086 | DONE |

### M24 — UI Component System
Adopt shadcn/ui primitives for consistent platform app UI.

| Story | Title | Priority | Epic | Dependencies | Status |
|-------|-------|----------|------|-------------|--------|
| US-092 | Adopt shadcn/ui Primitives | P1 | UI Component System | None | DONE |

---

## Summary

| Metric | v1.0 | v2.0 | Post-v2 | Total |
|--------|------|------|---------|-------|
| Stories | 32 | 30 | 31 | 93 |
| P0 | 22 | 20 | 5 | 47 |
| P1 | 5 | 7 | 20 | 32 |
| P2 | 5 | 3 | 3 | 11 |
| P3 | 0 | 0 | 1 | 1 |
| Milestones | 5 | 5 | 7 | 17 |

| Status | Count |
|--------|-------|
| DONE | 79 |
| DEFERRED | 10 |
| PENDING | 4 |

## Remaining Work

### Pending Stories (4)
- **US-067** (P2) — Live generation narrative on progress page
- **US-068** (P2) — "Why This?" tooltips in review editor
- **US-069** (P2) — Page-level insights panel in review editor
- **US-071** (P3) — Input impact summary on dashboard site card

### Deferred Milestones
- **M5 — Publishing & Subscription** (6 stories) — Draft/publish workflow, Stripe integration, trial expiry, custom domains
- **M10 — Quality Framework** (3 stories) — Content quality validation artifacts, vision deck, quality dashboard

---

## Dependency Graphs

### v1.0 Critical Path (COMPLETE)

```
US-001 (Registration)
  +-- US-002 (Trial)
  +-- US-005 (Basics) -> US-006 (Industry) -> US-007 (Brand) -> US-008 (Context) -> US-009 (Industry Q's)
       +-- US-010 (Compliance)
       +-- US-012 (Content Types) -> US-013 (Pages) -> US-014 (SEO) -> US-017 (Content Population)
            +-- US-015 (CTAs)
            +-- US-016 (Brand Tokens)
            +-- US-018 (Industry Content)
            +-- US-020 (Canvas Editor) -> US-021 (Regeneration)
                                       -> US-022 (Inline Editing)
                                       -> US-023 (Page Add/Remove)
            +-- US-026 (Forms) -> US-027 (Submissions)
            +-- US-029 (Draft Mode) -> US-030 (Publish) -> US-032 (SSL)   [DEFERRED]
```

### v2.0 Content Generation Critical Path (COMPLETE)

```
US-038 (AI Provider Abstraction)
  +-- US-043 (Structured Output)
  +-- US-039 (Research) -> US-040 (Plan) -> US-041 (Generate)
       +-- US-044 (Data Persistence) -> US-045 (Phase Retry)
       +-- US-042 (Phase Visibility UI)
       +-- US-046 (Markdown Preview) -> US-047 (Inline Edit)
            +-- US-048 (Section Regen) -> US-049 (Page Regen)
            +-- US-050 (Page Add/Remove)
            +-- US-051 (Version Comparison)
            +-- US-052 (Approve & Provision) -> US-054 (Step Progress)
            +-- US-053 (Download)                +-- US-056 (Failure Retry)
US-033 (Follow-up Q's) --+
US-034 (Differentiators) +-> US-039 (Research)
US-035 (Reference URLs) -+
US-036 (Enhanced Pages) -> US-037 (Custom Pages)
US-055 (Per-Site DB Isolation) -- standalone
```

### M20 AI Transparency (MOSTLY COMPLETE)

```
US-072 (InferenceCard) -> US-090 (Split-Pane Layout) -> US-093 (Archie's Workshop)  [DONE]
US-073 (Analyze API) ---^
US-066 (Research Preview API) -> US-065 (Strategy Preview)                           [DONE]
US-070 (Pipeline Metadata) -> US-071 (Dashboard Impact Summary)                      [PENDING]
US-069 (Page Insights) -> US-068 (Why This? Tooltips)                                [PENDING]
US-067 (Live Narrative)                                                              [PENDING]
```

---

## Notes

- **M11-M17, M19** — These milestone numbers were used in backlog tasks for operational sprints (UX redesign, bug fixes, component coverage) but were never formalized as user stories. The work was executed through sprints 15-29.
- **Architecture pivot** — Original v1.0 tasks (task-001 to task-034) assumed pure Drupal architecture. The project pivoted to Next.js Platform + Drupal Multisite in Sprint 03. Tasks task-100+ reflect the new architecture.
- **Task file status lag** — Backlog task markdown files were not updated with completion status. Sprint files are the source of truth for task completion.

Last updated: 2026-03-28
