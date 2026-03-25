# TASK-398: Build reusable InferenceCard component

**Story:** US-072
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M20 — AI Transparency

## Description
Build a reusable InferenceCard component that displays AI insights in a non-blocking, dismissible card format. Appears inline within StepLayout's `insightSlot`.

## Technical Approach
1. Create `platform-app/src/components/onboarding/InferenceCard.tsx` ("use client")
2. Props: `{ title?, items, explanation, onConfirm, onEdit, editLabel?, isLoading?, autoDismissMs? }`
3. Render: title → items list (text or bulleted) → explanation → two buttons
4. Loading state: skeleton with `animate-pulse` placeholder lines
5. Enter animation: CSS `@keyframes` (opacity 0→1, translateY 8px→0, 200ms ease)
6. Auto-dismiss: `setTimeout` that calls `onConfirm` after `autoDismissMs` (default 30s, clearable on unmount)
7. Item rendering: `type: "text"` → single value span; `type: "list"` → `<ul>` with `<li>` items
8. Styling: `bg-white/5 border border-brand-500/20 rounded-xl p-4` with `text-sm text-zinc-300`

## Component Specification
```typescript
interface InferenceCardProps {
  title?: string;                    // default: "AI understood"
  items: InferenceCardItem[];
  explanation: string;
  onConfirm: () => void;
  onEdit: () => void;
  editLabel?: string;                // default: "Edit my description"
  isLoading?: boolean;
  autoDismissMs?: number;            // default: 30000
}
interface InferenceCardItem {
  label: string;
  value: string | string[];
  type?: "text" | "list";
}
```

## Acceptance Criteria
- [ ] Renders text items as "Label: Value" and list items as bulleted sub-lists
- [ ] Shows skeleton with pulse animation when `isLoading` is true
- [ ] "Looks right" button calls `onConfirm`; "Edit" button calls `onEdit`
- [ ] Auto-dismisses after 30s by default (calls onConfirm)
- [ ] Enter animation plays on mount (CSS only, no Framer Motion)
- [ ] `role="status"` and `aria-live="polite"` for screen reader announcement
- [ ] Meets WCAG AA color contrast on `bg-white/5` background
- [ ] Unit tests: renders items, calls callbacks, auto-dismiss timer, loading state

## Dependencies
- None — pure UI component

## Files Affected
- `platform-app/src/components/onboarding/InferenceCard.tsx` (NEW)
