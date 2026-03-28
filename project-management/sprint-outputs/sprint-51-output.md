# Sprint 51 Output: Archie's Workshop — Engaging AI Progress Experience

**Completed:** 2026-03-27
**Tasks:** 4/4 DONE

## Deliverables

### TASK-486: Pipeline Messages & Artifacts (Backend)
- Added `pipelineMessages` (Json) and `pipelineArtifacts` (Json) fields to Site model
- Created `emitMessage()` and `emitArtifact()` helper functions in orchestrator
- Research phase emits: industry identification, key messages, compliance notes
- Plan phase emits: page count/names, site tagline
- Generate phase emits: per-page writing progress with page name
- Enhance phase emits: image placement counts
- Status API returns messages[] and artifacts{} per phase in response
- Prisma migration: `20260327135418_add_pipeline_messages_artifacts`

**Files changed:**
- `prisma/schema.prisma` — 2 new Json fields on Site
- `src/lib/pipeline/orchestrator.ts` — emitMessage/emitArtifact helpers + calls in all 4 phases
- `src/app/api/provision/status/route.ts` — messages/artifacts in PipelinePhaseStatus + response

### TASK-487: ActivityLog Component
- New `ActivityLog` component with grouped messages by phase
- Phase headers with colored bullet dots (brand=active, emerald=done, white/30=pending)
- Messages prefixed with → arrow in italic white/50
- Auto-scrolls to bottom on new messages via useEffect + scrollIntoView
- `role="log"` + `aria-live="polite"` for accessibility
- CSS fade-in animation (200ms) respecting `prefers-reduced-motion`
- Mobile collapsed mode via `maxVisible` prop with "Show all" toggle
- Bottom gradient mask for overflow indication

**Files created:**
- `src/components/onboarding/ActivityLog.tsx`
- `src/app/globals.css` — added `activity-fade-in` keyframes + animation token

### TASK-488: PipelineProgress Phase Cards with Artifacts
- Research card (complete): shows industry + key messages + compliance flags as pills
- Plan card (complete): shows page name pills in flex-wrap row
- Generate card (in_progress): shows "Page X of Y: {name}" + content preview block
- Generate card (complete): shows page name pills
- Enhance card: shows image placement counts + user photo match count
- Content preview block styled as quote with left border accent, serif italic, line-clamp-3
- All artifact displays fade in with 200ms animation
- Memo comparator updated to include artifacts in equality check

**Files changed:**
- `src/components/onboarding/PipelineProgress.tsx` — PhaseArtifacts renderer + updated PhaseCard

### TASK-489: Progress Page Split Layout
- Desktop (≥1024px): `grid-cols-[55fr_45fr]` two-column layout
  - Left: spinner + heading + PipelineProgress + provisioning + action buttons
  - Right: sticky ActivityLog with "Archie's Workshop" heading
- Mobile (<1024px): single column with collapsed 3-message ActivityLog below phase cards
- Backward compatible: works when backend returns no messages (hasMessages guard)
- All existing retry, download, and navigation buttons preserved

**Files changed:**
- `src/app/onboarding/progress/page.tsx` — split layout with ActivityLog integration

## TypeScript Status
- Zero compilation errors (`npx tsc --noEmit` passes clean)
