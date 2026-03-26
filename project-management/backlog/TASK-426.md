# TASK-426: Update onboarding-steps.ts with new labels and section names

**Story:** US-077
**Effort:** XS
**Status:** TODO

## Description
Update `ONBOARDING_STEPS` labels and `STEP_SECTIONS` names in `platform-app/src/lib/onboarding-steps.ts` to match the approved conversational label mapping.

## Changes

### STEP_SECTIONS names
| Current | New |
|---------|-----|
| Vision | Your Business |
| Design | Site Structure |
| Content | Brand & Style |
| Launch | Review & Build |

### ONBOARDING_STEPS labels
| Slug | Current | New |
|------|---------|-----|
| start | Welcome | Get Started |
| theme | Theme | Theme |
| name | Project Name | Your Name |
| idea | Big Idea | Your Idea |
| audience | Audience | Audience |
| pages | Page Map | Pages |
| design | Design Source | Design |
| brand | Brand | Brand |
| fonts | Fonts | Fonts |
| follow-up | Details | Details |
| tone | Tone & Voice | Voice |
| review-settings | Review & Generate | Review |

## Files
- `platform-app/src/lib/onboarding-steps.ts`

## Acceptance Criteria
- [ ] Progress stepper shows new section names
- [ ] Sidebar/navigation shows new step labels
- [ ] No TypeScript errors from const assertion changes
