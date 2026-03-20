# REQ: Onboarding Portal Brand Refresh — Design Inspiration Review

**Source:** Figma Make prototype — AI Website Builder Onboarding
**Date:** 2026-03-20
**Author:** Product Owner
**Scope:** Design inspiration & color scheme only — step flow and questions remain unchanged

---

## 1. Executive Summary

The design team has produced an updated brand guideline prototype for the onboarding portal. After walking through all 8 screens of the Figma prototype and comparing against our current 11-step implementation, this document captures the design language differences, what we should adopt, what works well already, and what needs careful consideration.

**Bottom line:** The Figma design introduces a more premium, AI-forward visual identity with a blue/purple/cyan color triad replacing our current teal-centric palette. The overall mood shifts from "clean utility" to "intelligent creative tool." Several UI patterns in the prototype are strong improvements we should adopt; a few are regressions from what we've already built.

---

## 2. Figma Design: Extracted Design System

### 2.1 Color Palette

| Role | Figma Hex | Current Hex | Delta |
|------|-----------|-------------|-------|
| **Primary Background** | Deep navy (~`#0B1437`) | Dark slate gradient (`#0f172a` → `#1e293b`) | Darker, richer navy vs muted slate |
| **Primary Accent** | `#4856FA` (blue) | `#14b8a6` (teal/brand-500) | **Major shift** — blue replaces teal |
| **Secondary Accent** | `#9E2EF8` (purple) | None (step-specific gradients) | **New** — no equivalent today |
| **Tertiary Accent** | `#01D1FF` (cyan) | None | **New** — no equivalent today |
| **CTA Button Fill** | `#4856FA` (solid blue) | `#14b8a6` (brand-500 teal) | Matches new primary |
| **CTA Button Alt** | White outlined with dark text | `brand-500` outlined | Different treatment |
| **Text Primary** | White | White | Same |
| **Text Secondary** | White ~60% opacity | White 60% opacity | Same |
| **Text Placeholder** | White ~30% opacity | White 30% opacity | Same |
| **Input Underline** | Gradient (blue → purple → cyan) | Teal focus ring | **New pattern** — underline vs ring |
| **Progress Bar** | Gradient (blue → cyan → purple) | Teal segmented dots | **New pattern** — gradient bar vs dots |
| **Brand Palette Defaults** | `#4856FA`, `#9E2EF8`, `#01D1FF` | Extracted from user logo | Used as default/suggested colors |

### 2.2 Typography

| Element | Figma | Current | Note |
|---------|-------|---------|------|
| Headings | Large, bold, white, serif-like feel | Inter, white, semi-bold | Figma headings feel more editorial |
| Body | Clean sans-serif | Inter | Similar approach |
| Placeholder text | Light italic appearance | Regular 30% opacity | Figma has more elegant treatment |
| Helper text | ~14px, muted | Similar | Comparable |

### 2.3 UI Component Patterns

#### Buttons
- **Primary CTA**: Solid `#4856FA` blue, rounded-full, with right arrow icon (`→`)
- **Secondary CTA**: White/outlined, rounded-full, with right arrow icon
- **Back Button**: Outlined pill with left arrow + "Back" text (top-left positioned)
- **Page Selection Pills**: Rounded-full toggle buttons (selected state TBD)
- **Font Selection Cards**: "Aa" + font name, card-style buttons

#### Input Fields
- **Text inputs**: Full-width, transparent background, **bottom-border only** (no box border), gradient underline on focus
- **Textareas**: Same bottom-border pattern with a **sparkle/AI icon** in the corner indicating AI assistance
- **Custom page input**: Inline text field with add (+) button

#### Cards
- **AI Understanding Card**: Dark card with purple AI icon, accumulates context tags as user progresses (key differentiator — see Section 3)
- **Option Cards**: 2-column grid, icon + title + description, subtle border, selection indicator
- **Upload Cards**: Icon + title + subtitle, dashed border treatment

#### Progress Indicators
- **Step Dots**: 8 dots at bottom, current step highlighted as a wider bar
- **Generation Progress**: Gradient bar (blue → cyan → purple) with animated fill
- **Loading States**: Rocket icon with circular background, animated text ("Analyzing your big idea..." → "Applying aesthetic preferences...")

#### Helper Sections
- **Collapsible tips panel**: Info icon + "How to fill this out" header
- **Bullet list**: Purple dot markers with guidance text
- **Examples section**: Quoted examples in slightly highlighted text

### 2.4 Layout & Spacing
- **Single-column centered layout** for form content (narrower max-width than current)
- **More vertical whitespace** between sections
- **Dark background throughout** (except Step 6 "Give it a face" which switches to **light/white background** for brand palette — interesting contrast shift)

---

## 3. What to Adopt (Recommended Changes)

### 3.1 Color Palette Migration — HIGH PRIORITY

**Recommendation: Adopt the blue/purple/cyan triad.**

The current teal palette feels dated compared to the Figma design. The blue-purple-cyan combination:
- Reads as more "AI-native" and premium
- Creates better visual hierarchy with three distinct accent tones
- Aligns with the gradient treatments throughout the UI

**Proposed new CSS custom properties:**
```
--color-brand-500: #4856FA  (primary blue — replaces teal)
--color-accent-purple: #9E2EF8
--color-accent-cyan: #01D1FF
```

**Acceptance Criteria:**
1. All teal (`#14b8a6`) accent usage replaced with new primary blue (`#4856FA`)
2. Brand palette scale regenerated from `#4856FA` (50 → 950)
3. Gradient accents use blue → purple → cyan where applicable
4. Progress bar/dots use gradient treatment
5. CTA buttons use new primary blue
6. No teal remnants in the onboarding flow

### 3.2 Input Field Styling — MEDIUM PRIORITY

**Recommendation: Adopt the bottom-border-only input pattern.**

The current boxed inputs (bg-white/10 with full border) feel heavier than necessary. The Figma design's transparent input with gradient underline is cleaner and more modern.

**Acceptance Criteria:**
1. Text inputs and textareas use transparent background with bottom-border only
2. Focus state shows gradient underline (blue → purple → cyan) instead of teal ring
3. Placeholder text maintains 30% white opacity
4. Textarea includes subtle AI sparkle icon in corner

### 3.3 CTA Button Treatment — MEDIUM PRIORITY

**Recommendation: Adopt the arrow-icon CTA pattern with contextual labels.**

The Figma design uses action-specific CTA labels instead of generic "Continue":
- Step 2 → "Your Audience"
- Step 3 → "Plan the Structure"
- Step 4 → "Shape the Experience"
- Step 5 → "Give It a Face"
- Step 6 → "Select a Font"
- Step 7 → "Visualize My Site"

This creates forward momentum and tells the user what's coming next.

**Acceptance Criteria:**
1. Each step's Continue button uses a contextual label describing the next step
2. Right arrow icon (→) appended to all forward CTAs
3. Solid primary-blue fill for primary CTAs
4. Back button uses outlined pill style with left arrow

### 3.4 Generation/Loading Screen — MEDIUM PRIORITY

**Recommendation: Adopt the animated generation experience.**

The Figma design's generation screen with:
- Rocket icon with circular background
- Rotating status messages ("Analyzing your big idea...", "Applying aesthetic preferences...")
- Gradient progress bar

This is more engaging than our current progress screen.

**Acceptance Criteria:**
1. Generation screen shows animated icon (rocket or similar)
2. Status text cycles through contextual messages
3. Progress bar uses blue → cyan → purple gradient
4. Completion screen shows "Your site is ready!" with Enter Editor CTA

---

## 4. What to Evaluate Carefully

### 4.1 AI Understanding Card — NEEDS DISCUSSION

The Figma design introduces a persistent "AI Understanding" card at the top of each step (Steps 2-7) that:
- Shows an AI avatar icon with contextual message
- Accumulates "context tags" from previous answers (Project Name, Project Focus, Target Audience, etc.)
- Gives the user confidence that the AI is "listening"

**This is a strong UX pattern** but represents significant implementation work:
- Requires a summary component that reads from onboarding state
- Needs dynamic messaging per step
- Takes up significant viewport real estate

**Recommendation:** Worth implementing in a future sprint. Creates a strong sense of AI partnership. But should not block the color/styling refresh.

### 4.2 Light Background for Brand Step

Step 6 ("Give it a face") in the Figma design switches to a **white/light background** — the only step that breaks from the dark theme. This makes practical sense for a brand identity step where users are picking colors and uploading logos (color accuracy matters against a neutral background).

**Recommendation:** Evaluate whether our brand step should also switch to a light background. It would improve color swatch accuracy but creates a visual discontinuity.

### 4.3 Hero Landing Animation

The Figma hero screen features animated gradient bars (purple → cyan vertical lines with motion). This is purely decorative but creates a strong first impression.

**Recommendation:** Consider adding a subtle animation to the start page. Could be CSS-only (gradient animation) rather than complex WebGL.

---

## 5. What NOT to Change

### 5.1 Step Count and Flow

The Figma prototype has 8 steps; we have 11. Per product direction, **our step flow stays as-is**. The additional steps (follow-up questions, tone & voice, review settings) provide valuable context for AI generation quality. The Figma prototype is an inspiration piece, not a spec replacement.

### 5.2 Existing Component Architecture

Our component structure (StepLayout, StepIcon, ProgressDots, etc.) is well-factored. The visual refresh should be a **CSS/styling change**, not an architectural rewrite.

### 5.3 Font Selection UX

Our current Google Fonts dropdown with preview tiles is more functional than the Figma's simpler 4-font card grid. Keep our approach — it provides more choice and real-time preview.

### 5.4 Page Selection UX

Our current page selection with AI-suggested pages, descriptions, and custom page input is more sophisticated than the Figma's simple pill buttons. Keep our approach.

---

## 6. Gap Analysis Summary

| Area | Current State | Figma Design | Action |
|------|--------------|--------------|--------|
| Primary color | Teal `#14b8a6` | Blue `#4856FA` | **Change** |
| Color palette | Single-tone + step gradients | Blue/Purple/Cyan triad | **Change** |
| Background | Slate gradient | Deep navy | **Change** (subtle) |
| Input styling | Boxed with full border | Bottom-border + gradient underline | **Change** |
| CTA labels | Generic "Continue" | Contextual per-step labels | **Change** |
| CTA arrows | None | Right arrow icons | **Change** |
| Button style | Rounded-full teal | Rounded-full blue | **Change** (color swap) |
| Progress dots | Segmented bars | Dot indicators | **Evaluate** — our bars may be better |
| AI context card | None | Persistent accumulating card | **Future sprint** |
| Hero animation | Static | Animated gradient bars | **Nice-to-have** |
| Light brand step | Dark background | White background | **Evaluate** |
| Helper sections | None | Collapsible tips + examples | **Nice-to-have** (we show hints inline) |
| Step count | 11 steps | 8 steps | **No change** |
| Font selector | Google Fonts dropdown | 4-card grid | **No change** (ours is better) |
| Page selector | AI-suggested cards | Simple pills | **No change** (ours is better) |

---

## 7. Recommended Implementation Phases

### Phase 1: Color Palette Swap (Quick Win)
- Update CSS custom properties: brand-500 → `#4856FA`
- Add accent-purple and accent-cyan variables
- Update Tailwind theme config
- Update gradient definitions
- **Estimated scope:** ~2-3 hours, low risk

### Phase 2: Input & Button Refinements
- Bottom-border input pattern
- Gradient focus underline
- Contextual CTA labels per step
- Arrow icons on CTAs
- **Estimated scope:** ~4-6 hours, low risk

### Phase 3: Generation Screen Enhancement
- Gradient progress bar
- Animated status messages
- Completion celebration screen
- **Estimated scope:** ~3-4 hours, medium risk

### Phase 4: AI Understanding Card (Future)
- Persistent context accumulation component
- Per-step messaging
- Context tag visualization
- **Estimated scope:** ~8-12 hours, medium complexity

---

## 8. Next Steps

- `/architect` — Technical design for the color palette migration (CSS variable strategy, gradient definitions)
- `/drupal-architect` — Create backlog tasks (TASK-328+) for each implementation phase
- `/dev` — Implement Phase 1 (color swap) as a quick win
