# Sprint 32: Onboarding UX Bugs & Enhancements

**Milestone:** UX Polish
**Duration:** 1 day
**Predecessor:** Sprint 31 (Design System Decoupling)

## Sprint Goal

Fix visual bugs across the onboarding flow and add functional enhancements to improve input quality, transparency, and theme integration. Addresses batch task TASK-385 (BUG-385a through ENH-385l).

## Tasks

| ID | Task | Priority | Effort | Type | Status | Depends On |
|----|------|----------|--------|------|--------|------------|
| BUG-385a | Progress stepper labels stuck together | P2 | XS | Bug | DONE | — |
| BUG-385b | "Let's map your site" page sticks to top & bottom | P2 | XS | Bug | DONE | — |
| BUG-385c | "Set your brand voice" page sticks to top & bottom | P2 | XS | Bug | DONE | BUG-385b |
| BUG-385d | Color palette overflows box on review-settings | P2 | XS | Bug | DONE | — |
| BUG-385e | Try again button state doesn't reset | P1 | S | Bug | DONE | — |
| BUG-385f | Progress bar doesn't turn green on completion | P2 | XS | Bug | DONE | — |
| ENH-385g | Qualitative guardrail on "What's the big idea?" | P1 | M | Enhancement | DONE | — |
| ENH-385h | Audience step suggestions based on previous input | P2 | M | Enhancement | DONE | ENH-385g |
| ENH-385i | Transparency about how content is used during generation | P2 | S | Enhancement | DONE | — |
| ENH-385j | Media library upload (instead of only Pexels API) | P3 | XL | Enhancement | DEFERRED | — |
| ENH-385k | Color extraction & theme mapping via adapter | P1 | M | Enhancement | DONE | — |
| ENH-385l | Remove section-level regenerate buttons from Review Content | P2 | XS | Enhancement | DONE | — |

## Execution Order

```
Parallel batch 1 (visual bugs):
  • BUG-385a — ProgressStepper spacing fix
  • BUG-385b/c — StepLayout vertical padding
  • BUG-385d — Color palette flex-wrap
  • BUG-385f — Progress bar green on completion

Sequential (state logic):
  • BUG-385e — Retry polling race condition fix

Parallel batch 2 (enhancements):
  • ENH-385g — Validate idea API + UI integration
  • ENH-385h — Suggest audiences API + UI integration
  • ENH-385i — Transparency copy on review-settings

Sequential (pipeline):
  • ENH-385k — Replace mapColorsToSpaceDS with adapter.prepareBrandPayload()
  • ENH-385l — Remove section regenerate buttons
```

## Notes

- ENH-385j (media library upload) deferred as it requires significant new infrastructure (file upload, AI tagging, section matching). Should be its own task.
- Sprint closes the UX Polish milestone for the current release.
