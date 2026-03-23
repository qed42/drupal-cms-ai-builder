# Sprint 32 Output: Onboarding UX Bugs & Enhancements

**Milestone:** UX Polish
**Date:** 2026-03-23
**Branch:** `feature/m19-design-system-abstraction`

## Completed Tasks

| ID | Task | Status |
|----|------|--------|
| BUG-385a | Progress stepper labels stuck together | DONE |
| BUG-385b | "Let's map your site" page sticks to top & bottom | DONE |
| BUG-385c | "Set your brand voice" page sticks to top & bottom | DONE |
| BUG-385d | Color palette overflows box on review-settings | DONE |
| BUG-385e | Try again button state doesn't reset | DONE |
| BUG-385f | Progress bar doesn't turn green on completion | DONE |
| ENH-385g | Qualitative guardrail on "What's the big idea?" | DONE |
| ENH-385h | Audience step suggestions based on previous input | DONE |
| ENH-385i | Transparency about how content is used during generation | DONE |
| ENH-385k | Color extraction & theme mapping via adapter | DONE |
| ENH-385l | Remove section-level regenerate buttons from Review Content | DONE |

## Deferred

| ID | Task | Reason |
|----|------|--------|
| ENH-385j | Media library upload | Requires significant new infrastructure — file upload, AI tagging, section matching. Should be a standalone task. |

## Key Changes

### Visual Bug Fixes (385a–d, 385f)

- **ProgressStepper.tsx** — Removed `gap-0` from desktop stepper flex container, allowing natural spacing between section labels
- **StepLayout.tsx** — Added `py-12` vertical padding to both centered and split layout modes for breathing room on all step pages
- **review-settings/page.tsx** — Added `flex-wrap` on color swatch container and `shrink-0` on swatch circles to prevent overflow
- **PipelineProgress.tsx** — Overall progress bar now turns green (`bg-emerald-500`) when all phases complete, red (`bg-red-500`) on failure

### Retry State Fix (385e)

- **progress/page.tsx** — Added `retrying` state flag that suppresses polling for 3 seconds after the user clicks Try Again. This prevents the stale failure status from being re-fetched before the backend has processed the retry request. The error UI, heading, and button all clear immediately on retry click.

### Qualitative Input Guardrail (385g)

- **New: `/api/ai/validate-idea/route.ts`** — AI-based quality gate evaluating whether the business idea input is "good", "vague", or "nonsense". Returns a short suggestion for vague/nonsense inputs. Fast-paths inputs under 20 characters as "vague".
- **idea/page.tsx** — Validates on textarea blur; shows green checkmark for good input, amber warning with suggestion for vague, red block for nonsense. Nonsense blocks form submission.

### Audience Suggestions (385h)

- **New: `/api/ai/suggest-audiences/route.ts`** — Generates 3 audience segment suggestions based on the user's idea from the previous step.
- **audience/page.tsx** — Fetches suggestions on page load using saved idea data. Renders as clickable pill buttons that populate the audience input field. Selected pill gets brand highlight.

### Content Transparency (385i)

- **review-settings/page.tsx** — Replaced plain "Generation takes 2-3 minutes" text with an info panel explaining how each input shapes the generated site (idea → content, colors → theme, pages → SEO layouts).

### Adapter-Based Color Mapping (385k)

- **generator.ts** — Replaced hardcoded `mapColorsToSpaceDS()` with `adapter.prepareBrandPayload()`. User-extracted colors (primary, secondary, accent, etc.) now map through the active design system adapter to the correct theme-specific CSS variable names. Falls back to legacy Space DS mapping for non-drupal-config payload types.

### Section Regenerate Button Removal (385l)

- **PagePreview.tsx** — Removed `RegenerateButton` component from `SectionView` along with undo state logic. Page-level regenerate button is preserved. Cleaned up unused `PageSectionChild` import.

## Files Changed

| File | Change |
|------|--------|
| `platform-app/src/components/onboarding/ProgressStepper.tsx` | Remove `gap-0` |
| `platform-app/src/components/onboarding/StepLayout.tsx` | Add `py-12` padding |
| `platform-app/src/app/onboarding/review-settings/page.tsx` | flex-wrap colors, transparency panel |
| `platform-app/src/app/onboarding/progress/page.tsx` | Retry polling guard |
| `platform-app/src/components/onboarding/PipelineProgress.tsx` | Green/red progress bar |
| `platform-app/src/app/onboarding/idea/page.tsx` | AI quality gate on blur |
| `platform-app/src/app/onboarding/audience/page.tsx` | AI audience suggestions |
| `platform-app/src/app/onboarding/review/components/PagePreview.tsx` | Remove section regenerate |
| `platform-app/src/lib/blueprint/generator.ts` | Adapter-based color mapping |
| `platform-app/src/app/api/ai/validate-idea/route.ts` | **NEW** — Idea quality validation endpoint |
| `platform-app/src/app/api/ai/suggest-audiences/route.ts` | **NEW** — Audience suggestion endpoint |
