# SaaS Onboarding UX Research — TASK-340

**Sprint:** S26 (Research)
**Story:** US-063 — UX Revamp
**Date:** 2026-03-21
**Author:** Visual Designer Agent

---

## 1. Product-by-Product Onboarding Audit

### 1.1 Notion

**Steps:** 4-5 (workspace name, use case, team size, invite teammates, template selection)
**Information density:** Very low per step. One question per screen with generous whitespace.

**Layout & empty space:**
- Centered single-column layout, narrow content width (~480px) on a full white background.
- No side panels or split panes during onboarding. The simplicity IS the design.
- Large illustrations and icons fill empty space contextually.

**Progressive disclosure:**
- Use-case selection (personal, team, enterprise) branches subsequent steps. Selecting "team" adds invite and permission steps; "personal" skips them.
- Template selection appears last, after context is gathered, ensuring recommendations are relevant.

**Trust signals:**
- Minimal explicit trust signals in onboarding. Brand recognition carries the load.
- Post-signup: "Used by teams at [logo wall]" on marketing pages feeds into onboarding confidence.

**AI/automation transparency:**
- Notion AI is opt-in, not part of core onboarding. No AI disclosure during setup.
- When AI features appear later, they use inline labels: "AI" badges on generated blocks.

**Mobile vs. desktop:**
- Identical flow, responsive single-column. Mobile uses full-viewport cards with bottom-anchored CTAs.

---

### 1.2 Linear

**Steps:** 5-6 (workspace name, URL slug, invite team, integrations, first project setup)
**Information density:** Low-medium. Each step has 1-2 inputs plus contextual helper text.

**Layout & empty space:**
- Centered card layout with dark background (very relevant to our context).
- Cards are ~500px wide, floating on a dark gradient backdrop with subtle particle/grid animations.
- Empty space is intentional: dark ambiance conveys premium tool identity.

**Progressive disclosure:**
- Integration step shows top integrations (GitHub, Slack, Figma) with a "show more" expansion.
- Project setup offers templates per detected workflow (agile, kanban) based on earlier team-size answer.

**Trust signals:**
- "Trusted by [company logos]" strip on the signup page. Not repeated inside the onboarding flow itself.
- The product's visual polish (animations, transitions, dark theme) acts as an implicit trust signal.

**AI/automation transparency:**
- Triage AI features shown post-onboarding. During setup, no AI-specific disclosure.
- In-product, AI suggestions use a distinct purple "AI" badge with an opt-in toggle.

**Mobile vs. desktop:**
- Linear's onboarding is desktop-focused. Mobile web redirects to app download prompts. The onboarding is not optimized for mobile browsers.

---

### 1.3 Vercel

**Steps:** 3-4 (account creation, import repo/start from template, configure project, deploy)
**Information density:** Medium. Steps combine multiple inputs (repo selector, framework detection, env vars) but group them logically.

**Layout & empty space:**
- Split conceptual layout: left side shows configuration, right side shows a real-time deployment log/preview during the deploy step.
- Early steps are centered single-column; the deploy step transitions to a richer layout.

**Progressive disclosure:**
- Framework auto-detection reduces manual configuration. If Vercel detects Next.js, it pre-fills build settings.
- Advanced settings (env vars, build commands) hidden behind "Show advanced" toggle.

**Trust signals:**
- Real-time deployment feedback IS the trust signal. Users see their site going live within 30 seconds.
- "Deployed on Vercel's Edge Network" messaging during build reinforces infrastructure credibility.

**AI/automation transparency:**
- v0 (AI feature) is a separate product. Core onboarding doesn't involve AI.
- Framework detection is presented as "We detected Next.js" -- transparent, specific, no jargon.

**Mobile vs. desktop:**
- Mobile-responsive but not mobile-optimized. Repo import and deploy logs are cramped on small screens.

---

### 1.4 Framer

**Steps:** 3-5 (sign up, choose starting point: blank/template/AI, AI prompt or template selection, customize, publish)
**Information density:** Low for initial steps, medium for the AI generation step.

**Layout & empty space:**
- Split-pane layout is the core pattern. Left: controls/input. Right: live canvas preview.
- During AI generation: a full-screen loading state with animated progress and status messages.
- Template browsing uses a grid gallery with hover previews.

**Progressive disclosure:**
- "Start with AI" vs. "Start from template" vs. "Blank" -- three clear paths from step 1.
- AI path asks for a single prompt, then generates. Users refine AFTER seeing results, not before.
- Customization options reveal as users interact with generated sections.

**Trust signals:**
- Template gallery with "Made by [designer name]" attributions.
- Live preview showing a real rendered site builds confidence immediately.
- "Used by 4M+ designers" on marketing, not in-flow.

**AI/automation transparency:**
- **Highly relevant to us.** Framer's AI site generation shows:
  - Animated progress: "Generating layout... Applying styles... Adding content..."
  - Step-by-step status messages during generation.
  - Post-generation: users can see and edit every element, reinforcing "AI assists, you control."
- No confidence scores or "AI learned X" cards -- it's purely generative with full edit capability.

**Mobile vs. desktop:**
- Onboarding works on mobile for template selection. The editor (and AI generation results) is desktop-only. Mobile redirects to "Open on desktop for editing."

---

### 1.5 Webflow

**Steps:** 5-7 (account, role/use-case, team setup, choose path: template/blank/AI, site configuration, designer tutorial)
**Information density:** Low at start (single choice per screen), increases through the flow.

**Layout & empty space:**
- Centered single-column for initial steps.
- Template/AI selection uses a full-width gallery layout.
- The designer itself is a complex IDE-style split-pane (left panel: element tree, center: canvas, right: style panel).

**Progressive disclosure:**
- Role selection (designer, developer, marketer, business owner) customizes the subsequent experience:
  - Developers see code export options earlier.
  - Designers get the visual editor tutorial.
  - Business owners get template-first paths.
- Tutorial overlays appear progressively as users interact with the designer.

**Trust signals:**
- "Powering the websites of [large brand logos]" during signup.
- Tutorial completion badges and progress indicators.
- CMS and hosting capabilities mentioned during setup to justify platform choice.

**AI/automation transparency:**
- AI site builder (relatively new) presents a prompt-based flow similar to Framer.
- Shows "Generating your site..." with section-by-section progress.
- Post-generation diff is implicit -- users land in the designer with full edit capability.

**Mobile vs. desktop:**
- Signup/onboarding works on mobile. The designer is strictly desktop. Mobile shows a "visit on desktop" message for the editor.

---

### 1.6 Squarespace

**Steps:** 6-8 (what's your site for, what topic, choose template, customize: colors/fonts/layout, add pages, connect domain, launch checklist)
**Information density:** Medium. Each step has curated choices (not open-ended), keeping cognitive load low while gathering substantial information.

**Layout & empty space:**
- Split-pane is the signature pattern:
  - Left: narrow input panel (~35% width) with options.
  - Right: live site preview (~65% width) updating in real-time.
- This appears from the template selection step onward.
- Early topic/purpose steps are centered single-column.

**Progressive disclosure:**
- Topic detection (e.g., "Restaurant") auto-suggests relevant templates, page types (Menu, Reservations), and content blocks.
- Style customization reveals layers: colors first, then fonts, then spacing -- not all at once.
- Domain connection deferred to launch checklist (not blocking).

**Trust signals:**
- "Join millions of businesses, artists, and creators" during signup.
- Template previews show polished, real-content examples (not wireframes).
- SSL, hosting, and CDN mentioned as included features during checkout.

**AI/automation transparency:**
- Squarespace Blueprint (AI) asks structured questions then generates a site.
- Transparency is medium: "Based on your answers, we built this" but no step-by-step AI thinking shown.
- Uses "Recommended for you" labels on AI-selected templates and sections.

**Mobile vs. desktop:**
- Full mobile onboarding experience. Split-pane collapses to stacked: preview on top, controls below.
- Mobile editing available through the Squarespace app (native).

---

### 1.7 Wix

**Steps:** 6-9 (site type, features needed, site name, add apps, template selection OR Wix ADI questions, customize)
**Information density:** Medium-high. Some steps combine multi-select with descriptions. Feature selection can show 10+ toggleable options.

**Layout & empty space:**
- Two distinct paths:
  - **ADI (AI Design Intelligence):** Centered conversational flow with chat-like Q&A, then full-page generation result.
  - **Editor:** Template gallery, then full-screen drag-and-drop editor.
- ADI uses a vertical scrolling card layout. Each answered question stacks above the current one.

**Progressive disclosure:**
- ADI path asks ~6 targeted questions, then generates. Users don't choose components -- AI decides.
- Editor path shows all templates upfront but filters by detected category.
- Post-generation customization reveals tools contextually: click a section to see its edit options.

**Trust signals:**
- "Create a website you're proud of" with social proof numbers (200M+ users).
- ADI shows "We built your site!" celebration moment with confetti animation.
- App market integration shown during onboarding: "Add booking, store, blog" implies ecosystem maturity.

**AI/automation transparency:**
- **Highly relevant.** Wix ADI shows:
  - "Analyzing your answers..." loading state.
  - "Building your homepage... Adding your pages... Applying your style..." progressive steps.
  - Post-generation: a guided tour highlights what AI created and how to modify it.
- ADI-generated elements are NOT visually distinguished from manual ones post-creation.

**Mobile vs. desktop:**
- Full mobile onboarding. ADI works well on mobile (conversational format is naturally mobile-friendly).
- Mobile editor is a separate, simplified interface (not the full desktop editor).

---

### 1.8 Canva

**Steps:** 3-4 (account, what will you use Canva for, team/solo, optional: brand kit setup)
**Information density:** Low. Use-case selection is a visual grid of icons. Brand kit is optional.

**Layout & empty space:**
- Centered single-column with large visual cards for selection.
- Use-case grid fills the screen effectively: each option is an illustrated card.
- Post-onboarding: immediately drops into the editor/dashboard with a "What will you design today?" search bar.

**Progressive disclosure:**
- Use-case selection (social media, presentation, print, video) customizes the home dashboard: relevant templates surface first.
- Brand kit is offered but skippable. Users who add brand colors/fonts get personalized template suggestions.
- Pro features are subtly gated: templates show a crown icon for premium, discoverable but not blocking.

**Trust signals:**
- "Join 170M+ monthly users" on signup.
- Template quality IS the trust signal -- Canva shows polished templates immediately.
- "Used by 85% of Fortune 500 companies" for enterprise prospects.

**AI/automation transparency:**
- Magic Design (AI) is an opt-in feature. Users paste content and get layout suggestions.
- AI-generated suggestions show "Magic Design" label.
- "Describe what you want" prompt with example suggestions for guidance.

**Mobile vs. desktop:**
- Identical onboarding flow. Canva's mobile web and app experiences are closely matched.
- Editor on mobile is a simplified but functional version of desktop.

---

### 1.9 Figma

**Steps:** 3-5 (account, role: designer/developer/PM/other, team name, invite collaborators, first file: blank/template/tutorial)
**Information density:** Very low. One question per screen with large illustrations.

**Layout & empty space:**
- Centered layout with animated illustrations that respond to selections.
- Very generous whitespace. Content width ~400px on a light background.
- Post-onboarding: drops directly into the file browser/canvas.

**Progressive disclosure:**
- Role selection adjusts the dashboard: developers see Dev Mode prominently, PMs see FigJam.
- Tutorial is offered but skippable via "I know my way around" link.
- Plugin/widget suggestions based on role appear after first file creation, not during onboarding.

**Trust signals:**
- Minimal in-flow trust signals. Figma's market position carries the brand.
- Tutorial/onboarding uses real product features (the canvas itself) as a trust demonstration.

**AI/automation transparency:**
- AI features (auto-layout suggestions, content generation) are post-onboarding and inline.
- No AI-specific transparency during setup.

**Mobile vs. desktop:**
- Onboarding accessible on mobile. The editor requires desktop (or iPad app with modified experience).

---

### 1.10 Stripe

**Steps:** 8-12 (business type, business details, personal verification, bank account, product/pricing setup, checkout configuration, test mode walkthrough, go-live checklist)
**Information density:** High. Multiple inputs per step. Form-heavy due to regulatory requirements (KYC, tax, banking).

**Layout & empty space:**
- **Unique pattern: contextual side panel.** Left side (~60%): form inputs. Right side (~40%): contextual help card explaining WHY each field matters and showing a preview of how the checkout will look.
- The side panel updates dynamically as users fill fields.
- Progress indicator: vertical step list on the left margin (not horizontal).

**Progressive disclosure:**
- Business type selection (sole prop, LLC, corporation, non-profit) determines which fields appear in subsequent steps.
- "Optional" fields are collapsed by default. Required fields are front-and-center.
- Test mode is offered before live mode: "Try a test payment" before committing to go-live.

**Trust signals:**
- "Millions of businesses" on marketing, not in-flow.
- PCI compliance and security badges on the banking information step.
- Live checkout preview (showing exactly what customers will see) builds confidence.
- "You can change these settings later" messaging reduces commitment anxiety.

**AI/automation transparency:**
- Stripe Radar (fraud AI) is explained post-setup: "Radar reviews every payment" with a link to learn more.
- Tax auto-calculation shown as a feature during pricing setup.
- No AI-specific onboarding steps.

**Mobile vs. desktop:**
- Full mobile onboarding (critical for business owners on the go).
- The contextual side panel stacks below forms on mobile.
- Vertical progress stepper collapses to a horizontal bar on mobile.

---

## 2. Pattern Synthesis

### 2.1 Patterns Applicable to Our AI Website Builder

| Pattern | Seen In | Relevance to Our Builder |
|---------|---------|--------------------------|
| **Split-pane with live preview** | Squarespace, Framer, Webflow, Stripe | Directly applicable. Our design/brand/fonts steps (5-8) should show live preview of choices. Stripe's contextual help panel model works for our early text-input steps too. |
| **Progressive AI generation feedback** | Framer, Wix ADI, Webflow AI | Critical for our build step. Showing "Generating layout... Applying colors... Adding content..." builds trust and reduces perceived wait time. |
| **Branching by use-case/role** | Notion, Webflow, Wix, Canva | Our "idea" and "audience" steps already gather this context. We should use it to customize subsequent step content (e.g., "For a coffee shop, we recommend these pages..."). |
| **Centered-then-split layout transition** | Squarespace, Vercel, Stripe | Matches our 3-tier architecture decision. Early text steps (name, idea, audience) stay centered; design steps shift to split-pane. The transition itself signals "now we're building." |
| **Contextual insight cards** | Stripe (side panel), Squarespace ("Recommended for you") | Our AiInsightCard fits here. "We detected a coffee shop in the food industry" on the idea step; "Based on your audience, we suggest..." on the pages step. |
| **Dark premium aesthetic** | Linear, Framer | Validates our dark mode (slate-950) direction. Linear proves a dark onboarding can feel premium without being heavy. Subtle gradients and glow effects are key. |
| **"You can change this later" messaging** | Stripe, Squarespace, Canva | Reduces decision paralysis. Every step in our flow should communicate that choices aren't permanent. |
| **Labeled progress sections (not just dots)** | Stripe (vertical steps), Squarespace (section labels) | Our planned ProgressStepper with "Vision / Design / Content / Launch" labels directly follows this pattern. |
| **Celebration/summary moment before generation** | Wix (confetti), Squarespace (launch checklist) | Our RecipeCard (review-settings step) should be a deliberate "here's everything you chose" celebration before triggering generation. |
| **AI opt-in language ("AI assists, you control")** | Framer, Canva | Critical for trust. Our onboarding should frame AI as "generating a starting point you'll customize" rather than "we'll build your final site." |

### 2.2 Patterns Not Relevant to Our Context

| Pattern | Seen In | Why Not Applicable |
|---------|---------|-------------------|
| **Team invite steps** | Notion, Linear, Figma | Our builder is single-user onboarding. No team collaboration during initial setup. |
| **Repo/code import** | Vercel | Our users aren't developers importing code. |
| **App marketplace during onboarding** | Wix | Too complex for V1. We're not offering plugin selection during onboarding. |
| **Role-based dashboard customization** | Figma, Webflow | We have one user type (site owner). No need for role branching. |
| **Regulatory/KYC form density** | Stripe | Our onboarding is creative, not compliance. We should maintain low information density. |
| **Template gallery as primary path** | Squarespace, Wix Editor, Canva | Our flow is AI-first, not template-first. Users describe; AI generates. Templates would undermine the value proposition. |
| **Native mobile editor** | Squarespace, Wix, Canva | Out of scope. Our builder is desktop-first for editing. |

---

## 3. Top 5 Patterns for Our AI Website Builder

### Pattern 1: Adaptive Layout Tiers (Centered -> Split-Pane -> Summary)

**Seen in:** Squarespace, Stripe, Vercel

**How it works:** The layout morphs as the user progresses. Early questions use a focused centered layout. Mid-flow design steps use a split-pane with live preview. The final step uses a full-width summary/recipe layout.

**Why it matters for us:** Our 11-step flow has three natural phases: text-input steps (1-4: start, name, idea, audience), visual-choice steps (5-8: pages, design, brand, fonts), and finalization steps (9-11: follow-up, tone, review). Each phase benefits from a different layout density. This prevents the "lots of empty space" problem identified in US-063.

**Implementation notes:**
- Steps 1-4: centered layout (~560px content width), optional AiInsightCard below inputs.
- Steps 5-8: split-pane (50/50 or 45/55), input left, SiteSkeletonPreview right.
- Steps 9-11: centered with a RecipeCard summarizing all choices.
- Transition between tiers should animate (slide/fade) to signal phase change.

---

### Pattern 2: Real-Time AI Insight Cards

**Seen in:** Stripe (contextual side panel), Framer (generation feedback), Wix ADI (progressive analysis)

**How it works:** As users provide input, a contextual card appears showing what the system understood or detected. Stripe does this with a help panel explaining field purposes. Framer/Wix show what AI is generating from input.

**Why it matters for us:** Our biggest trust gap is the "black box" perception. Users type "a neighborhood coffee shop with a cozy vibe" and get no feedback until generation is complete. Insight cards close this loop step-by-step.

**Implementation notes:**
- After the "idea" step: "We detected: Industry: Food & Beverage. Business type: Cafe/Coffee Shop. Vibe: Cozy, neighborhood-focused."
- After the "audience" step: "Your primary audience: local residents aged 25-45. We'll optimize content for community engagement."
- After "pages" selection: "Your site will have 5 pages. Based on similar coffee shops, we recommend adding a Menu page."
- These derive from existing AI analysis responses (ADR-M18-003) -- no new API calls.

---

### Pattern 3: Progressive Site Skeleton Preview

**Seen in:** Squarespace (live template preview), Framer (canvas preview), Stripe (checkout preview)

**How it works:** A lightweight visual representation of the final product updates as users make choices. Not pixel-perfect -- a schematic that shows structure, color, and typography direction.

**Why it matters for us:** Users currently provide 11 steps of input with zero visual feedback until the fully generated site appears. A skeleton preview showing header shape, color application, font pairing, and page structure creates anticipation and confidence.

**Implementation notes:**
- The SiteSkeletonPreview renders a simplified wireframe: header bar, hero section, content blocks, footer.
- As colors are chosen: skeleton fills with selected palette.
- As fonts are chosen: skeleton text updates to selected font pairing.
- As pages are added: skeleton navigation updates with page names.
- This is a React component consuming onboarding state, not an iframe or real render.
- Debounce updates by 300ms to prevent jitter.

---

### Pattern 4: Labeled Section Progress with Phase Transitions

**Seen in:** Stripe (vertical step list with sections), Squarespace (section labels), Webflow (phase indicators)

**How it works:** Instead of numbered dots or a simple progress bar, the stepper groups steps into named phases. Completing a phase triggers a visual transition (animation, color change, layout shift) that communicates momentum.

**Why it matters for us:** With 11 steps, numbered dots feel overwhelming. Grouping into 4 phases -- Vision (steps 1-4), Design (steps 5-8), Content (steps 9-10), Launch (step 11) -- makes the journey feel shorter and gives users a mental model.

**Implementation notes:**
- ProgressStepper component shows: `[Vision] --> [Design] --> [Content] --> [Launch]`
- Active phase is highlighted; completed phases show a check.
- Within each phase, sub-steps can show as a subtle secondary indicator (dots or fraction: "Step 2 of 4 in Vision").
- Phase transition moment: brief animation (e.g., the progress bar pulses, a micro-celebration appears).

---

### Pattern 5: Decision Anxiety Reduction ("Change Later" + Defaults)

**Seen in:** Stripe ("You can change these settings later"), Canva (skippable brand kit), Squarespace (deferred domain), Notion (skippable invite)

**How it works:** Every choice explicitly communicates reversibility. Smart defaults reduce blank-slate paralysis. Optional steps are clearly marked as skippable.

**Why it matters for us:** Our AI builder asks users to make design decisions (colors, fonts, tone) that feel consequential. Many users will hesitate or abandon if they think they're committing to a final result. Framing every choice as a "starting point" that AI will interpret (and that they can modify later) reduces friction.

**Implementation notes:**
- Subtitle text under each step: "You can refine this after your site is generated."
- Smart defaults: pre-fill color and font based on detected industry. Show as "Suggested based on your coffee shop" with option to override.
- Skip buttons on non-critical steps (follow-up, tone) with "We'll use smart defaults" messaging.
- RecipeCard on review step explicitly states: "This is your starting point. Everything can be customized after generation."

---

## 4. Wireframe Layout Options

### Option A: Fixed Split-Pane (Full Flow)

```
Desktop (>=1024px):
+------------------------------------------------------------------+
| [=] Logo        Vision > Design > Content > Launch       [?] Help |
+------------------------------------------------------------------+
|                          |                                        |
|   STEP CONTENT           |   PREVIEW / INSIGHT PANE               |
|   (40% width)            |   (60% width)                          |
|                          |                                        |
|   Step Title             |   +------------------------------+     |
|   Subtitle: "You can     |   |                              |     |
|   change this later"     |   |   [AI Insight Card]          |     |
|                          |   |   "We detected: Coffee Shop" |     |
|   +------------------+   |   |                              |     |
|   | Input field      |   |   +------------------------------+     |
|   +------------------+   |                                        |
|                          |   +------------------------------+     |
|   +------------------+   |   |  Site Skeleton Preview       |     |
|   | [Continue]       |   |   |  +---------+                 |     |
|   +------------------+   |   |  | Header  |                 |     |
|                          |   |  +---------+                 |     |
|                          |   |  | Hero    |                 |     |
|                          |   |  +---------+                 |     |
|                          |   |  | Content |                 |     |
|                          |   |  +---------+                 |     |
|                          |   |  | Footer  |                 |     |
|                          |   |  +---------+                 |     |
|                          |   +------------------------------+     |
|                          |                                        |
+------------------------------------------------------------------+
|   Step 2 of 11  |  Back                              Continue --> |
+------------------------------------------------------------------+

Mobile (<1024px):
+---------------------------+
| [=] Logo          [?]     |
+---------------------------+
| Vision > Design > ...     |
+---------------------------+
|                           |
|  Step Title               |
|  Subtitle                 |
|                           |
|  +---------------------+  |
|  | Input field         |  |
|  +---------------------+  |
|                           |
|  +---------------------+  |
|  | AI Insight Card     |  |
|  | "We detected..."    |  |
|  +---------------------+  |
|                           |
|  [Continue Button]        |
|                           |
+---------------------------+
```

**Pros:**
- Consistent layout throughout -- users never lose orientation.
- Preview pane always visible -- maximum feedback surface area.
- Right pane content can vary per step (insight card for text steps, skeleton for design steps).

**Cons:**
- Input area feels cramped on early text-only steps (40% for a single text field is wasteful).
- Split-pane on step 1 ("Let's get started") feels premature -- nothing to preview yet.
- Higher implementation complexity: every step must provide right-pane content.
- Mobile loses the preview entirely, creating an inconsistent experience.

**Verdict:** Overkill for our flow. The early steps don't generate enough preview content to justify a persistent split.

---

### Option B: Adaptive 3-Tier Layout (Recommended)

```
TIER 1 — Centered (Steps 1-4: Start, Name, Idea, Audience)
+------------------------------------------------------------------+
| [=] Logo        [Vision] > Design > Content > Launch     [?] Help |
+------------------------------------------------------------------+
|                                                                    |
|                    Step Title                                      |
|                    Subtitle                                        |
|                                                                    |
|                    +------------------------+                      |
|                    | Input field            |                      |
|                    +------------------------+                      |
|                                                                    |
|                    +------------------------+                      |
|                    | AI Insight Card        |                      |
|                    | "We detected: Coffee   |                      |
|                    |  Shop, Food & Bev"     |                      |
|                    +------------------------+                      |
|                                                                    |
|                    [<- Back]    [Continue ->]                       |
|                                                                    |
+------------------------------------------------------------------+
|              *  *  *  o  o  o  o  o  o  o  o                      |
+------------------------------------------------------------------+


TIER 2 — Split-Pane (Steps 5-8: Pages, Design, Brand, Fonts)
+------------------------------------------------------------------+
| [=] Logo        Vision > [Design] > Content > Launch     [?] Help |
+------------------------------------------------------------------+
|                          |                                        |
|   STEP INPUTS (45%)      |   LIVE PREVIEW (55%)                   |
|                          |                                        |
|   "Choose your brand     |   +------------------------------+     |
|    colors"               |   | Site Skeleton                |     |
|                          |   |                              |     |
|   Primary:   [#4856FA]   |   | +--[Nav: Home|Menu|About]--+ |     |
|   Secondary: [#FF6B35]   |   | |                          | |     |
|   Accent:    [#1DB954]   |   | | Welcome to               | |     |
|                          |   | | Cozy Corner Cafe         | |     |
|   AI Suggestion:         |   | |        [CTA Button]      | |     |
|   "Warm tones work well  |   | |                          | |     |
|    for cafes. We suggest  |   | +--------------------------+ |     |
|    earth-tone accents."   |   | |  About  |  Menu         | |     |
|                          |   | +---------+----------------+ |     |
|   [<- Back] [Continue->] |   | |  Footer                  | |     |
|                          |   | +--------------------------+ |     |
|                          |   +------------------------------+     |
+------------------------------------------------------------------+
|              o  o  o  o  *  *  *  o  o  o  o                      |
+------------------------------------------------------------------+


TIER 3 — Summary/Recipe (Steps 9-11: Follow-up, Tone, Review)
+------------------------------------------------------------------+
| [=] Logo        Vision > Design > Content > [Launch]     [?] Help |
+------------------------------------------------------------------+
|                                                                    |
|   "Review Your Site Recipe"                                        |
|   Everything below is a starting point — customize after launch.   |
|                                                                    |
|   +------------------+  +------------------+  +----------------+   |
|   | VISION           |  | DESIGN           |  | CONTENT        |   |
|   | Name: Cozy       |  | Colors: #4856FA  |  | Tone: Warm,    |   |
|   |   Corner Cafe    |  |   #FF6B35        |  |   friendly     |   |
|   | Idea: Neighborh- |  | Fonts: Inter +   |  | Pages: Home,   |   |
|   |   ood coffee     |  |   Merriweather   |  |   Menu, About, |   |
|   | Audience: Local  |  | Style: Modern    |  |   Contact,     |   |
|   |   residents      |  |   minimal        |  |   Blog         |   |
|   | [Edit]           |  | [Edit]           |  | [Edit]         |   |
|   +------------------+  +------------------+  +----------------+   |
|                                                                    |
|            +--------------------------------------+                |
|            |   [  Generate My Website  -->  ]     |                |
|            +--------------------------------------+                |
|            "AI will create your site in ~60 seconds"               |
|                                                                    |
+------------------------------------------------------------------+
```

**Pros:**
- Each layout tier matches the cognitive task: focused input, visual comparison, holistic review.
- Early steps feel spacious and premium (Linear/Notion vibe), not cramped.
- Split-pane only appears when there's something meaningful to preview.
- Layout transition signals phase progression -- the UI physically evolving mirrors the site being built.
- Summary tier provides a confidence-building "recipe card" moment before generation.
- Aligns with ADR-M18-002 architecture decision already documented.

**Cons:**
- Three layout states to implement and test.
- Layout transitions must be smooth to not feel jarring (needs animation work).
- Mobile still loses split-pane (stacks to single column for tier 2).

**Verdict:** Best fit for our flow. Balances simplicity and richness. Aligns with existing architecture decisions.

---

### Option C: Conversational Stack with Floating Preview

```
Desktop (>=1024px):
+------------------------------------------------------------------+
| [=] Logo        Vision > Design > Content > Launch       [?] Help |
+------------------------------------------------------------------+
|                                                                    |
|  +------------------------------------------------------+         |
|  | Previous answers (collapsed, scrollable)              |         |
|  | Name: Cozy Corner Cafe  |  Idea: Coffee shop  | ...  |         |
|  +------------------------------------------------------+         |
|                                                                    |
|  +------------------------------------------------------+         |
|  |  Current Step (full width, card style)                |         |
|  |                                                       |         |
|  |  "Who is your target audience?"                       |         |
|  |                                                       |  +----+ |
|  |  +----------------------------------------------+    |  |    | |
|  |  | Describe your ideal visitor...               |    |  | P  | |
|  |  +----------------------------------------------+    |  | R  | |
|  |                                                       |  | E  | |
|  |  +----------------------------------------------+    |  | V  | |
|  |  | AI Insight: "Based on 'neighborhood coffee   |    |  | I  | |
|  |  | shop,' your likely audience is local          |    |  | E  | |
|  |  | residents aged 25-55 who value community."    |    |  | W  | |
|  |  +----------------------------------------------+    |  |    | |
|  |                                                       |  |    | |
|  |  [<- Back]                          [Continue ->]     |  |    | |
|  +------------------------------------------------------+  +----+ |
|                                                                    |
+------------------------------------------------------------------+

The floating preview panel (right edge):
- Collapsed by default (thin strip showing a site thumbnail)
- Expands on hover/click to ~40% width overlay
- Always accessible but never forced
- Shows site skeleton preview with current choices applied
```

**Pros:**
- Previous answers remain visible -- builds a sense of accumulated progress.
- The conversational stack feels natural for an AI product (like chatting with the builder).
- Floating preview is opt-in, reducing distraction on text-input steps.
- Works better on mobile: the stack naturally linearizes, and floating preview becomes a bottom sheet.

**Cons:**
- Previous-answer strip adds visual noise and may feel cluttered with many steps.
- Floating/overlay preview is less discoverable than a persistent split-pane.
- The "conversational" metaphor may confuse users who expect a wizard-style flow.
- Implementation complexity: collapsible preview overlay with animation.
- Hiding the preview by default means many users will never see it, defeating its purpose.

**Verdict:** Innovative but risky. The conversational model works for chat-based AI tools (ChatGPT) but may not fit a structured wizard flow. The floating preview's discoverability problem undermines the core goal of showing live feedback.

---

## 5. Final Recommendation

**Pursue Option B: Adaptive 3-Tier Layout.**

It is the strongest match for our product because:

1. **Already aligned with architecture** -- ADR-M18-002 recommends split-pane for desktop on design steps, which is exactly what Tier 2 delivers.

2. **Validates against industry leaders** -- Squarespace (split-pane for design), Stripe (contextual panel), and Linear (dark premium centered) are the direct inspirations for each tier.

3. **Solves the empty space problem incrementally** -- Tier 1 uses insight cards (low effort), Tier 2 adds the skeleton preview (medium effort), and Tier 3 adds the recipe summary (medium effort). Each tier can ship independently.

4. **Layout transitions create narrative** -- The physical change from centered to split to summary mirrors "telling AI about your business" to "seeing it take shape" to "reviewing before launch." This is a UX story, not just a layout.

5. **Mobile degrades gracefully** -- All three tiers collapse to single-column with insight cards inline. No mobile-specific layout needed beyond responsive breakpoints.

**Recommended implementation sequence:**
1. ProgressStepper with labeled phases (can ship standalone).
2. Tier 1: AiInsightCards on steps 1-4 (uses existing AI analysis data).
3. Tier 3: RecipeCard on review-settings step (aggregates state, no preview needed).
4. Tier 2: SiteSkeletonPreview in split-pane on steps 5-8 (highest effort, highest impact).

This sequence lets us ship incremental improvements while building toward the full vision.

---

## Appendix: Cross-Product Comparison Matrix

| Product | Steps | Density | Layout | Preview | AI Transparency | Dark Mode | Mobile Onboarding |
|---------|-------|---------|--------|---------|-----------------|-----------|-------------------|
| Notion | 4-5 | Very low | Centered | None | None | No | Yes (identical) |
| Linear | 5-6 | Low-Med | Centered (dark) | None | Post-onboarding | Yes | No (desktop only) |
| Vercel | 3-4 | Medium | Centered -> split | Deploy log | Framework detection | No | Partial |
| Framer | 3-5 | Low-Med | Split-pane | Live canvas | Generation progress | Partial | Desktop for editor |
| Webflow | 5-7 | Low-Med | Centered -> IDE | Editor canvas | Generation progress | No | Desktop for editor |
| Squarespace | 6-8 | Medium | Centered -> split | Live site preview | "Recommended for you" | No | Yes (stacked) |
| Wix | 6-9 | Med-High | Conversational (ADI) | Full site preview | Step-by-step generation | No | Yes (ADI works well) |
| Canva | 3-4 | Low | Centered grid | Template previews | "Magic Design" label | No | Yes (identical) |
| Figma | 3-5 | Very low | Centered | None | None | No | Partial |
| Stripe | 8-12 | High | Split (form + context) | Checkout preview | Feature explanation | No | Yes (stacked) |
| **Ours** | **11** | **Low** | **Centered (current)** | **None (current)** | **None (current)** | **Yes** | **Single-column** |
| **Ours (target)** | **11** | **Low-Med** | **3-tier adaptive** | **Skeleton preview** | **Insight cards + generation progress** | **Yes** | **Stacked + cards** |
