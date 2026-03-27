# TASK-447: Create ArchiePanel Right-Pane Wrapper Component

**Story:** US-090
**Effort:** M
**Milestone:** M20 — AI Transparency

## Description
Create a new `ArchiePanel` component that wraps the right pane in split-mode steps. It provides consistent framing, handles four visual states (empty, loading, populated, confirmed), and manages enter transitions.

## Implementation Details
- Props: `children: React.ReactNode`, `isEmpty: boolean`
- **Empty state**: Archie avatar (sparkle icon or similar) + "I'll share my thoughts as you type..." in `text-white/30`
- **Loading state**: Render children (InferenceCard with `isLoading=true`), vertically centered
- **Populated state**: Render children with `sticky top-12` positioning
- **Confirmed state**: Handled by InferenceCard compact variant (TASK-448), not ArchiePanel
- Container styling: `bg-white/[0.02] rounded-2xl border border-white/[0.04] p-6`
- Enter transition: `opacity-0 translateX(8px)` → `opacity-1 translateX(0)` over 300ms
- Use CSS-only transition (GPU-accelerated `transform` + `opacity`)
- Add `@media (prefers-reduced-motion: reduce)` to disable animation
- Vertically center empty/loading states; top-align populated state

## Acceptance Criteria
- [ ] Empty state shows placeholder with Archie branding
- [ ] Loading state shows children (skeleton) centered vertically
- [ ] Populated state renders children with sticky positioning
- [ ] Enter animation plays on content arrival, respects reduced-motion
- [ ] Container styling matches design spec (subtle glass-morphism)

## Dependencies
- None — standalone component

## Files
- `platform-app/src/components/onboarding/ArchiePanel.tsx` (create)
