# AI Transparency Patterns Research — TASK-341

**Sprint:** 26
**Author:** Visual Designer (Agent)
**Date:** 2026-03-21
**Scope:** How AI products communicate "what the AI is thinking" and how to apply those patterns to our 11-step onboarding flow without adding API calls.

---

## 1. Competitive Audit: AI Transparency Patterns

### 1.1 ChatGPT (OpenAI)

| Pattern | Description |
|---------|-------------|
| **Streaming text** | Tokens appear word-by-word; the cursor blinks at the insertion point. Creates a "thinking out loud" feeling. |
| **"Searching the web..."** | A collapsible status line shows the tool being invoked (e.g., "Browsing 3 sites"). Provides process visibility without detail overload. |
| **Thinking block** | GPT-4o shows a collapsed "Thought for X seconds" block. Users can expand it. Signals depth without blocking the flow. |
| **Model badge** | Displays the model name (GPT-4o, o3) in the message header. Lets power users gauge capability. |

**Key takeaway:** ChatGPT anchors transparency on *process labels* — short verb phrases that name the current operation, not the data behind it.

### 1.2 Jasper

| Pattern | Description |
|---------|-------------|
| **"AI is writing..."** skeleton** | A pulsing skeleton loader appears inside the content area. The placeholder shape mirrors the expected output (paragraph, bullet list, etc.). |
| **Tone / brand voice badge** | A small chip at the top of the editor shows the active brand voice profile ("Formal - TechCo"). Confirms the AI knows *who* it's writing for. |
| **Score bar** | After generation, a horizontal bar scores content on readability, engagement, and SEO. Confidence is post-hoc, not predictive. |

**Key takeaway:** Jasper uses *confirmation chips* — small, persistent UI elements that confirm which user context the AI is operating under.

### 1.3 Copy.ai

| Pattern | Description |
|---------|-------------|
| **Workflow step cards** | Multi-step workflows show numbered cards with checkmarks as each AI step completes. Progress is linear and visible. |
| **Input echo** | Before generation, Copy.ai re-displays the user's inputs (product name, audience, tone) in a summary card. Users can verify the AI has the right context. |
| **"Generating 5 options"** | A count indicator tells users how many variants are being created, setting expectations for wait time. |

**Key takeaway:** Copy.ai's strongest pattern is the *input echo* — restating user-provided context back to them as proof the AI understood.

### 1.4 Midjourney

| Pattern | Description |
|---------|-------------|
| **Progressive image reveal** | Images render from blurry to sharp in 4 visible stages. Each stage is a checkpoint the user can evaluate. |
| **Prompt interpretation line** | The bot rephrases the user's prompt in its own words (visible in the job message). Users see how the AI "read" their intent. |
| **Parameter badges** | Active parameters (--ar 16:9, --style raw) appear as badges on the job card. Confirms which knobs were turned. |

**Key takeaway:** Midjourney excels at *progressive disclosure of quality* — showing incomplete-but-improving results rather than hiding behind a spinner.

### 1.5 Perplexity

| Pattern | Description |
|---------|-------------|
| **"Searching N sources" indicator** | A live counter shows how many sources the AI is consulting. Builds trust through breadth. |
| **Source citation chips** | Inline numbered citations link to source URLs. The AI's reasoning is auditable in real time. |
| **"Analyzing..." step labels** | Before the answer streams, labels like "Reading...", "Analyzing...", "Writing answer..." appear sequentially. |
| **Related questions** | After the answer, 3-4 follow-up questions are suggested. Signals the AI understood the topic deeply enough to anticipate next steps. |

**Key takeaway:** Perplexity's strongest pattern is *citing its work* — making the AI's information diet visible. In our context, the equivalent is showing *which user inputs* informed a decision.

### 1.6 GitHub Copilot

| Pattern | Description |
|---------|-------------|
| **Ghost text (inline suggestion)** | Greyed-out code appears ahead of the cursor. The user sees the AI's guess before accepting it. Zero-commitment preview. |
| **"Used N files as context" badge** | In Copilot Chat, a small expandable section lists which files were read. Transparency about scope. |
| **Confidence via completeness** | Copilot doesn't show a score — it expresses confidence by how much code it offers. A one-liner = low confidence; a full function = high. |

**Key takeaway:** Copilot uses *implicit confidence* — the length and completeness of the suggestion itself signals how sure the AI is, without numbers.

---

## 2. Pattern Taxonomy

From the audit above, five distinct transparency patterns emerge:

| # | Pattern Name | Mechanism | User Need It Serves | Example Products |
|---|-------------|-----------|--------------------|--------------------|
| P1 | **Process Label** | Short verb phrase naming the current AI operation | "What is it doing right now?" | ChatGPT, Perplexity |
| P2 | **Context Confirmation Chip** | Small persistent badge echoing a key user input | "Does it know what I told it?" | Jasper, Midjourney |
| P3 | **Input Echo / Summary Card** | Multi-field summary of what the AI will use | "Did it get everything right?" | Copy.ai |
| P4 | **Progressive Reveal** | Showing partial/improving results during generation | "Is it making progress?" | Midjourney |
| P5 | **Derived Insight** | Showing what the AI *inferred* from user input | "What did it learn about me?" | Perplexity (sources), Copilot (context files) |

**For our onboarding, P2 (Context Confirmation Chip) and P5 (Derived Insight) are the most applicable.** We are not streaming content or doing multi-step generation during onboarding steps — we are collecting inputs step-by-step. The transparency opportunity is showing users that the AI is *learning from each answer* as they progress.

---

## 3. Feasibility Constraint: No New API Calls

Our constraint: all insight data must come from **existing session state** (the `onboardingSession.data` JSON blob) or from data already returned by current API endpoints. No new endpoints, no extra AI calls.

### What already exists in session state after each step:

| Session Field | Written By | Available From Step |
|--------------|-----------|-------------------|
| `name` | `/api/onboarding/save` (name step) | name onward |
| `idea` | `/api/onboarding/save` (idea step) | idea onward |
| `industry` | `/api/ai/analyze` (called on pages step entry) | pages onward |
| `keywords[]` | `/api/ai/analyze` | pages onward |
| `compliance_flags[]` | `/api/ai/analyze` | pages onward |
| `tone` (AI-suggested) | `/api/ai/analyze` | pages onward |
| `audience` | `/api/onboarding/save` (audience step) | audience onward |
| `suggested_pages[]` | `/api/ai/suggest-pages` | pages onward |
| `design_source` | `/api/onboarding/save` (design step) | design onward |
| `logo_url`, `logo_filename` | `/api/onboarding/save` (brand step) | brand onward |
| `palette_url`, `palette_filename` | `/api/onboarding/save` (brand step) | brand onward |
| `colors{}` | `/api/ai/extract-colors` | brand onward |
| `fonts.heading`, `fonts.body` | `/api/onboarding/save` (fonts step) | fonts onward |
| `custom_fonts[]` | `/api/onboarding/save` (fonts step) | fonts onward |
| `tone` (user-selected) | `/api/onboarding/save` (tone step) | tone onward |
| `differentiators` | `/api/onboarding/save` (tone step) | tone onward |
| `referenceUrls[]` | `/api/onboarding/save` (tone step) | tone onward |

All of this is available via the existing `useOnboarding().resume()` hook, which already loads the full session on every step mount. **Zero additional API calls needed.**

---

## 4. Per-Step AI Data Audit

### Steps WITH AI-derived or AI-relevant data:

| Step | Layout Type | AI-Derived Data Available | Data Source |
|------|------------|--------------------------|-------------|
| **name** | Centered (StepLayout) | Name itself can trigger industry keyword detection client-side (regex patterns exist in `/api/ai/analyze` fallback) | Session: `name` |
| **idea** | Centered (StepLayout) | The idea text is the primary AI input; character count is already shown | Session: `idea` |
| **audience** | Centered (StepLayout) | Audience description feeds into analysis and page suggestions | Session: `audience` |
| **pages** | Centered (StepLayout) | `industry`, `keywords[]`, `compliance_flags[]`, `suggested_pages[]` — full AI analysis result | Session via `/api/ai/analyze` + `/api/ai/suggest-pages` |
| **design** | Centered (StepLayout, 2-col grid) | `design_source` selection; industry context informs which option is recommended | Session: `design_source`, `industry` |
| **brand** | Centered (StepLayout, upload zones + swatches) | `colors{}` extracted by AI vision from logo/palette | Session via `/api/ai/extract-colors` |
| **fonts** | Centered (StepLayout, preview tiles + selectors) | Font pairing displayed with extracted colors; heading/body font metadata | Session: `fonts`, `colors` |
| **tone** | Centered (StepLayout, cards + inputs) | AI-suggested tone from analysis; industry-specific differentiator placeholder | Session: `tone` (AI), `industry` |

### Steps WITHOUT AI-derived data:

| Step | Reason |
|------|--------|
| **start** | Welcome screen, no user data yet |
| **follow-up** | Collects additional details (contact info, social links) — purely user input |
| **review-settings** | Summary/confirmation screen before generation — displays data but doesn't derive new insight |

---

## 5. Insight Copy Templates

### 5.1 AiInsightChip — One-liner, Subtle (Centered-Layout Steps)

The `AiInsightChip` is a small, horizontally-oriented element that sits below the subtitle or above the input field. It uses a sparkle/AI icon prefix, muted text (`text-white/50`), and a single line of copy. It should feel like a whispered observation, not a headline.

**Visual spec:**
- Height: 28-32px
- Background: `bg-white/5` with `border border-white/10`, rounded-full
- Icon: 16px sparkle SVG (brand-400 color), left-aligned
- Text: `text-xs text-white/50`, single line, max ~60 characters
- Position: between subtitle and input, centered

#### name step

Trigger: after user types >= 3 characters, client-side regex detects industry keywords.

| Condition | Copy |
|-----------|------|
| Name contains food keywords (cafe, bakery, kitchen, etc.) | "Sounds like food & beverage — we'll tailor your site for that." |
| Name contains tech keywords (tech, app, digital, etc.) | "Detected a tech focus — we'll optimize for that space." |
| Name contains health keywords (clinic, health, dental, etc.) | "Healthcare detected — we'll keep compliance in mind." |
| Generic / no match | "Great name — tell us more on the next step." |

**Data source:** Client-side regex on `name` string (mirrors patterns in `/api/ai/analyze` fallback function). No API call.

#### idea step

Trigger: while user types, show the chip once `idea.length >= 20` (the minimum threshold).

| Condition | Copy |
|-----------|------|
| idea.length >= 20 and < 80 | "Good start — more detail helps the AI personalize your site." |
| idea.length >= 80 and < 200 | "Nice detail — the AI will use this to shape your pages." |
| idea.length >= 200 | "Rich context captured — expect highly tailored suggestions." |

**Data source:** `idea.length` from local state. No API call.

#### audience step

Trigger: after user types >= 10 characters.

| Condition | Copy |
|-----------|------|
| Audience contains age/demographic keywords (millennials, seniors, parents, teens) | "Audience insight noted — we'll match tone and imagery." |
| Audience contains B2B keywords (businesses, companies, agencies, enterprise) | "B2B audience detected — we'll prioritize trust signals." |
| Audience contains local keywords (local, neighborhood, community, city name) | "Local focus noted — we'll highlight location and proximity." |
| Generic | "Your audience shapes every page we suggest next." |

**Data source:** Client-side regex on `audience` string. No API call.

#### tone step

Trigger: on tone card selection.

| Condition | Copy |
|-----------|------|
| Tone = professional_warm | "Professional warmth — approachable but authoritative." |
| Tone = casual_friendly | "Casual & friendly — like talking to a trusted neighbor." |
| Tone = bold_direct | "Bold & direct — no fluff, just impact." |
| Tone = elegant_refined | "Elegant & refined — every word carries weight." |
| Any tone + differentiators.length > 20 | "Your unique angle + {tone_name} tone — a strong combo." |

**Data source:** `selectedTone` from local state + `TONE_SAMPLES` metadata. No API call.

---

### 5.2 AiInsightCard — Multi-line, Richer (Split-Layout / Content-Heavy Steps)

The `AiInsightCard` is a compact card element that sits within or alongside the step content area. It has a header line, 1-2 supporting detail lines, and optionally a small data visualization (e.g., color dots, tag pills). It should feel like a smart assistant's margin note.

**Visual spec:**
- Width: full-width within content column, or sidebar-width in 2-col layouts
- Background: `bg-gradient-to-r from-brand-500/10 to-transparent` with `border border-brand-500/20`, rounded-xl
- Header: `text-sm font-medium text-brand-300` with sparkle icon
- Body: `text-xs text-white/50`, 1-3 lines
- Optional data: inline pills/dots for keywords, colors, etc.
- Position: below the main content area or in a sidebar column

#### pages step

Trigger: after AI analysis completes and `suggested_pages` are populated.

```
Header: "AI analyzed your idea"
Line 1: "Industry detected: {industry_label}"
Line 2: "Keywords: {keywords[0]}, {keywords[1]}, {keywords[2]}"  (pill chips)
Line 3: "{suggested_pages.length} pages recommended for your {industry_label} site"
```

If `compliance_flags.length > 0`:
```
Line 4: "Compliance note: {compliance_flags.join(', ').toUpperCase()} considerations flagged"
```

**Data source:** `industry`, `keywords[]`, `compliance_flags[]`, `suggested_pages[]` — all from session, written by `/api/ai/analyze` and `/api/ai/suggest-pages` (already called on step entry).

#### design step

Trigger: on step load, if `industry` exists in session.

```
Header: "Personalized for {industry_label}"
Line 1: "Your {industry_label} site works best with {design_recommendation}."
Line 2: "Based on your idea and {suggested_pages.length} planned pages."
```

Where `design_recommendation` maps from industry:
- creative_and_design, hospitality, food_and_beverage -> "visual-first layouts with large imagery"
- technology, finance, legal -> "clean, structured layouts with clear CTAs"
- retail -> "product-focused layouts with strong visual hierarchy"
- default -> "balanced layouts with clear information flow"

**Data source:** `industry`, `suggested_pages.length` from session. No API call.

#### brand step

Trigger: after color extraction completes.

```
Header: "Colors extracted from your brand asset"
Body: [inline color dots for each extracted color]
Line 1: "{colors_count} colors identified — {primary_hex} leads as primary."
Line 2: "These colors will flow into every page of your site."
```

Before extraction (logo/palette not yet uploaded):

```
Header: "Your brand palette"
Line 1: "Upload a logo or palette reference — we'll extract colors automatically."
Line 2: "No assets? No problem — pick colors manually below."
```

**Data source:** `colors{}` from session (written by `/api/ai/extract-colors`, already called on upload).

#### fonts step

Trigger: on step load (colors and fonts available).

```
Header: "Typography meets your brand"
Line 1: "Previewing {headingFont} + {bodyFont} with your extracted palette."
Line 2: "{primary_color_swatch} {accent_color_swatch} — your colors, your fonts, one cohesive look."
```

If custom font uploaded:

```
Line 3: "Custom font detected — it will be included in your build."
```

**Data source:** `fonts.heading`, `fonts.body`, `colors{}` from session. No API call.

---

## 6. Feasibility Assessment

### Can we implement this without new API endpoints?

**Yes.** Here is the confirmation:

| Requirement | Status | Justification |
|------------|--------|---------------|
| No new API routes | PASS | All data comes from existing session state loaded by `useOnboarding().resume()` |
| No extra AI calls | PASS | Insight copy uses client-side regex (name, audience) or data already written to session by existing AI endpoints |
| No new database queries | PASS | `resume()` already fetches the full `onboardingSession.data` blob on every step mount |
| No external service calls | PASS | All pattern detection is deterministic string matching on the client |
| Compatible with existing StepLayout | PASS | Both AiInsightChip and AiInsightCard can be placed as children within the existing `<StepLayout>` component's content slot |
| No changes to onboarding flow order | PASS | Insights are additive UI — they don't alter navigation or step sequence |

### Implementation complexity estimate:

| Component | Effort | Notes |
|-----------|--------|-------|
| `AiInsightChip` component | Small (1-2 hours) | Stateless presentational component, sparkle icon + text |
| `AiInsightCard` component | Small (2-3 hours) | Slightly richer layout, optional pill/dot children |
| Per-step insight logic | Medium (4-6 hours) | 8 steps need condition-matching logic; most is simple regex or session field checks |
| Client-side keyword matchers | Small (1-2 hours) | Reuse patterns from `/api/ai/analyze` fallback `getFallbackResult()` |
| **Total** | **~8-13 hours** | Spread across 2 components + 8 step integrations |

### Risks:

| Risk | Mitigation |
|------|-----------|
| Insight copy feels generic or wrong | Use conservative matching — show "Your audience shapes every page" (always true) rather than a wrong industry guess |
| Visual clutter in minimal-design steps | AiInsightChip is intentionally subtle (white/50 text, 28px height). User testing should validate. |
| Stale session data shows outdated insight | Insights re-derive on every `resume()` call, which fires on step mount. Data is always current. |
| Client-side regex mismatches AI analysis | Regex patterns are a subset of the server-side fallback. Mismatches are possible but low-stakes — the chip is a hint, not a promise. |

---

## 7. Summary & Recommendation

The strongest pattern for our onboarding is **Derived Insight (P5)** — showing users what the AI *learned* from their inputs as they move through steps. This builds trust incrementally: by the time users reach the pages step, they have seen the AI acknowledge their name, idea, and audience. When the AI then suggests 7 tailored pages, the suggestion feels earned rather than arbitrary.

**Recommended approach:**
1. Build `AiInsightChip` and `AiInsightCard` as two reusable components.
2. Add insight logic to 8 of 11 steps (skip start, follow-up, review-settings).
3. Use the copy templates above as a starting point, refined during implementation.
4. All data from existing session state — zero new API endpoints.
