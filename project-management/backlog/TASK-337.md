# TASK-337: Post-generation URL validation and rewriting

**Story:** SEO-interlinking
**Priority:** P1
**Estimated Effort:** M
**Milestone:** SEO/GEO Interlinking

## Description

After page generation, validate all URLs in button, link, CTA, and card components against the actual page sitemap. Rewrite broken/unknown URLs to the closest matching page slug using fuzzy matching, and flag any external URLs for review.

## Technical Approach

1. **Create `validateAndRewriteUrls()` function** in `platform-app/src/lib/blueprint/component-tree-builder.ts` (or a new `url-validator.ts`):
   - Accept: `ComponentTreeItem[]` (page tree) + `allSlugs: string[]`
   - Walk all tree items, inspect `inputs` for URL-bearing props: `url`, `href`, `link`
   - For each URL found:
     - If it matches `/{slug}` where slug is in `allSlugs` → valid, keep
     - If it starts with `/` but slug NOT in allSlugs → fuzzy match (Levenshtein or prefix match) to closest slug, rewrite
     - If it starts with `http` or `#` → leave as-is (external or anchor)
     - If empty or placeholder → rewrite to most relevant page based on component context

2. **Also validate URLs inside HTML content** (space-text `text` prop):
   - Parse `<a href="...">` from HTML strings
   - Apply same validation/rewriting logic

3. **Integrate into generate phase** in `platform-app/src/lib/pipeline/phases/generate.ts`:
   - After `buildComponentTree()` call for each page, run `validateAndRewriteUrls()`
   - Pass `allSlugs` from the plan's page list
   - Log any rewrites for debugging

4. **Edge cases**:
   - `/` (homepage) is always valid
   - `/#section` anchor links are valid
   - URLs with query params (`/contact?ref=home`) → validate base path only
   - Don't rewrite URLs in header/footer trees (already validated in builder)

## Acceptance Criteria

- [ ] All internal URLs (`/slug`) validated against actual page list
- [ ] Mistyped slugs auto-corrected to closest match (e.g., `/servics` → `/services`)
- [ ] Non-existent page URLs rewritten to fallback page (homepage or contact)
- [ ] External URLs (http/https) left unchanged
- [ ] HTML inline links in space-text also validated
- [ ] Rewrite log entries for debugging
- [ ] No regression — existing valid URLs untouched

## Dependencies
- TASK-335 (page list available during generation)

## Files/Modules Affected
- `platform-app/src/lib/blueprint/url-validator.ts` (new)
- `platform-app/src/lib/pipeline/phases/generate.ts`
