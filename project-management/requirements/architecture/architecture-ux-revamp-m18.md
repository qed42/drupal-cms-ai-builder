# Architecture: UX Revamp — M18 (US-063)

## 1. System Context

The UX revamp modifies the **Next.js platform-app** only. No changes to the Drupal backend, provisioning engine, or AI pipeline internals. The architecture adds new UI layers that consume existing data.

```
┌─────────────────────────────────────────────────┐
│ User Browser                                     │
│  ┌──────────────────────────────────────────┐    │
│  │ Onboarding Flow (Next.js)                │    │
│  │  ┌────────────┐  ┌───────────────────┐   │    │
│  │  │ Input Pane  │  │ Preview/Insight   │   │    │
│  │  │ (existing   │  │ Pane (NEW)        │   │    │
│  │  │  steps)     │  │                   │   │    │
│  │  └────────────┘  └───────────────────┘   │    │
│  └──────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────┐    │
│  │ Dashboard (Next.js) — dedup fix          │    │
│  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
         │ existing APIs (no changes)
         ▼
┌─────────────────┐  ┌──────────────┐
│ Next.js API      │  │ Drupal CMS   │
│ Routes           │  │ (unchanged)  │
└─────────────────┘  └──────────────┘
```

## 2. Architecture Decisions

### ADR-M18-001: Color System Approach

**Context:** Sprint 23 proved Tailwind v4 `@theme inline` doesn't reliably emit custom CSS variables.

**Options:**
| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A | Plain `:root` CSS vars + Tailwind `@theme` reference | Reliable, vars always emitted | Two places to maintain |
| B | Tailwind v4 `@theme` (without `inline`) | Single source of truth | May still have tree-shaking issues |
| C | CSS Modules with hardcoded values | 100% reliable | Loses Tailwind utility classes |
| D | Tailwind config `colors` extension via `tailwind.config.ts` | Standard Tailwind pattern | Tailwind v4 doesn't use config files |

**Decision:** TBD — Sprint 25 research spike must test Options A and B and prove one works before committing.

**Spike test plan:**
1. Add `--color-test-blue: #4856FA` in `:root` block (not inside `@theme`)
2. Add `--color-test-blue: var(--color-test-blue)` inside `@theme inline`
3. Use `bg-test-blue` in a component
4. Verify computed style in browser equals `#4856FA`
5. If it works → Option A. If not → investigate Option B.

### ADR-M18-002: Preview Pane Architecture

**Options:**
| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A | Split-pane layout (input left, preview right) | Maximum feedback, premium feel | Major layout change, mobile complexity |
| B | Contextual insight cards (below/beside inputs) | Minimal layout change, mobile-friendly | Less dramatic, no live preview |
| C | Bottom drawer/sheet with preview | Works on mobile, progressive | Partially hidden, extra click |

**Recommendation:** Option A for desktop (≥1024px), Option B for mobile. The split-pane renders a lightweight site skeleton that updates reactively from onboarding state.

### ADR-M18-003: AI Insight Data Source

**Decision:** No new API calls. AI insights are derived from data already computed during onboarding:
- Industry detection result (from `/api/ai/analyze`)
- Page suggestions (from `/api/ai/suggest-pages`)
- Color extraction (from `/api/ai/extract-colors`)
- Tone analysis metadata

These results are already stored in the onboarding session. The insight cards simply surface them with human-friendly copy.

## 3. Component Architecture

### New Components

```
src/components/onboarding/
  PreviewPane.tsx          — Split-pane right panel (desktop)
  SiteSkeletonPreview.tsx  — Lightweight wireframe of site being built
  AiInsightCard.tsx        — "AI learned X from your input" card
  RecipeCard.tsx           — Pre-generation summary of all choices
  ProgressStepper.tsx      — Labeled section progress (Vision|Design|Content|Launch)

src/components/dashboard/
  SiteCard.tsx             — Deduplicated site card with status + actions
```

### Modified Components

```
src/app/onboarding/layout.tsx  — Split-pane wrapper (desktop) or stacked (mobile)
src/components/onboarding/StepLayout.tsx — Accept preview slot, contextual label
src/app/dashboard/page.tsx     — Fix subscription card duplication
```

### Data Flow

```
User Input → onboarding state (useOnboarding hook)
                    │
                    ├──→ AiInsightCard (reads state, generates insight copy)
                    ├──→ SiteSkeletonPreview (reads pages, colors, fonts, tone)
                    └──→ RecipeCard (aggregates all choices pre-generation)
```

No new state management needed — the existing `useOnboarding` hook and session API provide all data.

## 4. Preview Pane Design

### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────┐
│ Progress Stepper: [Vision] → [Design] → [Launch]│
├──────────────────────┬──────────────────────────┤
│   Input Pane (50%)   │   Preview Pane (50%)     │
│                      │                          │
│   Step Title         │   ┌──────────────────┐   │
│   Step Subtitle      │   │ Site Skeleton    │   │
│                      │   │ ┌──Header──────┐ │   │
│   [Input Fields]     │   │ │              │ │   │
│                      │   │ ├──Hero────────┤ │   │
│   [CTA Button]       │   │ │              │ │   │
│                      │   │ ├──Content─────┤ │   │
│   AI Insight Card    │   │ │              │ │   │
│   "We detected a     │   │ ├──Footer──────┤ │   │
│    coffee shop..."   │   │ └──────────────┘ │   │
│                      │   └──────────────────┘   │
├──────────────────────┴──────────────────────────┤
│ Step 3 of 11 — Audience                          │
└─────────────────────────────────────────────────┘
```

### Mobile Layout (<1024px)
Input pane full-width, AI Insight Card inline below inputs, no preview pane.

## 5. Sprint Architecture Map

| Sprint | Architectural Work |
|--------|--------------------|
| **S25 Research** | Tailwind v4 color spike, SaaS audit, wireframes — no code in production |
| **S26 Foundation** | Color system (proven approach), `ProgressStepper`, dashboard `SiteCard` dedup |
| **S27 AI Feedback** | `AiInsightCard` component, `RecipeCard` on generation screen |
| **S28 Preview** | `PreviewPane` + `SiteSkeletonPreview`, split-pane `layout.tsx` |
| **S29 Polish** | Animations, social proof, cross-browser QA |

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tailwind v4 color approach fails again | Blocks all visual work | S25 spike is gate — no color code until spike passes |
| Split-pane adds layout complexity | Mobile regression, step flow breaks | Desktop-only for V1; mobile stays single-pane |
| Preview pane performance | Re-renders on every keystroke | Debounce state updates to preview (300ms) |
| Scope creep | 5 sprints is a lot | Each sprint is independently shippable; can stop after S27 |

## 7. Key Technical Constraints

1. **No new API endpoints** — All insight data comes from existing onboarding session state
2. **No Tailwind config file** — Tailwind v4 is CSS-only; must solve theming in CSS
3. **Existing step structure preserved** — 11 steps stay; only UX within steps changes
4. **Must work with Turbopack** — Dev server uses Turbopack; CSS solution must be compatible

## Handoff

Invoke `/drupal-architect US-063` in a **fresh session** to break this into technical tasks for the backlog. The research sprint (S25) should be planned first.
