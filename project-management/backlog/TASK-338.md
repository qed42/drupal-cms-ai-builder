# TASK-338: Add interlinking quality checks to review phase

**Story:** SEO-interlinking
**Priority:** P1
**Estimated Effort:** S
**Milestone:** SEO/GEO Interlinking

## Description

Extend the review phase to check for internal linking quality as part of page content scoring. Pages with no internal links (beyond header/footer) should receive a warning, and pages with broken links should fail validation.

## Technical Approach

1. **Add interlinking checks** to `platform-app/src/lib/pipeline/phases/review.ts`:
   - Count internal links per page (buttons, CTAs, card URLs, inline `<a>` tags)
   - Minimum threshold: 2 internal links per page (excluding nav)
   - CTA banner URL check: must point to a real page
   - Deduct quality score for:
     - Zero internal links: -15 points (warning)
     - Generic CTA text ("Learn More", "Click Here"): -5 points per instance
     - Self-referencing links (page links to itself): -10 points

2. **Add to review criteria** in the deterministic review checks:
   - `checkInterlinking(page, allSlugs)` → returns warnings/errors
   - Weight: low (warnings should reduce score but not fail the page)

3. **Report format**: Include interlinking quality in review output:
   ```
   Interlinking: 3 internal links found (✓ meets minimum)
   - CTA Banner → /contact (✓ valid page)
   - Services card → /services (✓ valid page)
   - Inline link → /about (✓ valid page)
   ```

## Acceptance Criteria

- [ ] Review phase counts internal links per page
- [ ] Pages with zero internal links get quality warning
- [ ] Generic CTA text detected and penalized
- [ ] Self-referencing links detected and penalized
- [ ] Review output includes interlinking summary
- [ ] Score impact is proportional (warnings, not hard failures)

## Dependencies
- TASK-335 (page slugs available)
- TASK-336 (AI generates internal links for review to validate)

## Files/Modules Affected
- `platform-app/src/lib/pipeline/phases/review.ts`
