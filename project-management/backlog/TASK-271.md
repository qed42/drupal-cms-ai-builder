# TASK-271: Product Brand Identity — Color Palette, Logo, Typography

**Story:** DS-1, DS-2, DS-3, DS-10
**Priority:** P0
**Effort:** L
**Sprint:** 15

## Description

Replace the default "AI tool" aesthetic with a deliberate product identity. This is the foundation task — all other UX tasks depend on these design tokens.

### Deliverables

1. **Color palette swap (DS-1):** Replace indigo/purple primary accent with a non-AI-associated palette. Candidates: teal, coral, warm orange, forest green. Define: primary, secondary, accent, success, warning, error, neutral scale
2. **Product logo/wordmark (DS-2):** Create or source a logo. Display it in: auth pages, onboarding header, dashboard header, favicon. If no external design resource, generate a clean wordmark using the product name + chosen font
3. **Typography (DS-3):** Replace Geist (Next.js default) with a deliberately chosen typeface. Recommendation: Inter or Plus Jakarta Sans for body, paired with a distinctive heading font
4. **Favicon & tab title (DS-10):** Set favicon to product logo mark. Set browser tab title to product name (not "Next.js App")

### Implementation Notes

- Update Tailwind config with new color tokens
- Update `layout.tsx` with new font imports (next/font)
- Create a `brand.ts` constants file for logo path, product name, tagline
- Update all hardcoded color references (`bg-indigo-*`, `bg-purple-*`, `from-[#0a0a2e]`)

## Acceptance Criteria

- [ ] Primary accent color is NOT indigo or purple
- [ ] Product logo appears on auth pages, onboarding header, dashboard
- [ ] Default font is NOT Geist — a deliberately chosen typeface is used
- [ ] Favicon shows product logo mark
- [ ] Browser tab shows product name
- [ ] All color tokens defined in Tailwind config

## Dependencies

- None (foundation task)
