# TASK-425: Add design review checks to the review agent

**Story:** US-076
**Priority:** P1
**Estimated Effort:** M
**Milestone:** M21 — Content Quality Hardening

## Description
The review agent currently evaluates content depth, SEO, and GEO — but has zero visual/aesthetic checks. Pages can ship with consecutive identical backgrounds, no image alternation, and repetitive component patterns. Add a `design` dimension to the review agent with deterministic, rule-based checks.

## Technical Approach

### A. Extend Review Types
1. In `review.ts`, add `"design"` to the `ReviewCheck.dimension` union type: `"depth" | "seo" | "geo" | "design"`

### B. Implement Design Checks

#### Check 1: `checkConsecutiveBackgrounds` (warning)
- Walk sections array; compare `container_background` or `background_color` on consecutive sections
- Flag when two adjacent sections have the same non-empty background color
- Message: "Sections {N} and {N+1} both use '{color}' background — alternate for visual rhythm"

#### Check 2: `checkImageAlternation` (warning)
- Find sections using text-image patterns (e.g., `text-image-split-50-50`, `text-image-split-66-33`, `image-text-split-33-66`)
- When two text-image sections appear within 2 positions of each other, verify the image position alternates (text-image → image-text)
- Message: "Text-image sections at positions {N} and {M} both place image on the same side"

#### Check 3: `checkPatternVariety` (warning)
- Flag consecutive sections that use the same `pattern` field value
- Message: "Sections {N} and {N+1} both use pattern '{pattern}' — vary layout for visual interest"

#### Check 4: `checkHeroHeadingNotGeneric` (error)
- Extract hero heading text (heading_text, title, heading — all variants)
- Check against forbidden-phrase list: /^welcome$/i, /^welcome to /i, /^home$/i, /^about (us|our)/i, /^our services$/i, /^contact/i
- Severity: error (triggers retry)
- Note: This overlaps with TASK-423's `checkHeroHeadingQuality` — if TASK-423 is done first, this check is already covered. If done independently, consolidate during integration.

### C. Register in reviewPage()
3. Add the new check functions to the `checks` array in `reviewPage()`
4. Design checks participate in the existing scoring model — warnings at 0.3 weight, errors at full weight

## Acceptance Criteria
- [ ] Consecutive same-background sections produce a warning
- [ ] Non-alternating text-image sections produce a warning
- [ ] Consecutive identical patterns produce a warning
- [ ] Generic hero heading produces an error (triggers retry)
- [ ] Design checks included in quality score
- [ ] All checks are pure functions — no I/O, no AI calls (per ADR-010)
- [ ] Review agent execution time stays under 50ms per page

## Files Affected
- `platform-app/src/lib/pipeline/phases/review.ts` (new check functions, extend dimension type, register in reviewPage)
