# User Stories Index

Generated from PRD v1.0 on 2026-03-17. Updated with Content Generation v2 stories on 2026-03-19.

## Milestones & Epics

### M1 — Platform Foundation & Onboarding
The front door: user registration, trial activation, and the complete 5-step onboarding wizard.

| Story | Title | Priority | Epic | Dependencies |
|-------|-------|----------|------|-------------|
| US-001 | User Registration | P0 | User Account & Trial | None |
| US-002 | Free Trial Activation | P0 | User Account & Trial | US-001 |
| US-005 | Site Basics Input (Step 1) | P0 | Onboarding Wizard | US-001 |
| US-006 | Industry Selection (Step 2) | P0 | Onboarding Wizard | US-005 |
| US-007 | Brand Input (Step 3) | P0 | Onboarding Wizard | US-006 |
| US-008 | Business Context (Step 4) | P0 | Onboarding Wizard | US-007 |
| US-009 | Dynamic Industry Questions (Step 5) | P0 | Onboarding Wizard | US-006, US-008 |
| US-010 | Compliance Inference | P1 | Onboarding Wizard | US-009 |
| US-011 | Save & Resume Onboarding | P2 | Onboarding Wizard | US-005–009 |

### M2 — AI Site Generation Engine
The "magic moment": AI generates a complete, branded, industry-aware website from onboarding data.

| Story | Title | Priority | Epic | Dependencies |
|-------|-------|----------|------|-------------|
| US-012 | Content Type Auto-Creation | P0 | AI Generation | US-009 |
| US-013 | Page Generation with SDC Components | P0 | AI Generation | US-012 |
| US-014 | SEO Content Generation | P0 | AI Generation | US-013 |
| US-015 | CTA Generation & Placement | P0 | AI Generation | US-013, US-008 |
| US-016 | Brand Token Application | P0 | AI Generation | US-007, US-013 |
| US-017 | Structured Content Population | P0 | AI Generation | US-012, US-014 |
| US-018 | Industry-Specific Content & Disclaimers | P1 | AI Generation | US-010, US-014 |
| US-019 | Generation Progress UI | P1 | AI Generation | US-012–018 |

### M3 — Site Editing & Refinement
Post-generation editing via Canvas: inline editing, section regeneration, page management.

| Story | Title | Priority | Epic | Dependencies |
|-------|-------|----------|------|-------------|
| US-020 | Canvas Page Editor Integration | P0 | Review & Editing | US-013 |
| US-021 | Section-Level AI Regeneration | P0 | Review & Editing | US-020 |
| US-022 | Content Inline Editing | P0 | Review & Editing | US-020 |
| US-023 | Page Add & Remove | P0 | Review & Editing | US-020 |
| US-024 | Component Swap | P2 | Review & Editing | US-020 |
| US-025 | Media Management | P2 | Review & Editing | US-020 |

### M4 — Lead Capture & Forms
Auto-generated forms, submission storage, and email notifications.

| Story | Title | Priority | Epic | Dependencies |
|-------|-------|----------|------|-------------|
| US-026 | Contact Form Auto-Generation | P0 | Lead Capture | US-013 |
| US-027 | Form Submission Storage & Notifications | P0 | Lead Capture | US-026 |
| US-028 | Smart Form Fields | P2 | Lead Capture | US-026, US-009 |

### M5 — Publishing & Subscription
Go-live: draft/publish workflow, one-click publish, trial management, subscription.

| Story | Title | Priority | Epic | Dependencies |
|-------|-------|----------|------|-------------|
| US-029 | Draft Mode & Content Preview | P0 | Publishing | US-013 |
| US-030 | One-Click Publish | P0 | Publishing | US-029, US-002 |
| US-031 | Custom Domain Support | P2 | Publishing | US-030 |
| US-032 | SSL Provisioning | P0 | Publishing | US-030 |
| US-003 | Trial Expiry Notifications | P1 | User Account & Trial | US-002, US-030 |
| US-004 | Subscription Activation | P1 | User Account & Trial | US-002 |

---

## Content Generation v2 (PRD v2.0)

### M6 — Onboarding Enrichment
Enhanced wizard with industry questions, tone selection, and richer page suggestions.

| Story | Title | Priority | Epic | Dependencies |
|-------|-------|----------|------|-------------|
| US-033 | Industry-Specific Follow-up Questions | P0 | Onboarding Enhancements | US-006 |
| US-034 | Key Differentiators & Tone Selection | P0 | Onboarding Enhancements | US-006, US-008 |
| US-035 | Reference URL & Existing Copy Input | P1 | Onboarding Enhancements | US-034 |
| US-036 | Enhanced AI Page Suggestions | P0 | Onboarding Enhancements | US-005, US-006 |
| US-037 | Custom Page Addition | P1 | Onboarding Enhancements | US-036 |

### M7 — AI Content Pipeline
Multi-phase generation (Research → Plan → Generate) with provider abstraction and structured output.

| Story | Title | Priority | Epic | Dependencies |
|-------|-------|----------|------|-------------|
| US-038 | AI Provider Abstraction Layer | P0 | AI Content Pipeline | None |
| US-039 | Research Phase | P0 | AI Content Pipeline | US-038, US-033, US-034 |
| US-040 | Plan Phase with User Approval | P0 | AI Content Pipeline | US-038, US-039 |
| US-041 | Per-Page Content Generation | P0 | AI Content Pipeline | US-038, US-040 |
| US-042 | Pipeline Phase Visibility UI | P0 | AI Content Pipeline | US-039, US-040, US-041 |
| US-043 | Structured Output Enforcement & Retries | P0 | AI Content Pipeline | US-038 |
| US-044 | Pipeline Data Persistence & Versioning | P0 | AI Content Pipeline | US-039, US-040 |
| US-045 | Phase Retry & Re-run | P1 | AI Content Pipeline | US-044, US-042 |

### M8 — Content Review & Editing
Pre-provisioning content review, inline editing, and per-section/page regeneration.

| Story | Title | Priority | Epic | Dependencies |
|-------|-------|----------|------|-------------|
| US-046 | Markdown Content Preview Page | P0 | Content Review & Editing | US-041 |
| US-047 | Inline Content Editing | P0 | Content Review & Editing | US-046 |
| US-048 | Per-Section AI Regeneration | P0 | Content Review & Editing | US-046, US-038 |
| US-049 | Per-Page Regeneration | P1 | Content Review & Editing | US-048 |
| US-050 | Page Add/Remove from Review | P0 | Content Review & Editing | US-046, US-048 |
| US-051 | Version Comparison & Original Preservation | P0 | Content Review & Editing | US-047 |
| US-052 | Approve & Provision Flow | P0 | Content Review & Editing | US-046, US-047 |
| US-053 | Blueprint & Content Download | P1 | Content Review & Editing | US-046 |

### M9 — Provisioning Hardening
Step-level progress, database isolation, and failure handling.

| Story | Title | Priority | Epic | Dependencies |
|-------|-------|----------|------|-------------|
| US-054 | Step-Level Provisioning Progress with Timing | P0 | Provisioning UX | US-052 |
| US-055 | Per-Site Database Isolation | P0 | Provisioning UX | None |
| US-056 | Provisioning Failure Detail & Retry | P0 | Provisioning UX | US-054 |

### M10 — Quality Framework
Test suites, evaluation rubric, automated E2E tests, and communication artifacts.

| Story | Title | Priority | Epic | Dependencies |
|-------|-------|----------|------|-------------|
| US-057 | Synthetic Test Cases & Manual Scripts | P0 | Quality Assurance | US-039, US-040, US-041 |
| US-058 | Automated Playwright E2E Tests | P0 | Quality Assurance | US-057, US-046, US-042 |
| US-059 | Content Evaluation Rubric | P0 | Quality Assurance | US-057 |
| US-060 | Content Quality Validation & Comparison Artifacts | P1 | Quality Assurance | US-059, US-057 |
| US-061 | Vision Deck & Content Comparisons | P1 | Vision & Communication | US-060 |
| US-062 | Content Quality Dashboard | P2 | Vision & Communication | US-059, US-044 |

## Summary

| Metric | v1.0 | v2.0 (Content Gen) | Total |
|--------|------|---------------------|-------|
| Stories | 32 | 30 | 62 |
| P0 (Must Have) | 22 | 20 | 42 |
| P1 (Should Have) | 5 | 7 | 12 |
| P2 (Could Have) | 5 | 3 | 8 |
| Milestones | 5 | 5 | 10 |
| Epics | 6 | 5 | 11 |

## Dependency Graph — v1.0 (Critical Path)

```
US-001 (Registration)
  └─ US-002 (Trial)
  └─ US-005 (Basics) → US-006 (Industry) → US-007 (Brand) → US-008 (Context) → US-009 (Industry Q's)
       └─ US-010 (Compliance)
       └─ US-012 (Content Types) → US-013 (Pages) → US-014 (SEO) → US-017 (Content Population)
            └─ US-015 (CTAs)
            └─ US-016 (Brand Tokens)
            └─ US-018 (Industry Content)
            └─ US-020 (Canvas Editor) → US-021 (Regeneration)
                                      → US-022 (Inline Editing)
                                      → US-023 (Page Add/Remove)
            └─ US-026 (Forms) → US-027 (Submissions)
            └─ US-029 (Draft Mode) → US-030 (Publish) → US-032 (SSL)
```

## Dependency Graph — v2.0 Content Generation (Critical Path)

```
US-038 (AI Provider Abstraction) ─────────────────────────────────────┐
  └─ US-043 (Structured Output)                                      │
  └─ US-039 (Research) → US-040 (Plan) → US-041 (Generate)          │
       └─ US-044 (Data Persistence) → US-045 (Phase Retry)           │
       └─ US-042 (Phase Visibility UI)                                │
       └─ US-046 (Markdown Preview) → US-047 (Inline Edit) ──────┐   │
            └─ US-048 (Section Regen) → US-049 (Page Regen)       │   │
            └─ US-050 (Page Add/Remove)                            │   │
            └─ US-051 (Version Comparison)                         │   │
            └─ US-052 (Approve & Provision) → US-054 (Step Progress)  │
            └─ US-053 (Download)                 └─ US-056 (Failure Retry)
                                                                      │
US-033 (Follow-up Q's) ─┐                                            │
US-034 (Differentiators) ├─→ US-039 (Research)                       │
US-035 (Reference URLs) ─┘                                            │
US-036 (Enhanced Pages) → US-037 (Custom Pages)                      │
                                                                      │
US-055 (Per-Site DB Isolation) ──────────────── standalone ───────────┘

US-057 (Test Cases) → US-058 (Playwright E2E)
                    → US-059 (Rubric) → US-060 (Quality Validation) → US-061 (Vision Deck)
                                      → US-062 (Quality Dashboard)
```

## Open Questions Requiring BA Clarification

| # | Question | Impact | PRD Ref |
|---|----------|--------|---------|
| OQ-1 | Should Plan phase require explicit user approval or auto-proceed? | US-040 flow design | FR-202 |
| OQ-2 | Hard cap on AI cost per site generation ($0.50 target)? | US-038 model selection, US-041 call count | Budget |
| OQ-4 | Should "Skip Review" be available? | US-052 approve flow | FR-307 |
| OQ-7 | Automated AI-based scoring vs. manual rubric? | US-059 implementation scope | FR-504 |
| OQ-8 | Keep all pipeline versions or only latest + original? | US-044 storage design | FR-208 |

## Next Steps

Invoke `/architect` to design the solution architecture for the v2 stories, particularly:
- AI provider abstraction layer design (OpenAI + Anthropic)
- Multi-phase pipeline orchestration (Research → Plan → Generate)
- Content review page architecture and state management
- Pipeline data persistence schema (Prisma migrations)
- Per-site database isolation approach in DDEV and production
