# TASK-486: Add `messages[]` to Pipeline Phase Status

**Story:** US-093
**Effort:** M
**Milestone:** M20 — AI Transparency

## Description
Extend each pipeline phase (research, plan, generate, enhance) to emit granular reasoning messages during execution. These messages surface Archie's thinking on the progress page.

## Technical Approach

### Backend Changes

1. **Extend phase status schema** — Add `messages: string[]` to the pipeline status stored in the database
2. **Research phase** — Emit messages like:
   - "Researching {industry} industry..."
   - "Found {N} core services: {list}"
   - "Compliance requirements: {flags}"
   - "Analyzing competitors and audience pain points"
3. **Plan phase** — Emit messages like:
   - "Planning {N} pages based on industry analysis"
   - "Homepage: hero with trust signals + service overview"
   - "Adding {pageName} — {rationale}"
4. **Generate phase** — Emit per-page messages:
   - "Writing {pageName} content..."
   - "Leading with {differentiator} in hero section"
   - "Including {N} sections: {section types}"
   - Show first ~100 chars of hero heading as preview
5. **Enhance phase** — Emit image resolution messages:
   - "Matching images for {pageName}..."
   - "User photo matched to {sectionName} (score: {score})"
   - "Pexels fallback: searching '{query}'"
   - "{N} of {total} image slots filled"

### Implementation
- Add helper `emitMessage(siteId, phase, message)` that appends to the phase's messages array in the DB
- Call at key decision points in each phase (not every line — aim for 3-5 messages per phase)
- Messages returned via existing `/api/provision/status` polling endpoint

## Acceptance Criteria
- [ ] Each pipeline phase emits 3-5 reasoning messages during execution
- [ ] Messages are stored in the blueprint/pipeline status and returned by the status API
- [ ] Messages are human-readable, Archie-voiced, and specific to the site being built
- [ ] No performance regression — message writes are fire-and-forget (non-blocking)
- [ ] Generate phase includes page name and first-line preview per page

## Files
- `platform-app/src/lib/pipeline/phases/generate.ts` (emit messages)
- `platform-app/src/lib/pipeline/phases/enhance.ts` (emit messages)
- `platform-app/src/lib/pipeline/orchestrator.ts` (emit messages for research/plan, add helper)
- `platform-app/src/app/api/provision/status/route.ts` (return messages in response)
