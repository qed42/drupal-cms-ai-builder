# TASK-420: Generate impact summary bullets at pipeline completion

**Story:** US-071
**Priority:** P3
**Estimated Effort:** S
**Milestone:** M20 — AI Transparency

## Description
At the end of the pipeline (after all phases complete), generate 3-5 human-readable impact bullets and store them in `blueprint.payload._impact`.

## Technical Approach
1. In `platform-app/src/lib/pipeline/orchestrator.ts`, after all phases complete:
   - Load ResearchBrief and ContentPlan for the site
   - Load onboarding data (to compare AI-added pages vs. user-requested pages)
   - Call `buildImpactBullets(brief, plan, onboardingData)` from summary-templates.ts
   - Store result in `blueprint.payload._impact`
2. Bullet generation logic (template-based):
   - Always: tone bullet from `brief.toneGuidance.primary`
   - If compliance_flags non-empty: compliance bullet
   - If plan has pages not in onboarding data: proactive page bullet
   - Always: SEO keyword count bullet
   - If industry detected: industry-specific bullet

## Acceptance Criteria
- [ ] 3-5 bullets generated and stored in `blueprint.payload._impact`
- [ ] At least one bullet references AI proactivity (something added beyond user request)
- [ ] Bullets are human-readable sentences, not data labels
- [ ] Existing blueprint data is not overwritten (only `_impact` field is added)
- [ ] Handles edge cases: no compliance flags, no proactive pages, missing data

## Dependencies
- TASK-405 (summary template functions — `buildImpactBullets`)

## Files Affected
- `platform-app/src/lib/pipeline/orchestrator.ts`
