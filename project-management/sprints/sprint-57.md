# Sprint 57: Content Quality & Image Rendering Hotfix

**Milestone:** M29 — Content Quality (hotfix, takes priority over M28)
**Duration:** 3 days

## Sprint Goal

Fix the wireframe appearance of generated sites: ensure code components receive real, contextual content from the content plan, images render correctly, and prop names follow Drupal machine name conventions.

## Bug Summary

**BUG-057: Code components have generic placeholder content, broken images, and verbose prop names**

Four root causes identified:

1. **No content hydration** — ContentPlan content (services, testimonials, headings) is never mapped to code component prop values. Props fall back to their description text ("Main hero headline" instead of "Transform Your Smile Today").

2. **Image prop format mismatch** — AI prompt instructs `src={props.imageName}` but Canvas image props are objects `{ src, width, height, alt }`. Renders as `[object Object]`.

3. **Enhance phase wrong key** — Sets `{ url, alt }` instead of Canvas-expected `{ src, width, height, alt }`.

4. **Verbose/non-standard prop names** — Prop names have no max length constraint and use camelCase instead of Drupal-standard snake_case. The AI generates verbose names like `primaryCallToActionButtonText` or `firstTestimonialAuthorPhoto`. These leak into displayed content because:
   - `config-builder.ts:72`: When no default exists, `schema.examples = [prop.name]` — so the prop name itself becomes the Canvas example value (i.e., the initial displayed content)
   - `generate-code-components.ts:246`: Fallback chain `p.description || p.name` uses the prop name as visible content
   - Zod regex `/^[a-z][a-zA-Z0-9_]*$/` allows unlimited length, no convention enforcement
   - No prompt guidance on prop naming patterns or length limits
   - Drupal/Canvas convention is snake_case machine names (e.g., `hero_image`, `cta_text`, `section_title`)

## Tasks

| ID | Task | Story | Effort | Depends On | Status |
|----|------|-------|--------|------------|--------|
| TASK-525 | Fix image prop format in prompt + enhance phase | BUG-057 | M | — | Done |
| TASK-527 | Update generation prompt for content-aware defaults | BUG-057 | M | — | Done |
| TASK-528 | Enforce short snake_case prop names in generation + validation | BUG-057 | M | — | Done |
| TASK-529 | Fix Canvas LinkUrl null crash for link-type props | BUG-057 | S | TASK-528 | Done |
| TASK-526 | Add Content Hydration phase to pipeline | BUG-057, US-120 | XL | TASK-525, TASK-528 | Done |

## Execution Order

```
Wave 1 (parallel): TASK-525, TASK-527, TASK-528, TASK-529
  - TASK-525: Fix image prop format (prompt + enhance phase) — direct bug fix
  - TASK-527: Update prompt for content-aware defaults — reduce null defaults from AI
  - TASK-528: Enforce short snake_case prop names — Drupal convention compliance
  - TASK-529: Fix Canvas LinkUrl null crash — optional link props with null/empty defaults
    crash Canvas LinkUrl::getCastedValue() typed data layer

Wave 2: TASK-526
  - Content Hydration phase — depends on TASK-525 (correct image format) + TASK-528 (predictable prop names for mapping)
  - This is the main fix: maps ContentPlan content to code component props
  - Two-tier: direct mapping first (heading → heading prop, services → feature props),
    then AI generation for remaining unresolved props
```

## Impact Assessment

| Before | After |
|--------|-------|
| Hero heading: "Main hero headline" | Hero heading: "Transform Your Smile Today" |
| Feature cards: "Feature 1 Title" | Feature cards: "Wood-Fired Pizza", "Craft Cocktails" |
| Testimonials: "First testimonial quote" | Testimonials: actual quotes from content plan |
| Images: broken (object Object) or placeholder | Images: Pexels stock photos rendered correctly |
| CTA buttons: "Get Started" everywhere | CTA buttons: "Book Your Table", "Schedule Consultation" |
| Prop names: `primaryCallToActionButtonText` | Prop names: `cta_text` |
| Canvas examples: "sectionDescription" | Canvas examples: actual descriptions |

## Dependencies & Risks

- **TASK-526 adds an AI call** — the hydration phase calls Claude for unresolved props. Risk: adds 5-15s to pipeline. Mitigation: direct mapping handles ~60% of props without AI; hydrate is non-fatal.
- **TASK-525 changes the prompt** — existing generated blueprints may have `src={props.imageName}` JSX. Won't affect already-provisioned sites, but re-generation will produce new format.
- **TASK-527 changes AI behavior** — AI may still produce null defaults for some props. That's OK — TASK-526 (hydrate phase) catches these.
- **TASK-528 changes prop naming convention** — JSX destructuring switches from `{ sectionTitle }` to `{ section_title }`. Valid JavaScript; non-idiomatic React but correct for Drupal Canvas ecosystem.

## Definition of Done

- [ ] Zero sections contain text like "Section heading", "Feature title", "Description here"
- [ ] Hero headings match content plan headings
- [ ] Feature/service sections display actual service names and descriptions
- [ ] Testimonial sections show actual quotes, authors, roles from plan
- [ ] Images render correctly — no "[object Object]" in src attributes
- [ ] Pexels stock images appear in the preview and provisioned site
- [ ] Prop names are snake_case, max 32 chars, Drupal machine-name compliant
- [ ] Pipeline completes successfully with the new Hydrate phase
- [ ] Hydrate failure is non-fatal (graceful degradation)
- [ ] All existing tests pass (no regression)
- [ ] New tests for content hydration pass
- [ ] No TypeScript errors
