# TASK-347: AiInsightCard Component

**Story:** US-063
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M18 — UX Revamp

## Description
Build **two AI insight variants** — a lightweight chip for early steps and a richer card for design steps — plus the data layer that generates insight copy from existing onboarding session state. The chip prevents heavy-handed AI feedback on simple inputs; the card shines when there's meaningful data to show.

## Technical Approach
1. Create **`AiInsightChip.tsx`** — one-liner for early text steps (name, idea, audience):
   ```ts
   interface AiInsightChipProps {
     text: string;              // e.g., "Sounds like a hospitality website"
     animate?: boolean;         // Fade-in entrance (default true)
   }
   ```
   - Single line with sparkle icon (✦)
   - `text-white/40` — whisper tone, subtle, not attention-competing
   - Fade-in only (no slide animation) — appears after 300ms debounce
   - Renders inline below input in `centered` layout mode

2. Create **`AiInsightCard.tsx`** — multi-line for design steps (brand, pages, fonts):
   ```ts
   interface AiInsightCardProps {
     title: string;              // e.g., "Brand Analysis"
     description: string;        // e.g., "Extracted 4 colors from your logo"
     details?: string[];         // Optional bullet points
     visualContent?: React.ReactNode; // Optional inline visuals (color swatches, font samples)
     animate?: boolean;          // Entrance animation (default true)
   }
   ```
   - Semi-transparent background (`bg-white/5`), subtle border (`border-white/10`)
   - Sparkle icon in header
   - Smooth entrance: fade-in + slide-up (200ms)
   - Supports inline visual content (e.g., color swatch strip)

3. Create helper `getStepInsight(step, sessionData)` in `src/lib/ai-insights.ts`:
   - Returns `{ variant: 'chip' | 'card', ...data }` based on step context
   - Early steps (name, idea, audience) → chip variant with one-liner copy
   - Design steps (pages, design, brand, fonts) → card variant with rich data
   - Content steps (tone) → chip variant
   - Returns null for steps without insights (start, follow-up, review-settings)
4. No new API calls — all data from existing `useOnboarding` session state

## Acceptance Criteria
- [ ] `AiInsightChip` renders as a subtle one-liner with sparkle icon and `text-white/40`
- [ ] `AiInsightCard` renders with title, description, optional details and visual content
- [ ] Chip uses fade-in only; card uses fade-in + slide-up
- [ ] `getStepInsight()` returns correct variant per step type
- [ ] Returns null gracefully for steps without insights
- [ ] Both variants visually consistent with dark-mode onboarding aesthetic
- [ ] Respects `prefers-reduced-motion` (disables animations)

## Dependencies
- TASK-346 (split-pane provides the `insightSlot`)

## Files/Modules Affected
- `platform-app/src/components/onboarding/AiInsightCard.tsx` (new)
- `platform-app/src/lib/ai-insights.ts` (new)
