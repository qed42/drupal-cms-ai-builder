# TASK-434: Add Archie-branded input quality feedback to idea, audience, and follow-up steps

**Story:** US-080
**Effort:** M
**Status:** TODO

## Description
Add or update real-time input quality feedback messages on 3 steps to use Archie branding and tiered quality hints that motivate richer input.

## Changes

### Idea step (`idea/page.tsx`)
Update existing validation messages:
- Current: "Add a bit more detail for better results" → "Give Archie more detail for a better site"
- Current: "Looks great!" → "Archie has plenty to work with"
- Current: "Please describe a real project or business idea" → keep as-is (error message, not quality hint)

### Audience step (`audience/page.tsx`)
Add tiered quality hints alongside existing character count:
- < 30 chars: "Give Archie more detail — who exactly are your customers?"
- 30-80 chars: "Good start. Adding age range, location, or pain points helps."
- > 80 chars: "Excellent. Archie can really target your messaging now."

### Follow-up step (`follow-up/page.tsx`)
Add per-field quality hints (replace or supplement the static subtitle):
- Empty field: "Archie needs this to write your [field] page"
- < 20 chars: "A bit more detail helps Archie write specific content"
- >= 50 chars: "Great — Archie has plenty to work with"

Where `[field]` is derived from the field label or associated page name.

## Key Considerations
- All quality feedback is client-side (character length thresholds) — no API calls
- Use existing hint/validation styling — typically `text-white/40` or `text-white/60` text below the input
- Messages should transition smoothly (no jarring re-renders on each keystroke — debounce or use threshold bands)
- Follow-up step has multiple dynamic fields (one per page) — each needs its own quality hint

## Files
- `platform-app/src/app/onboarding/idea/page.tsx`
- `platform-app/src/app/onboarding/audience/page.tsx`
- `platform-app/src/app/onboarding/follow-up/page.tsx`

## Acceptance Criteria
- [ ] Idea step shows Archie-branded validation messages at correct thresholds
- [ ] Audience step shows tiered quality hints that change as user types
- [ ] Follow-up step shows per-field quality hints based on character count
- [ ] All messages use existing styling — no new CSS or components
- [ ] Messages don't flicker on rapid typing (debounced or threshold-based)
