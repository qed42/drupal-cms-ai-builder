# REQ: Transparent AI Onboarding Journey

**Status:** Draft
**Priority:** High
**Author:** Product Owner
**Date:** 2026-03-25

---

## Problem Statement

Users filling in the onboarding wizard have no visibility into how the AI interprets their inputs. The current experience is a black box: users enter data across 12 steps, hit "Generate", wait 2-3 minutes watching a spinner, and receive a finished site they may not feel ownership over.

This erodes trust in three ways:

1. **During input:** Users don't know which fields matter most or how their answers shape the outcome, leading to half-hearted responses
2. **During generation:** The progress page shows phase names ("Research", "Plan", "Generate") but not what the AI is actually thinking or deciding
3. **After generation:** Users see finished content with no explanation of why specific pages, sections, copy, or images were chosen

The result: users feel like passive observers rather than collaborators, reducing engagement with the review/edit phase and increasing abandonment.

---

## Vision

Transform the onboarding from a "fill form, wait, hope for the best" experience into an **AI-assisted collaboration** where the user can see, understand, and influence the AI's reasoning at every stage.

The guiding principle: **"Show your work."** Every AI decision should be traceable back to a specific user input, and users should be able to course-correct before the AI goes too far down the wrong path.

---

## User Personas

| Persona | Context | Trust Need |
|---------|---------|------------|
| **Sara** — Solo dentist, Portland | No tech skills, skeptical of AI, needs to feel in control | "Will this actually represent my practice?" |
| **Marcus** — Marketing agency owner | Builds sites for clients, needs to justify AI choices to stakeholders | "Can I explain to my client why this content was generated?" |
| **Priya** — Non-profit director | Limited budget, compliance concerns (donor data), needs accuracy | "Did the AI understand our mission correctly?" |

---

## Feature Areas

### Feature 1: Live AI Inference Cards (During Input Steps)

**What:** After the user completes key input fields (idea, audience, follow-up questions), show a compact card revealing what the AI inferred from that input — before the user moves to the next step.

**Where it appears:** Steps 4 (Idea), 5 (Audience), 10 (Follow-up), 11 (Tone)

**User experience:**

After the user types their business idea and the field validates as "good":

```
+--------------------------------------------------+
|  AI understood:                                    |
|                                                    |
|  Industry: Family Dental Practice                  |
|  Key services detected: general dentistry,         |
|    cosmetic procedures, pediatric care             |
|  Compliance: HIPAA considerations noted            |
|                                                    |
|  This will shape your page suggestions,            |
|  content tone, and SEO keywords.                   |
|                                                    |
|  [Looks right]  [Edit my description]              |
+--------------------------------------------------+
```

After the user enters their target audience:

```
+--------------------------------------------------+
|  AI understood:                                    |
|                                                    |
|  Primary audience: Families with children          |
|  Pain points identified:                           |
|    - Finding a dentist who's good with kids        |
|    - Insurance/cost transparency                   |
|    - Convenient scheduling                         |
|                                                    |
|  These pain points will drive your homepage         |
|  messaging and CTA language.                       |
|                                                    |
|  [Looks right]  [Adjust my audience]               |
+--------------------------------------------------+
```

**Acceptance Criteria:**

1. Inference card appears within 2 seconds of field validation completing (re-uses existing `/api/ai/analyze` response data)
2. Card shows industry classification, detected keywords, and compliance flags after Idea step
3. Card shows inferred pain points and demographic breakdown after Audience step
4. Card shows detected tone characteristics and example sentences after Tone step
5. Each card includes a plain-language sentence explaining which downstream decisions this input affects (e.g., "This shapes your page suggestions and SEO keywords")
6. "Looks right" dismisses the card and proceeds; "Edit" scrolls back to the field
7. Cards are non-blocking — user can skip/dismiss and continue
8. Cards do not appear on steps with no AI inference (Name, Design, Brand colors, Fonts)
9. On mobile, card renders as a bottom sheet that's easily dismissible
10. Inference cards do NOT add extra API calls — they surface data already returned by existing validation endpoints

---

### Feature 2: AI Reasoning Panel on Review Settings Page

**What:** Expand the existing review-settings summary page with an "AI Strategy Preview" section that shows the AI's high-level plan before generation starts.

**Where it appears:** `/onboarding/review-settings` (Step 12, pre-generation)

**Current state:** The page shows a read-only summary of user inputs (name, idea, audience, pages, colors, fonts, tone). It has a brief "How your inputs shape your site" text box.

**Proposed state:** Add a collapsible "AI Strategy Preview" panel below the input summary that shows:

```
+--------------------------------------------------+
|  AI Strategy Preview                         [v]  |
|                                                    |
|  Based on your inputs, here's what the AI          |
|  will generate:                                    |
|                                                    |
|  PAGES (6)                                         |
|  +-- Home: Hero + Services overview + Testimonials |
|  |   Target keywords: "family dentist portland"    |
|  +-- Services: 4 service cards + detailed sections |
|  |   Target keywords: "cosmetic dentistry"         |
|  +-- About Us: Team profiles + practice story      |
|  +-- Contact: Map + form + insurance accepted      |
|  +-- FAQ: 8-10 common dental questions             |
|  +-- New Patients: First visit guide + forms       |
|                                                    |
|  CONTENT APPROACH                                  |
|  Tone: Warm and reassuring, avoids clinical jargon |
|  Example: "We make every visit comfortable —       |
|    especially for our youngest patients."           |
|                                                    |
|  SEO FOCUS                                         |
|  Primary keywords: family dentist, pediatric       |
|    dentistry, cosmetic dentist portland             |
|  Strategy: Local SEO with service-specific pages   |
|                                                    |
|  COMPETITIVE POSITIONING                           |
|  Your site will emphasize: kid-friendly approach,  |
|    insurance transparency, modern facilities       |
|  Differentiators from typical dental sites:        |
|    first-visit guide, FAQ-heavy content            |
|                                                    |
|  [This looks right — Generate My Website]          |
|  [Go back and adjust my inputs]                    |
+--------------------------------------------------+
```

**Implementation approach:** This requires running the Research phase *before* generation starts — as a lightweight "preview" call when the user lands on review-settings. The Research phase is the fastest phase (~10-15s) and produces exactly the data needed for this preview.

**Acceptance Criteria:**

1. When the user navigates to review-settings, a Research preview is triggered automatically (with loading skeleton)
2. The preview shows: page structure with section types per page, tone guidance with example sentences, SEO keyword distribution across pages, and competitive positioning summary
3. Research preview completes in under 20 seconds; a loading skeleton is shown while it runs
4. If the Research preview fails, the page gracefully degrades to current behavior (input summary only) with a "Preview unavailable" note
5. The "Generate" button is always available — the preview is informational, not blocking
6. If the user goes back and changes inputs, the preview is invalidated and re-fetched on next visit to review-settings
7. The preview data is cached and re-used as the Research phase input during actual generation (no duplicate AI call)
8. Competitive positioning section does NOT show real competitor names — uses generic phrasing like "typical [industry] websites"
9. The panel is collapsed by default on mobile, expanded on desktop
10. A "This doesn't look right" link at the bottom explains which input steps to revisit for common adjustments

---

### Feature 3: Live Generation Narrative (During Pipeline Execution)

**What:** Replace the current generic phase descriptions with real-time, human-readable narration of what the AI is doing and deciding, streamed from each pipeline phase.

**Where it appears:** `/onboarding/progress` (generation progress page)

**Current state:** Shows 4 phase cards with status icons and brief summaries after completion. During execution, shows generic text like "Analyzing your business..."

**Proposed state:**

```
+--------------------------------------------------+
|  Building Portland Family Dental...                |
|  ████████████░░░░░░░░ 62%                         |
|                                                    |
|  [v] Research (12s)                                |
|      Identified your practice as family dentistry  |
|      with pediatric focus. Found 3 key             |
|      differentiators from your inputs.             |
|                                                    |
|  [v] Planning (8s)                                 |
|      Organized 6 pages with 28 content sections.   |
|      Added FAQ page based on your industry —       |
|      dental practices see 40% more engagement      |
|      with FAQ content.                             |
|                                                    |
|  [~] Generating content...                         |
|      Writing "Services" page (3 of 6)              |
|      Using your warm, reassuring tone              |
|      Targeting "cosmetic dentistry portland"        |
|                                                    |
|  [ ] Enhancing with images                         |
|      Will source professional dental/family         |
|      photos matching your brand palette             |
+--------------------------------------------------+
```

**Acceptance Criteria:**

1. Each completed phase shows a 2-3 sentence human-readable summary explaining what was decided and why
2. The active phase shows real-time progress: which page is being generated, what tone/keywords are being applied
3. Summaries reference specific user inputs (e.g., "Using your warm tone" not "Applying tone settings")
4. The Generate phase updates per-page as pages complete (e.g., "Writing Services page (3 of 6)")
5. At least one summary per phase connects an AI decision back to a user input (e.g., "Added FAQ page based on your industry")
6. Summaries are generated by the pipeline phases themselves — not a separate post-hoc AI call
7. Phase summaries persist after completion so users can scroll back and read them
8. Error states include actionable context (e.g., "Content for About page didn't meet quality bar — regenerating with more detail")
9. On completion, a final summary appears: "Generated 6 pages with X words of content, Y images, optimized for Z keywords"
10. Summary text is stored in the Blueprint record for later reference in the review page

---

### Feature 4: "Why This?" Tooltips in Post-Generation Review

**What:** Add contextual "Why this?" affordances throughout the post-generation review page that explain AI reasoning for specific content decisions.

**Where it appears:** `/onboarding/review` (post-generation content editor)

**User experience:**

Each section in the review editor gets a subtle info icon. On hover/click:

```
+--------------------------------------------------+
|  HERO SECTION                          [?] [edit] |
|  "Your Family's Smile Starts Here"                 |
|  ________________________________________________ |
|  |  Why this heading?                             ||
|  |                                                ||
|  |  Based on:                                     ||
|  |  - Your tone: warm & reassuring                ||
|  |  - Target audience: families with children     ||
|  |  - SEO keyword: "family dentist portland"      ||
|  |                                                ||
|  |  The heading uses emotional language            ||
|  |  ("Your Family's Smile") to connect with       ||
|  |  parents, while including your primary          ||
|  |  keyword for search visibility.                ||
|  |________________________________________________||
+--------------------------------------------------+
```

**Page-level insights:**

```
+--------------------------------------------------+
|  Services Page                            [?]     |
|  ________________________________________________ |
|  |  Page insights                                 ||
|  |                                                ||
|  |  Quality score: 92/100                         ||
|  |  SEO: 3/3 target keywords present              ||
|  |  Depth: 5 sections, 480 words                  ||
|  |  Internal links: 4 (to Home, FAQ, Contact,    ||
|  |    New Patients)                               ||
|  |                                                ||
|  |  Your input → This page                        ||
|  |  "cosmetic procedures" → Cosmetic section      ||
|  |  "pediatric care" → Kids Dentistry section     ||
|  |  "insurance accepted" → Insurance info card    ||
|  |________________________________________________||
+--------------------------------------------------+
```

**Acceptance Criteria:**

1. Every section in the review editor has a "Why this?" icon that opens a tooltip/popover
2. Section-level tooltip shows: which user inputs influenced this section, which SEO keywords are targeted, and a 1-2 sentence rationale
3. Page-level insight panel shows: quality score (from review agent), keyword coverage, word count, internal link count, and a mapping of user inputs to generated sections
4. Tooltips are generated from existing pipeline metadata (ResearchBrief, ContentPlan, review scores) — no additional AI calls
5. Quality scores use the existing 17-check review agent data already stored in `blueprint.payload._review`
6. The "Your input -> This page" mapping traces at least 3 user inputs to specific content decisions per page
7. Tooltips render as popovers on desktop, bottom sheets on mobile
8. Tooltips do not block the editing workflow — they close on outside click
9. If a user edits a section, the tooltip adds a note: "You've customized this section — original AI reasoning may no longer apply"
10. Image sections show the search query used (e.g., "Searched: family dental office modern") so users understand photo selection

---

### Feature 5: Input Impact Summary on Dashboard

**What:** After a site is generated, the user's dashboard site card shows a compact "AI used your inputs" summary, reinforcing that the AI listened.

**Where it appears:** Dashboard site card (existing)

**User experience:**

```
+--------------------------------------------------+
|  Portland Family Dental           [Live] [Edit]   |
|  portlandfamilydental.drupal.site                  |
|                                                    |
|  6 pages | 2,800 words | 12 images                |
|  AI confidence: High                               |
|                                                    |
|  Your inputs shaped:                               |
|  - Warm tone across all pages                      |
|  - HIPAA compliance notices added                  |
|  - FAQ page added (common for dental practices)    |
|  - 8 SEO keywords targeted                         |
+--------------------------------------------------+
```

**Acceptance Criteria:**

1. Dashboard site card includes a "Your inputs shaped" section with 3-5 bullet points
2. Bullets are generated during the pipeline and stored with the Blueprint
3. Each bullet traces a specific AI decision to a user input or industry inference
4. At least one bullet references something the AI added proactively (e.g., compliance, FAQ) to demonstrate AI value
5. Summary is visible without expanding/clicking — it's part of the default card view
6. Summary updates if the user regenerates the site

---

## Priority & Sequencing

| Feature | Impact | Effort | Priority | Rationale |
|---------|--------|--------|----------|-----------|
| F1: Live Inference Cards | High | Medium | P1 | Builds trust at the moment of input; re-uses existing API data |
| F2: AI Strategy Preview | Very High | Medium | P1 | Biggest trust gap — users currently go from inputs straight to blind generation |
| F3: Live Generation Narrative | Medium | Low | P2 | Improves wait experience; mostly prompt/summary changes in existing phases |
| F4: "Why This?" Tooltips | High | Medium | P2 | Deepest trust signal but only reached by engaged users who review content |
| F5: Dashboard Summary | Low | Low | P3 | Nice reinforcement but not on the critical trust path |

**Recommended implementation order:** F2 → F1 → F3 → F4 → F5

F2 first because the review-settings page is the last chance to build trust before the irreversible generation step. F1 next because it addresses the earliest trust gap. F3 is low effort and transforms dead wait time into engagement.

---

## Metrics & Success Criteria

| Metric | Current Baseline | Target | How to Measure |
|--------|-----------------|--------|----------------|
| Onboarding completion rate | Unknown | +15% | % of users who reach Generate from Step 1 |
| Generation-to-review rate | Unknown | +20% | % of generated sites where user opens review page |
| Review page edit rate | Unknown | +25% | % of users who edit at least 1 section |
| Time on review-settings page | Unknown | +30s | Average time before clicking Generate |
| Regeneration rate (negative signal) | Unknown | -10% | Fewer full regenerations = better first output alignment |

---

## Out of Scope

- Allowing users to modify AI strategy mid-generation (e.g., pause and redirect)
- Exposing raw AI prompts or model details to users
- A/B testing framework for measuring trust metrics (separate initiative)
- Chat-based interaction with the AI during onboarding (conversational UI pivot)

---

## Open Questions

1. **Research preview timing (F2):** Should we run Research eagerly after the Audience step (background) so it's ready by review-settings? This would eliminate the 10-20s wait but adds API cost for users who abandon.
2. **Inference card detail level (F1):** How much detail is helpful vs. overwhelming? Should we A/B test minimal (industry + keywords) vs. detailed (pain points + competitors)?
3. **Tooltip data freshness (F4):** After a user edits content, should we re-run the review agent to update quality scores, or mark them as stale?
4. **Competitive positioning (F2):** Is showing AI-inferred competitive positioning valuable, or does it risk being inaccurate for niche businesses?

---

## Handoff

- **Next step:** `/tpm` to break these 5 features into user stories with sprint allocation
- **For complex features (F2, F4):** `/architect` to design the Research preview caching strategy and tooltip data pipeline
- **For implementation:** `/dev` on individual tasks after sprint planning
