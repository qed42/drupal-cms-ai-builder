# TASK-423: Fix review agent hero heading check to use Mercury's `heading_text` prop

**Story:** US-074
**Priority:** P0
**Estimated Effort:** S
**Milestone:** M21 — Content Quality Hardening

## Description
The `checkHeroHeading()` function in `review.ts` looks for `hero.props.title`, `hero.children[0].props.title`, and `hero.props.heading` — but Mercury uses `heading_text`. The review agent cannot currently detect missing or generic hero headings on Mercury sites.

## Root Cause
```typescript
// review.ts:423-425
const title = hero?.props?.title
  ?? (hero?.children?.[0]?.props?.title)
  ?? (hero?.props?.heading);
```
Mercury heading component uses `heading_text`, not `title` or `heading`.

## Technical Approach
1. In `platform-app/src/lib/pipeline/phases/review.ts`, `checkHeroHeading()`:
   - Add `heading_text` to the prop lookup chain
   - Also check `hero.children[].props.heading_text` for the child heading in hero_slot
   - Make the lookup design-system-agnostic: check all variants (`title`, `heading`, `heading_text`)
2. Add a NEW check: `checkHeroHeadingQuality()` that verifies the heading text does NOT match a forbidden-phrase list:
   - Exact matches: "Welcome", "Home", "About Us", "Our Services", "Contact Us"
   - Prefix matches: "Welcome to ", "About Our ", "Discover Our "
   - Severity: `error` (triggers page retry)
   - Dimension: `seo` (it's an SEO concern — h1 quality)
3. Register the new check in `reviewPage()` alongside existing SEO checks

## Acceptance Criteria
- [ ] `checkHeroHeading` correctly finds heading text on Mercury hero-billboard (via `heading_text` prop)
- [ ] `checkHeroHeading` correctly finds heading text on hero child components in hero_slot
- [ ] New `checkHeroHeadingQuality` check flags pages where hero heading matches forbidden phrases
- [ ] Forbidden-phrase check has error severity (triggers retry)
- [ ] Pages with marketing-grade hero headings pass both checks

## Files Affected
- `platform-app/src/lib/pipeline/phases/review.ts` (modify `checkHeroHeading`, add `checkHeroHeadingQuality`)
