# TASK-440: Image Matcher Module

**Story:** US-083
**Effort:** M
**Milestone:** M22 — User-Uploaded Images

## Description
Create `platform-app/src/lib/images/image-matcher.ts` — a pure in-memory scoring engine that ranks user-uploaded images against component text context to find the best match for each image slot.

## Implementation Details
- Function: `rankImages(userImages, componentContext, usedImageIds) → MatchCandidate[]`
- Scoring formula: `(tagOverlap × 0.4) + (descriptionOverlap × 0.3) + (orientationMatch × 0.15) + (subjectFit × 0.15)`
- Tag overlap: tokenize component text into keywords, intersect with image tags, normalize by max(imageTags, contextKeywords)
- Description overlap: Jaccard similarity between image description tokens and component text tokens (stopwords removed)
- Orientation match: 1.0 if matches expected, 0.3 otherwise
- Subject fit heuristic: testimonial/team → person/group = 1.0; hero → any = 0.8; product feature → product = 1.0
- Minimum threshold: 0.25 — below this, caller falls back to Pexels
- Deduplication: `usedImageIds` set prevents same image in multiple slots
- Must be pure computation — no API calls, <5ms per slot

## Acceptance Criteria
- [ ] `rankImages()` returns candidates sorted by score descending
- [ ] Scoring matches the documented formula
- [ ] Images already in `usedImageIds` are excluded
- [ ] Candidates below 0.25 threshold are still returned but marked (caller decides fallback)
- [ ] Performance: <5ms for 20 images × 1 slot
- [ ] Unit tests cover: exact match, partial match, no match, dedup, orientation bonus

## Dependencies
- None (standalone module)

## Files
- `platform-app/src/lib/images/image-matcher.ts` (new)
