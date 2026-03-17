# Sprint Roadmap

**Total Sprints:** 8
**Sprint Duration:** 2 weeks each
**Total Timeline:** 16 weeks (~4 months)

## Sprint Overview

| Sprint | Goal | Milestone | Tasks | Key Deliverable |
|--------|------|-----------|-------|-----------------|
| **01** | Platform Foundation | M1 | 001, 002, 003, 004, 034 | Drupal project + SiteProfile + registration + data isolation |
| **02** | Onboarding Wizard | M1 | 005, 006, 007, 008, 009, 010 | Steps 1–4 of wizard + trial activation |
| **03** | AI Agent Foundation | M1 + M2 | 011, 012, 014, 015 | Industry Analyzer Agent + Step 5 + content types + component manifest |
| **04** | AI Generation Engine | M2 | 016, 017, 019 | Generation pipeline + Page Builder Agent + brand tokens |
| **05** | Content & Forms | M2 + M4 | 018, 020, 026 | Content Generator + Form Generator + progress UI |
| **06** | Editing & Notifications | M3 + M4 | 021, 022, 023, 027 | Canvas editing + regeneration + page mgmt + form notifications |
| **07** | Publishing & Trial | M5 | 028, 029, 032, 030, 013 | Draft mode + publish + SSL + trial expiry + save/resume |
| **08** | Subscription & Polish | M5 | 031, 024, 025, 033 | Stripe billing + component swap + media + custom domains |

## Demo Milestones

```
Sprint 02 ──► DEMO 1: Onboarding wizard walkthrough (Steps 1-4)
Sprint 03 ──► DEMO 2: Full onboarding with AI-generated questions
Sprint 05 ──► DEMO 3: "Magic moment" — full site generation with content ⭐ INVESTOR DEMO CANDIDATE
Sprint 07 ──► DEMO 4: Complete end-to-end flow (register → publish) ⭐ FULL MVP DEMO
Sprint 08 ──► DEMO 5: MVP with billing — product-ready
```

## Investor Demo Strategy

**Earliest viable demo: End of Sprint 05** (~10 weeks)
- User registers → completes onboarding → AI generates a full branded website with content, CTAs, forms
- Editing and publishing not yet functional, but the "wow moment" is demo-able

**Full MVP demo: End of Sprint 07** (~14 weeks)
- Complete flow: register → onboard → generate → edit → publish → live site
- Trial management functional

**Production-ready: End of Sprint 08** (~16 weeks)
- Stripe billing, P2 polish

## Capacity Notes

- Sprint estimates assume a single senior Drupal developer (the `/dev` agent)
- XL tasks (TASK-017, 018, 026, 031) are sprint-filling and should not be paired with other complex work
- P2 tasks in Sprint 08 can be deferred if timeline pressure requires earlier launch
- If demo timeline is critical, consider: Sprint 04 is the highest-risk sprint (Page Builder Agent + Canvas integration) — allocate buffer time

## Risk Summary by Sprint

| Sprint | Risk Level | Key Risk |
|--------|-----------|----------|
| 01 | Low | Contrib module compatibility |
| 02 | Low | JS library integration (color picker, Alpine.js) |
| 03 | Medium | First AI Agent — LLM quality, ai_agents API learning curve |
| 04 | **High** | Page Builder Agent + Canvas skills — most complex integration |
| 05 | Medium | Content quality, prompt engineering iteration |
| 06 | Medium | Canvas editor customization, regeneration JS integration |
| 07 | Low–Medium | SSL/hosting infrastructure dependency |
| 08 | Medium | Stripe webhook edge cases |
