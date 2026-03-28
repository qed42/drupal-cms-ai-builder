# TASK-487: Create ActivityLog Component

**Story:** US-093
**Effort:** S
**Milestone:** M20 — AI Transparency

## Description
New client component that renders a scrolling feed of Archie's reasoning messages from all pipeline phases. Used in the right column of the progress page on desktop.

## Technical Approach

### Component: `ActivityLog`
```typescript
interface ActivityLogProps {
  phases: {
    key: string;
    label: string;
    status: "pending" | "in_progress" | "complete" | "failed";
    messages: string[];
  }[];
  maxVisible?: number; // For mobile collapsed mode, default: all
}
```

### Behavior
- Renders messages grouped by phase with phase label as a header bullet
- Each message prefixed with `→` in white/50 italic
- Auto-scrolls to bottom when new messages appear (via `useEffect` + `scrollIntoView`)
- Phase headers use colored bullets: brand-500 (active), emerald-400 (done), white/30 (pending)
- New messages fade in with 200ms opacity animation
- Respects `prefers-reduced-motion`
- `role="log"` + `aria-live="polite"` for accessibility

### Styling
- Container: `bg-white/[0.02] rounded-2xl border border-white/[0.04] p-5`
- Max height: `max-h-[500px] overflow-y-auto` with scroll-smooth
- Bottom mask gradient for overflow indication

### Mobile variant
- When `maxVisible` is set, show only the last N messages with "Show all" toggle
- Used on mobile where the log renders inline below phase cards

## Acceptance Criteria
- [ ] Renders grouped messages by phase with correct bullet colors
- [ ] Auto-scrolls to latest message
- [ ] Fade-in animation on new messages (CSS-only, respects reduced-motion)
- [ ] `role="log"` and `aria-live="polite"` present
- [ ] Mobile collapsed mode works with maxVisible prop

## Files
- `platform-app/src/components/onboarding/ActivityLog.tsx` (new)
