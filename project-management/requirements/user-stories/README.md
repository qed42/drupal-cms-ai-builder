# User Stories Index

Generated from PRD v1.0 on 2026-03-17.

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

## Summary

| Metric | Count |
|--------|-------|
| Total Stories | 32 |
| P0 (Must Have) | 22 |
| P1 (Should Have) | 5 |
| P2 (Could Have) | 5 |
| Milestones | 5 |
| Epics | 6 |

## Dependency Graph (Critical Path)

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

## Next Steps

Invoke `/architect` to design the solution architecture for these stories, particularly:
- AI Agent orchestration architecture (Industry Agent → Page Builder Agent → Content Agent)
- Onboarding data model and site profile entity design
- Canvas + Space SDC integration approach
- Multi-tenant site isolation strategy
