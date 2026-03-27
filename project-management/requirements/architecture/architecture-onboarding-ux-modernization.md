# Architecture: Onboarding UX Modernization

**Status:** Proposed
**Author:** /designer + /architect
**Date:** 2026-03-27
**Milestone:** M25 — Onboarding UX Modernization

---

## 1. Problem Statement

A comprehensive design review of the current platform identified several architectural issues limiting conversion and user experience:

1. **15-step onboarding creates fatigue** — exceeds the "2 minutes" promise and risks abandonment
2. **Color token conflict** — `brand.ts` defines teal (#14b8a6) while `globals.css` defines indigo (#4F46E5), causing visual inconsistency
3. **Right panel (ArchiePanel) underutilized** — empty 70%+ of the time, showing only a sparkle emoji
4. **No visual feedback during onboarding** — users provide input without seeing how it shapes their site
5. **Input component inconsistency** — manual Tailwind classes compete with shadcn Input across pages
6. **No page transitions** — abrupt content swaps between steps
7. **Auth page uses static copy** — no social proof or generated site examples
8. **Review page overloads** — full content editor immediately after generation

---

## 2. Architecture Decisions

### ADR-1: Consolidate Onboarding from 13 Steps to 8

**Context:** Current flow has 13 navigable steps (excluding progress/review). Many collect related information across separate pages (name+idea, brand+fonts, theme+design+tone).

**Decision:** Merge related steps into composite pages using tabs/sections within a single step.

**Current → Proposed Flow:**

```
CURRENT (13 steps):
start → theme → name → idea → audience → pages → design → brand → fonts → images → follow-up → tone → review-settings

PROPOSED (8 steps):
start → describe (name+idea+audience) → style (theme+design+tone) → brand (logo+colors+fonts) → pages → images → details (follow-up) → review-settings
```

**Step Mapping:**

| New Step | Merges | Rationale |
|----------|--------|-----------|
| `start` | start (unchanged) | Hero/CTA landing stays |
| `describe` | name + idea + audience | All "tell us about your business" inputs on one page with sections |
| `style` | theme + design + tone | All aesthetic choices belong together — visual style is one decision |
| `brand` | brand + fonts | Logo, colors, and fonts are all brand identity — tab/accordion UI |
| `pages` | pages (unchanged) | Complex enough to warrant own step |
| `images` | images (unchanged) | Upload UX needs dedicated space |
| `details` | follow-up (renamed) | Industry-specific questions, optional |
| `review-settings` | review-settings (unchanged) | Final review before generation |

**Trade-offs:**
- (+) Reduces perceived effort, improves completion rate
- (+) Groups related decisions, reduces context-switching
- (-) Composite pages are more complex to build
- (-) Mobile scroll depth increases per step
- Mitigation: Use collapsible sections and anchor-based scroll on mobile

---

### ADR-2: Resolve Color Token Conflict — Adopt Indigo as Brand Primary

**Context:** Two competing color definitions exist:
- `brand.ts`: `BRAND_COLORS` = teal scale (#14b8a6 primary)
- `globals.css`: `--color-brand-*` = indigo scale (#4F46E5 primary)

The CSS tokens in `globals.css` are what Tailwind actually uses (via `@theme inline`). The `brand.ts` exports are **dead code** — no component imports `BRAND_COLORS` for styling. They were the original design tokens before the shadcn adoption.

**Decision:** Remove `BRAND_COLORS` from `brand.ts`. The single source of truth is `globals.css` `@theme inline` block. Add semantic color aliases for status states.

**New semantic tokens to add in `globals.css`:**
```css
--color-success: #10b981;  /* emerald-500 */
--color-warning: #f59e0b;  /* amber-500 */
--color-error: #ef4444;    /* red-500 */
--color-info: #3b82f6;     /* blue-500 */
```

**Trade-offs:**
- (+) Single source of truth, no confusion
- (+) Semantic tokens reduce hardcoded color references
- (-) Must audit all `emerald-*`, `amber-*`, `red-*` usage and decide case-by-case
- Decision: Hardcoded Tailwind colors for one-off usage are acceptable; semantic tokens for recurring patterns (status badges, validation hints)

---

### ADR-3: Replace ArchiePanel Empty State with Contextual Tips

**Context:** The ArchiePanel right column shows "I'll share my thoughts as you type..." as placeholder. This wastes 50% of screen real estate on desktop and teaches users nothing.

**Decision:** Replace the empty state with a **contextual tips system** — each step defines 2-3 tips that explain:
1. What Archie will do with this input
2. An example of good input
3. A "you can change this later" reassurance

**Implementation:** Add a `tips` property to each step definition in `onboarding-steps.ts`. ArchiePanel renders tips when no inference card is active.

**Data structure:**
```typescript
export type StepTip = {
  icon: string;      // lucide icon name
  title: string;
  body: string;
};

// Added to each step definition
tips?: StepTip[];
```

**Trade-offs:**
- (+) Reduces anxiety, guides input quality
- (+) Zero API cost (static content)
- (-) Must write good copy for each step
- (-) Tips become noise if too verbose

---

### ADR-4: Live Preview Panel — Deferred to M26

**Context:** The design review's highest-impact recommendation is a live site preview that updates as users provide input. This is architecturally significant — it requires:
1. A preview rendering engine (HTML template + user tokens)
2. Real-time state synchronization across steps
3. Theme/color/font application to preview
4. Responsive preview frame (desktop/mobile toggle)

**Decision:** Defer to a dedicated milestone (M26). The current milestone focuses on consolidation, consistency, and quick wins that don't require a preview engine.

**Rationale:** Building a live preview is a 2-3 sprint effort that involves:
- Creating a preview template system (HTML/CSS with token injection)
- Iframe-based rendering with postMessage state sync
- Progressive enhancement as more data becomes available
- This is the highest-value feature but also the highest-risk — better to ship UX improvements first

---

### ADR-5: Page Transitions via CSS View Transitions

**Context:** Onboarding steps swap content abruptly with no animation.

**Decision:** Use the native CSS View Transition API with a fallback opacity crossfade for unsupported browsers. Avoid adding `framer-motion` as a dependency for this single use case.

**Implementation approach:**
- Wrap step navigation in `document.startViewTransition()` where supported
- Define `::view-transition-old` and `::view-transition-new` CSS rules for slide-left (forward) and slide-right (back) animations
- Duration: 200ms ease-out
- Respect `prefers-reduced-motion`: crossfade only, no slide

**Trade-offs:**
- (+) Zero JS bundle cost (CSS-only)
- (+) GPU-accelerated, smooth
- (-) Safari support landed in 18.2 (2025) — need fallback
- (-) Next.js App Router client navigation requires manual trigger

---

### ADR-6: Auth Page Enhancement — Generated Site Showcase

**Context:** Auth left panel has static text bullets. No visual proof of the product's output.

**Decision:** Replace the three-step text description with a **rotating showcase** of 3-4 pre-generated site screenshots. Static images, CSS animation, no carousel library.

**Implementation:**
- 3-4 curated screenshots stored in `public/showcase/`
- CSS `@keyframes` crossfade with 4s per image, 1s transition
- Fallback: show first image only if `prefers-reduced-motion`
- Keep the h2 headline and "Trusted by..." line

**Trade-offs:**
- (+) Shows value instantly ("this is what you get")
- (+) No JS, no library, just images + CSS
- (-) Screenshots must be manually curated and updated
- (-) Increases initial page weight (~200-400KB for 3-4 optimized images)
- Mitigation: Use Next.js `<Image>` with `priority` on first, `loading="lazy"` on rest

---

### ADR-7: Review Page — Read-Only First, Edit on Demand

**Context:** After generation, users land on a full content editor (sidebar + preview + section editing + regeneration). This is overwhelming immediately after a 2-3 minute wait.

**Decision:** Restructure the review flow into two modes:
1. **Preview mode** (default): Full-page read-only preview with a floating "Edit Content" button
2. **Edit mode** (on demand): Current editor UI, accessed via the button

Add a **celebration moment** before the preview: animated checkmark + "Your site is ready!" with a 2-second delay before showing the preview.

**Trade-offs:**
- (+) Emotional payoff after waiting
- (+) Reduces immediate cognitive load
- (+) Edit mode is the same code, just gated
- (-) Extra click to start editing
- Mitigation: Preview has inline "Edit this section" hover hotspots for power users

---

## 3. Component Architecture Changes

### 3.1 Step Configuration Refactor

```typescript
// onboarding-steps.ts — NEW structure
export const ONBOARDING_STEPS = [
  { slug: "start",    label: "Get Started" },
  { slug: "describe", label: "Your Business",  tips: [...] },
  { slug: "style",    label: "Style & Tone",   tips: [...] },
  { slug: "brand",    label: "Brand Identity",  tips: [...] },
  { slug: "pages",    label: "Site Pages",      tips: [...] },
  { slug: "images",   label: "Your Photos",     tips: [...] },
  { slug: "details",  label: "Content Details",  tips: [...] },
  { slug: "review-settings", label: "Review & Launch" },
] as const;

export const STEP_SECTIONS = [
  { name: "Your Business", steps: ["start", "describe"] },
  { name: "Design",        steps: ["style", "brand"] },
  { name: "Content",       steps: ["pages", "images", "details"] },
  { name: "Launch",        steps: ["review-settings"] },
] as const;
```

### 3.2 Composite Step Pages — Internal Navigation

Merged steps use **internal tab/section navigation** within a single page URL:

```
/onboarding/describe
  ├── Section: Business Name (text input)
  ├── Section: Business Description (textarea + validation)
  └── Section: Target Audience (input + AI suggestions)

/onboarding/style
  ├── Section: Theme Selection (radio cards)
  ├── Section: Design Source (radio — AI vs Figma)
  └── Section: Brand Voice (tone cards + differentiator)

/onboarding/brand
  ├── Tab: Logo & Colors (upload + extraction)
  └── Tab: Typography (font selector + preview)
```

**Pattern:** Each composite page manages its own internal state machine. The Continue button validates all sections before proceeding. Sections use `scroll-mt-*` for anchor navigation.

### 3.3 Input Standardization

All form inputs must use shadcn `Input` component with size variants:

```typescript
// Proposed Input variants (extend existing)
const inputVariants = cva("...", {
  variants: {
    inputSize: {
      default: "h-9",           // standard (shadcn default)
      lg: "h-12 px-4 text-base", // auth forms
      xl: "h-14 px-6 text-lg",   // onboarding hero inputs
    },
  },
});
```

Remove all manual `rounded-xl bg-white/10 px-6 py-4 text-lg` input styling from individual pages.

### 3.4 ArchiePanel Tips Renderer

```
ArchiePanel
  ├── isEmpty && hasTips → <TipsRenderer tips={currentStep.tips} />
  ├── isEmpty && !hasTips → <EmptyState /> (current sparkle)
  └── hasChildren → {children} (InferenceCard, as today)

TipsRenderer
  ├── Animated list (stagger-fade)
  ├── Each tip: icon + title (white/70) + body (white/40)
  └── "You can change this later" footer (white/30)
```

---

## 4. Data Flow Changes

### 4.1 Onboarding Session Save

Currently each step saves independently to `/api/onboarding/save`. With composite steps, a single step now saves multiple fields atomically.

**No API change needed** — the save endpoint already accepts partial updates. The composite page simply sends a larger payload.

### 4.2 AI Validation Triggers

Currently:
- `idea/page.tsx` calls `/api/ai/validate-idea` on blur
- `idea/page.tsx` calls `/api/ai/analyze` after validation
- `audience/page.tsx` calls `/api/ai/suggest-audiences`

After consolidation into `describe/page.tsx`:
- Idea validation triggers on blur of the description textarea (unchanged)
- Audience suggestions trigger when the user scrolls/tabs to the audience section
- Both inference results feed the same ArchiePanel on the right

### 4.3 Review Page Mode State

```typescript
type ReviewMode = "celebration" | "preview" | "edit";

// celebration → (2s auto-advance) → preview → (user click) → edit
```

The celebration state is purely client-side (no API). Preview mode uses the same blueprint data but renders read-only. Edit mode mounts the current editor components.

---

## 5. Migration Strategy

### Phase 1: Foundation (Sprint 47)
- Resolve color token conflict
- Standardize Input component variants
- Add contextual tips to ArchiePanel
- Quick wins: hover states, upload accessibility, milestone animations

### Phase 2: Step Consolidation (Sprint 48-49)
- Build composite `describe` page (merge name + idea + audience)
- Build composite `style` page (merge theme + design + tone)
- Build composite `brand` page (merge brand + fonts)
- Update step config, routing, progress stepper
- Update all test files

### Phase 3: Polish & Auth (Sprint 50)
- Page transitions (View Transition API)
- Auth page showcase carousel
- Review page read-only mode + celebration
- ProgressStepper redesign for 8 steps

### Phase 4: Live Preview (M26 — Future)
- Preview rendering engine
- Real-time state sync
- Theme/token application
- Deferred — separate architecture spec

---

## 6. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Composite pages increase mobile scroll depth | High | Medium | Collapsible sections, sticky Continue button |
| Step merge breaks existing test suite | Certain | Medium | Rewrite tests per phase — budget 1 task per composite page |
| View Transition API Safari fallback | Low | Low | CSS crossfade fallback (opacity only) |
| Contextual tips feel patronizing to power users | Medium | Low | "Hide tips" toggle saved to localStorage |
| Color token cleanup causes visual regressions | Medium | High | Screenshot comparison before/after per page |

---

## 7. Dependencies

- **shadcn/ui adoption** (Sprint 45-46, in progress) — Input variants depend on shadcn Input being standard
- **Split-pane layout** (Sprint 42, complete) — Composite pages reuse StepLayout split mode
- **Image pipeline** (Sprint 40-41, complete) — Images step unchanged

---

## 8. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Onboarding steps | 13 | 8 |
| Est. completion time | 4-5 min | 2-3 min |
| Input components using shadcn | ~30% | 100% |
| Color token sources | 2 (conflict) | 1 (globals.css) |
| ArchiePanel empty state time | ~70% | ~20% |
| Page transition animation | none | 200ms slide |
