# Architecture: Split-Pane Onboarding Layout

**Milestone:** M20 — AI Transparency
**Status:** Proposed
**Date:** 2026-03-26
**Related Stories:** US-072 (InferenceCard), US-073 (Analyze API enrichment)

## Problem Statement

All 13 onboarding steps currently use `StepLayout` in "centered" single-column mode (`max-w-xl`). Seven steps render InferenceCards via `insightSlot`, but these stack vertically below the input, causing:

1. **Below-fold AI output** — On shorter viewports, Archie's analysis is pushed off-screen
2. **Missed transparency value** — Users may never see AI reasoning, defeating M20's goal
3. **Visual monotony** — Every step looks identical regardless of complexity

## Solution: Contextual Split Layout

Upgrade `StepLayout` to render AI-heavy steps in a two-column split layout on desktop (≥1024px), with Archie's analysis panel on the right. Simple steps remain centered.

### Step Classification

| Step | Layout Mode | Right Pane Content | Rationale |
|------|------------|-------------------|-----------|
| start | centered | — | Welcome screen, no AI output |
| theme | centered | — | Card grid needs full width |
| name | centered | — | Single input, no inference |
| **idea** | **split** | Industry, services, compliance | Rich AI analysis |
| **audience** | **split** | Pain points, audience profile | Rich AI analysis |
| **pages** | **split** | Page rationale, SEO signals | Has InferenceCard |
| design | centered | — | Binary choice, no inference |
| **brand** | **split** | Palette analysis, contrast | Has InferenceCard |
| **fonts** | **split** | Readability/pairing rationale | Has InferenceCard |
| images | centered | — | Upload UI needs full width |
| **follow-up** | **split** | Contextual insights (new) | Dynamic questions warrant AI feedback |
| **tone** | **split** | Tone analysis, CTA style | Has InferenceCard |
| review-settings | summary | — | Already uses summary mode |

**7 steps → split**, 5 steps → centered, 1 step → summary.

## Component Architecture

### 1. StepLayout Changes

`StepLayout` already has three modes: `centered`, `split`, `summary`. The `split` mode currently only renders `previewSlot` in the right column and places `insightSlot` in the left column.

**Change:** When `layoutMode="split"` and no `previewSlot` is provided, render `insightSlot` in the right column instead of the left.

```
Current split mode:
  Left: title + subtitle + children + insightSlot + nav + progress
  Right: previewSlot

Proposed split mode (no previewSlot):
  Left: title + subtitle + children + nav + progress
  Right: insightSlot (wrapped in ArchiePanel)
```

**Grid ratio change:** `grid-cols-[45fr_55fr]` → `grid-cols-2` (50/50) when rendering insightSlot on the right. The 45/55 ratio was designed for large preview panels; InferenceCards are lighter-weight.

### 2. ArchiePanel Component (New)

A wrapper component for the right pane that provides consistent framing across all split-mode steps.

```typescript
interface ArchiePanelProps {
  children: React.ReactNode;  // InferenceCard or loading state
  isEmpty: boolean;           // No AI data yet
}
```

**States:**
- **Empty** — Archie avatar + "I'll share my thoughts as you type..." placeholder text
- **Loading** — Existing InferenceCard skeleton, vertically centered
- **Populated** — InferenceCard content with `sticky top-12` positioning
- **Confirmed** — Collapsed single-line summary after user taps "Looks right"

**Styling:**
```css
bg-white/[0.02] rounded-2xl border border-white/[0.04] p-6
```

**Transitions:**
- Enter: `opacity-0 translateX(8px)` → `opacity-1 translateX(0)` over 300ms
- CSS-only, GPU-accelerated (`transform` + `opacity`)
- Respects `prefers-reduced-motion`

### 3. InferenceCard Enhancement

Add a `compact` variant for the confirmed/collapsed state:

```typescript
// Existing props + new:
interface InferenceCardProps {
  // ... existing
  variant?: "full" | "compact";  // default: "full"
}
```

**Compact variant** renders a single-line summary:
```
✓ Industry: Dental · HIPAA · 3 services detected
```

This keeps the right pane populated after confirmation rather than going empty.

### 4. Page-Level Changes

Each split-mode step page needs:
1. Add `layoutMode="split"` prop to `<StepLayout>`
2. No other changes — `insightSlot` prop already carries the InferenceCard

For `follow-up` step: add a new InferenceCard showing contextual insights based on accumulated answers.

## Responsive Behavior

| Breakpoint | Behavior |
|-----------|----------|
| ≥ 1024px (`lg:`) | Two-column split layout |
| < 1024px | Single column, InferenceCard below input (current behavior) |

On mobile, `ArchiePanel` is not rendered as a separate pane. The `insightSlot` falls back to inline rendering below the input, matching current behavior.

## Data Flow

No new API calls. The split layout is purely a presentation change:

```
Step Page
  ├── Fetches AI analysis (existing endpoints)
  ├── Builds InferenceCard items (existing logic)
  └── Passes insightSlot to StepLayout
        └── StepLayout renders in right column (instead of below input)
```

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Split layout feels empty before AI responds | Visual awkwardness on right pane | ArchiePanel empty state with placeholder |
| Horizontal layout shifts on slow AI responses | Layout jank | Split grid is always rendered; right pane content animates in |
| Steps with long form content (follow-up, tone) overflow left pane | Scroll mismatch between panes | Right pane uses `sticky top-12` so it stays visible |
| Mobile bottom sheet (US-072 AC) not yet implemented | InferenceCard still stacks on mobile | Out of scope for this work; existing mobile stacking is acceptable |

## ADR: Grid Ratio

**Decision:** Use 50/50 split (`grid-cols-2`) instead of the existing 45/55.

**Context:** The existing 45/55 split was designed for a future live preview panel (heavy visual content). InferenceCards are text-based, lighter-weight.

**Alternatives considered:**
1. Keep 45/55 — Right pane feels oversized for text content
2. 60/40 — Right pane too cramped for multi-item InferenceCards
3. **50/50** — Balanced, gives both panes equal visual weight ✓

## ADR: Contextual vs. Universal Split

**Decision:** Only AI-heavy steps use split layout. Simple steps remain centered.

**Context:** A universal split would create empty right panes on steps like `start`, `name`, `theme`, `design`.

**Alternatives considered:**
1. Universal split with cumulative Archie context in right pane — Over-engineered for v1, adds state management complexity
2. **Contextual split** — Simple steps stay centered, creating rhythm in the journey ✓
3. Split only for steps with InferenceCards — Same as option 2, since InferenceCard presence maps to AI-heavy steps

## Implementation Scope

### Files Modified
- `platform-app/src/components/onboarding/StepLayout.tsx` — Right-column insightSlot rendering, grid ratio
- `platform-app/src/components/onboarding/InferenceCard.tsx` — Compact variant
- `platform-app/src/app/onboarding/idea/page.tsx` — Add `layoutMode="split"`
- `platform-app/src/app/onboarding/audience/page.tsx` — Add `layoutMode="split"`
- `platform-app/src/app/onboarding/pages/page.tsx` — Add `layoutMode="split"`
- `platform-app/src/app/onboarding/brand/page.tsx` — Add `layoutMode="split"`
- `platform-app/src/app/onboarding/fonts/page.tsx` — Add `layoutMode="split"`
- `platform-app/src/app/onboarding/tone/page.tsx` — Add `layoutMode="split"`
- `platform-app/src/app/onboarding/follow-up/page.tsx` — Add InferenceCard + `layoutMode="split"`

### Files Created
- `platform-app/src/components/onboarding/ArchiePanel.tsx` — Right pane wrapper

### Estimated Scope
~200-250 LOC changed across 10 files. No new API endpoints. No database changes.

## Handoff

This architecture is ready for `/tpm` to create:
1. A new user story (US-090+) for the split-pane layout feature
2. Task breakdown for sprint planning
3. The follow-up step InferenceCard may warrant its own task since it requires new AI analysis
