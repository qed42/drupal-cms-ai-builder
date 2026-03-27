# TASK-475: Standardize Input Component with Size Variants

**Status:** TODO
**Priority:** High
**Sprint:** 47
**Architecture:** architecture-onboarding-ux-modernization.md §3.3
**Depends on:** TASK-474

## Description

Form inputs across the app use inconsistent styling:
- Auth pages: shadcn `Input` with `h-12` override
- Onboarding name/idea: manual `rounded-xl bg-white/10 px-6 py-4 text-lg`
- Follow-up questions: `rounded-xl bg-white/10 px-4 py-3`
- shadcn default: `h-9 bg-white/5`

Standardize all form inputs through the shadcn Input component with size variants.

## Tasks

1. **Extend `src/components/ui/input.tsx`** — add `inputSize` variant using CVA:
   - `default`: h-9 (current shadcn)
   - `lg`: h-12 px-4 text-base (for auth forms)
   - `xl`: h-14 px-6 text-lg (for onboarding hero inputs)
2. **Migrate auth inputs** — remove `h-12` className override, use `inputSize="lg"` prop
3. **Migrate onboarding inputs** — replace all manual input styling in:
   - `name/page.tsx` (text-center text input)
   - `idea/page.tsx` (textarea — create a matching Textarea component or variant)
   - `audience/page.tsx`
   - `follow-up/page.tsx`
   - `tone/page.tsx` (differentiator input, URL fields)
   - `brand/page.tsx` (color hex inputs if any)
4. **Create shadcn Textarea component** if not already present — same variant pattern for textareas
5. **Verify focus states** — all inputs must show `focus:border-brand-500 focus:ring-1 focus:ring-brand-500`

## Acceptance Criteria

- [ ] Zero manual input styling in page files — all use `<Input>` or `<Textarea>` from `components/ui/`
- [ ] Three size variants available: default, lg, xl
- [ ] Auth and onboarding inputs visually unchanged (same dimensions, colors)
- [ ] Focus and disabled states consistent across all inputs
