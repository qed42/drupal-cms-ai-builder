# TASK-330: Restyle input fields with bottom-border and gradient focus underline

**Story:** REQ-onboarding-brand-refresh
**Priority:** P1
**Estimated Effort:** M
**Milestone:** Onboarding Brand Refresh

## Description

Replace the current boxed input styling (bg-white/10, full border, focus ring) with a cleaner bottom-border-only pattern. On focus, the bottom border shows the brand gradient (blue → purple → cyan). Textareas get a subtle AI sparkle icon.

## Technical Approach

1. **Create a shared input class or utility** in `globals.css`:
   ```css
   .input-onboarding {
     background: transparent;
     border: none;
     border-bottom: 2px solid rgba(255, 255, 255, 0.15);
     border-radius: 0;
     padding: 1rem 0;
     font-size: 1.125rem;
     color: white;
     outline: none;
     transition: border-color 0.2s;
   }
   .input-onboarding:focus {
     border-image: linear-gradient(to right, #4856FA, #9E2EF8, #01D1FF) 1;
   }
   .input-onboarding::placeholder {
     color: rgba(255, 255, 255, 0.3);
   }
   ```

2. **Update each step page** that uses text inputs or textareas:
   - `platform-app/src/app/onboarding/name/page.tsx` — project name input
   - `platform-app/src/app/onboarding/idea/page.tsx` — idea textarea
   - `platform-app/src/app/onboarding/audience/page.tsx` — audience input
   - `platform-app/src/app/onboarding/follow-up/page.tsx` — dynamic form inputs
   - `platform-app/src/app/onboarding/tone/page.tsx` — text inputs

3. **Add AI sparkle icon** to textarea fields (idea step):
   - Position a small sparkle SVG icon absolutely in the bottom-right corner of the textarea wrapper
   - Use `text-brand-400` color, subtle opacity

4. **Preserve existing validation behavior** — `min-length` checks, character counters, disabled states should all continue working. Only the visual styling changes.

## Acceptance Criteria

- [ ] All onboarding text inputs use transparent background with bottom-border only
- [ ] Focus state shows gradient underline (blue → purple → cyan) instead of teal ring
- [ ] Placeholder text at 30% white opacity
- [ ] Textarea on idea step has sparkle/AI icon in corner
- [ ] Character counters still visible and correctly styled
- [ ] Disabled inputs visually distinguishable
- [ ] No regression in form validation or submission behavior

## Dependencies
- TASK-328 (color palette)

## Files/Modules Affected
- `platform-app/src/app/globals.css` (new utility class)
- `platform-app/src/app/onboarding/name/page.tsx`
- `platform-app/src/app/onboarding/idea/page.tsx`
- `platform-app/src/app/onboarding/audience/page.tsx`
- `platform-app/src/app/onboarding/follow-up/page.tsx`
- `platform-app/src/app/onboarding/tone/page.tsx`
