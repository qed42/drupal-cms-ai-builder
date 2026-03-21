# Sprint 25: SEO/GEO Interlinking — Cross-Page Linking for Content Generation

**Milestone:** M17 — SEO & Content Quality
**Duration:** 1–2 days (2026-03-21 – 2026-03-22)
**Predecessor:** Sprint 24 (Bug Sprint — Canvas Rendering)

## Sprint Goal

Enable intelligent cross-page interlinking in generated site content so that CTAs, buttons, cards, and inline text links point to real pages on the site — improving SEO link equity, user navigation, and GEO (generative engine optimization) signals.

## Context

Currently, each page is generated in isolation — the AI has no knowledge of sibling pages, so CTA buttons use generic/fabricated URLs. The header and footer already interlink all pages correctly, but in-page content has zero internal links. This sprint fixes that by supplying the AI with a page sitemap, adding linking rules, validating URLs post-generation, and scoring link quality during review.

## Tasks

| ID | Task | Priority | Effort | Assignee Persona | Status | Depends On |
|----|------|----------|--------|-------------------|--------|------------|
| TASK-335 | Supply page sitemap context to generation prompt | P0 | S | `/dev` | DONE | — |
| TASK-336 | Add interlinking rules to page generation prompt | P0 | M | `/dev` | DONE | TASK-335 |
| TASK-337 | Post-generation URL validation and rewriting | P1 | M | `/dev` | DONE | TASK-335 |
| TASK-338 | Add interlinking quality checks to review phase | P1 | S | `/dev` | DONE | TASK-335, TASK-336 |
| BUGFIX | Header/footer not rendering on Drupal site | P0 | S | `/dev` | DONE | — |

## Execution Order

```
Day 1:
  1. TASK-335 (sitemap context) — unblocks everything
  2. TASK-336 (linking rules) — depends on 335

Day 2:
  3. TASK-337 (URL validation) — depends on 335, can parallel with 336
  4. TASK-338 (review scoring) — depends on 335 + 336
```

## Dependencies & Risks

- **No blockers** — all tasks build on existing prompt + tree builder infrastructure
- **Risk: Token budget** — adding sitemap + linking rules to prompt increases token count. Should be minimal (~200-300 tokens for 5-8 pages) but monitor for truncation
- **Risk: AI compliance** — AI may still generate generic CTAs despite rules. The URL validator (TASK-337) serves as a safety net
- **Risk: Link density** — Over-linking can hurt readability. Rules should cap at 3-4 internal links per page (excluding nav)

## Blocked Backlog (not in this sprint)

| ID | Task | Milestone | Blocked By |
|----|------|-----------|------------|
| TASK-328–334 | Onboarding Brand Refresh (7 tasks) | Brand Refresh | Tailwind v4 `@theme` issue — needs research before reattempt |

## Definition of Done

- [ ] Generated pages contain 2+ internal links (buttons, CTAs, card URLs) pointing to real sibling pages
- [ ] CTA banner at bottom of each page links to a real conversion page (e.g., /contact, /services)
- [ ] No broken internal links — all `/slug` URLs match actual page list
- [ ] Review phase reports interlinking quality score
- [ ] No regression in generation quality or token usage
- [ ] Tested with at least one full site generation (5+ pages) to verify links
