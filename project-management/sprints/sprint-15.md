# Sprint 15: UX Overhaul Phase 1 — Identity & Trust

**Milestone:** M11 — Product Identity & UX Quality
**Duration:** 1 week

## Sprint Goal
Eliminate the "AI-generated tool" perception by establishing product brand identity, redesigning key screens, and adding missing UX flows. An outside observer should be able to name the product and describe what it does without thinking "this is a template."

## Priority Context
The Product Owner flagged the application as having an "AI-generated tool" aesthetic that undermines user trust and conversion (`ux-expectations.md`). All P0 items from that document are in this sprint. This is higher priority than provisioning hardening (moved to Sprint 16) because users won't reach provisioning if the UI doesn't inspire confidence.

## Tasks

### Phase 1: Foundation (Day 1)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-271 | Product Brand Identity — Colors, Logo, Typography, Favicon | DS-1, DS-2, DS-3, DS-10 | L | Not Started |

### Phase 2: Screen Redesigns (Days 2-4)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-272 | Auth Screen Redesign — Split Layout with Value Proposition | AUTH-1, AUTH-2, AUTH-4, AUTH-7 | M | Not Started |
| TASK-273 | Onboarding Visual Overhaul — Step Icons, Progress, Start Page | ONB-1, ONB-2, ONB-7 | L | Not Started |
| TASK-276 | Dashboard Redesign — Site Previews & Navigation | DASH-1, DASH-2, DASH-4 | M | Not Started |

### Phase 3: Flow Additions (Day 5)
| ID | Task | Story | Effort | Status |
|----|------|-------|--------|--------|
| TASK-274 | Pre-Generation Review Step | REV-1, REV-4 | M | Not Started |
| TASK-275 | Generation Progress UX — User Labels & Completion State | GEN-1, GEN-4 | M | Not Started |

## Dependencies & Risks

### Dependency Chain
```
TASK-271 (brand identity) → foundation for ALL other tasks
TASK-272 (auth redesign) → depends on TASK-271
TASK-273 (onboarding overhaul) → depends on TASK-271
TASK-274 (review step) → depends on TASK-271, loosely on TASK-273
TASK-275 (generation UX) → depends on TASK-271
TASK-276 (dashboard) → depends on TASK-271
```

### Risks
- **Design assets:** No external designer. Logo and illustrations must be sourced or generated with intentional creative direction (not default AI output). Consider: text-based wordmark, Lucide icon library, simple SVG shapes
- **Color migration blast radius:** Replacing `indigo/purple` references across the entire app is high-touch. Use find-and-replace with Tailwind color tokens to minimize breakage
- **Pre-generation review vs post-generation review:** Two "review" concepts now exist — the pre-generation settings review (TASK-274, new) and the post-generation content review (Sprint 13). Naming must be clear
- **Scope creep:** P1 items (social login, light mode, illustrations, component library) are deferred to Sprint 17. Resist the urge to polish now

## Definition of Done

- [ ] Product has a visible logo, custom color palette (not indigo/purple), and custom font
- [ ] Auth pages have split layout with value proposition — visually distinct from onboarding
- [ ] Each onboarding step has unique visual element + labeled progress indicator
- [ ] Start page has compelling hero with specific value proposition
- [ ] Pre-generation review step shows all user selections before triggering generation
- [ ] Generation progress shows user-friendly labels (no "Research/Plan/Generate" jargon)
- [ ] Generation completion shows what was generated (page count, names) with clear CTA
- [ ] Dashboard site cards have visual previews, nav sidebar, developer actions hidden
- [ ] Responsive design works on mobile for all updated screens
- [ ] Outside observer test: shown app for 5 seconds, can name product, does NOT say "AI tool"
- [ ] All code committed with passing tests
