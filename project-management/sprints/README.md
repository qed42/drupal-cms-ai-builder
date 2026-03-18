# Sprint Roadmap (v2 Architecture)

**Total Sprints:** 6
**Sprint Duration:** 2 weeks each
**Total Timeline:** 12 weeks (~3 months)
**Architecture:** Next.js Platform + Drupal Multisite + Provisioning Engine

## Sprint Overview

| Sprint | Goal | Milestone | Tasks | Key Deliverable |
|--------|------|-----------|-------|-----------------|
| **01** | Platform Foundation | M1 | 100, 101, 102, 103 | Next.js app + auth + wizard screens 1–3 |
| **02** | Onboarding Journey | M2 | 104, 105, 106, 107, 108 | Full wizard with AI inference + brand + fonts |
| **03** | Blueprint & Drupal Prep | M3 | 109, 110, 113, 114, 115 | AI blueprint generation + Drupal services |
| **04** | Provisioning Engine | M3 | 111, 112, 122 | End-to-end: onboard → provision → live site |
| **05** | Site Editing & Dashboard | M4 | 116, 117, 118, 121 | Dashboard + auto-login + Canvas editing + forms |
| **06** | AI Regen & Subscription | M4 + M5 | 119, 120 | Section AI regeneration + Stripe billing |

## Workstream View

```
Sprint:     01          02          03          04          05          06
           ─────────  ─────────  ─────────  ─────────  ─────────  ─────────
Next.js:   [100,101]  [104,105]  [  109  ]  [  122  ]  [116,117]  [  120  ]
           [102,103]  [106,107]
                      [  108  ]
Drupal:                          [110,113]  [  112  ]  [  118  ]  [  119  ]
                                 [114,115]              [  121  ]
Provision:                                  [  111  ]
```

## Demo Milestones

```
Sprint 02 ──► DEMO 1: Full onboarding journey with AI (all 7 screens)
Sprint 04 ──► DEMO 2: "Magic moment" — onboard → AI blueprint → live site ⭐ INVESTOR DEMO
Sprint 05 ──► DEMO 3: Dashboard → Edit in Canvas → form submissions
Sprint 06 ──► DEMO 4: Full MVP with AI regen + billing ⭐ PRODUCTION-READY
```

## Investor Demo Strategy

**Earliest viable demo: End of Sprint 04** (~8 weeks)
- User registers → completes onboarding → AI generates blueprint → site provisioned and live
- The "wow moment": go from zero to a branded, content-rich website in minutes

**Full MVP demo: End of Sprint 06** (~12 weeks)
- Complete flow: register → onboard → provision → edit via Canvas → subscription management
- AI section regeneration, Stripe billing, trial management

## Capacity Notes

- Sprint estimates assume a single senior full-stack developer
- **Sprint 03 has parallel workstreams:** Next.js blueprint gen + Drupal services can be developed simultaneously
- **Sprint 04 is the highest-risk sprint:** End-to-end integration of all three layers (Next.js, Provisioning, Drupal)
- XL tasks (TASK-109, TASK-112) are sprint-filling — don't pair with other complex work
- Sprint 06 tasks are independent — can be parallelized or deferred if timeline pressure

## Risk Summary by Sprint

| Sprint | Risk Level | Key Risk |
|--------|-----------|----------|
| 01 | Low | Standard Next.js + NextAuth setup |
| 02 | Medium | AI API integration (OpenAI), color extraction reliability |
| 03 | **High** | Blueprint generation prompt engineering — must produce valid component layouts |
| 04 | **High** | End-to-end integration — multisite provisioning, Canvas CLI usage, Drush commands |
| 05 | Medium | JWT auth handoff, Canvas permission configuration |
| 06 | Medium | Canvas toolbar extensibility, Stripe webhook edge cases |
