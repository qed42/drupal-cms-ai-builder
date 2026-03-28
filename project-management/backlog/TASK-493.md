# TASK-493: Input Impact Summary on Dashboard Site Card

**Story:** US-071
**Priority:** P3
**Effort:** S
**Milestone:** M20 — AI Transparency

## Description

Add a compact "Your inputs shaped" section to the dashboard site card showing 3-5 bullet points that trace AI decisions back to user inputs. Bullets are generated at pipeline completion and stored in the blueprint.

## Acceptance Criteria

- [ ] Site card on dashboard shows "Your inputs shaped" section with 3-5 bullet points
- [ ] Each bullet traces an AI decision to a user input or industry inference
- [ ] At least one bullet references something AI added proactively (compliance, FAQ, industry-standard page)
- [ ] Summary is visible without expanding — part of default card view
- [ ] Bullets update when site is regenerated
- [ ] Bullets generated during pipeline (template logic), stored as `impactSummary: string[]` — no runtime AI call

## Technical Notes

Template logic for bullet generation:
1. Tone bullet: always include, from `ResearchBrief.toneGuidance.primary`
2. Compliance bullet: include if `compliance_flags` non-empty
3. Proactive page bullet: include if AI added a page user didn't request
4. SEO bullet: "X SEO keywords targeted across Y pages"
5. Industry bullet: "Content tailored for [industry]"

Store as `blueprint.payload._impactSummary: string[]`.

## Files to Modify

- `platform-app/src/lib/pipeline/orchestrator.ts` (generate bullets at pipeline end)
- `platform-app/src/app/api/provision/status/route.ts` (include impactSummary in response)
- `platform-app/src/app/dashboard/page.tsx` (render bullets in site card)
