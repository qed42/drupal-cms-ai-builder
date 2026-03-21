# TASK-335: Supply page sitemap context to page generation prompt

**Story:** SEO-interlinking
**Priority:** P0
**Estimated Effort:** S
**Milestone:** SEO/GEO Interlinking

## Description

The page generation prompt currently has no knowledge of sibling pages. The AI generates CTA buttons and links without knowing what other pages exist on the site, leading to generic or incorrect URLs. Supply a sitemap of all pages (slug + title + purpose) to the generation prompt so the AI can create contextual internal links.

## Technical Approach

1. **Update `buildPageGenerationPrompt()` in `platform-app/src/lib/ai/prompts/page-generation.ts`**:
   - Accept a new parameter: `allPages: Array<{ slug: string; title: string; purpose?: string }>`
   - Add a "Site Pages (available for interlinking)" section to the prompt listing all pages with their slugs
   - Format as: `- /{slug} — {title}: {purpose}`
   - Mark the current page being generated so AI doesn't self-link

2. **Update the generate phase** in `platform-app/src/lib/pipeline/phases/generate.ts`:
   - Pass the full pages array from the content plan to `buildPageGenerationPrompt()`
   - Each page call already has access to the plan which contains all pages

## Acceptance Criteria

- [ ] Generation prompt includes a "Site Pages" section listing all pages with slugs
- [ ] Current page is marked as "(this page)" so AI doesn't create self-referencing CTAs
- [ ] All page slugs use relative URL format: `/{slug}`
- [ ] No increase in token budget needed (sitemap section is small)

## Dependencies
- None (foundational for TASK-336 and TASK-337)

## Files/Modules Affected
- `platform-app/src/lib/ai/prompts/page-generation.ts`
- `platform-app/src/lib/pipeline/phases/generate.ts`
