# Architecture: Onboarding UX Polish — Conversational Labels, Archie Branding & AI Transparency

**Status**: Approved
**Date**: 2026-03-26
**Scope**: M20 continuation — onboarding copy overhaul, AI persona introduction, InferenceCard expansion
**Predecessor**: Sprint 38 (M21 Content Quality Hardening — DONE), M20 AI Transparency features (F1-F5)

---

## 1. Problem Statement

The onboarding journey's 12 steps use mechanical, form-like labels ("Choose Your Theme", "Continue") that don't guide users or communicate how their input quality affects output quality. Three specific gaps:

1. **Labels are transactional, not conversational** — headings like "Select a font" feel like a configuration wizard, not an AI collaboration
2. **AI is anonymous** — the system says "AI understood" but has no personality or name, making it feel impersonal
3. **Transparency is inconsistent** — 3 of 12 steps show InferenceCards (idea, audience, tone), but steps where AI also processes input (pages, brand, fonts) show nothing

### Current State Audit

| Step | Heading | Button | InferenceCard | AI Transparency |
|------|---------|--------|---------------|-----------------|
| start | "Your website, designed and built by AI." | "Start Building" | No | Minimal |
| theme | "Choose Your Theme" | "Continue" | No | None |
| name | "What are we calling this?" | "Continue" | No | None |
| idea | "What's the big idea?" | "Your Audience" | **Yes** | Good — shows industry, services, compliance |
| audience | "Who is this for?" | "Plan the Structure" | **Yes** | Good — shows pain points |
| pages | "Let's map your site." | "Shape the Experience" | No | Loading message only |
| design | "How should it feel?" | "Shape the Experience" | No | None |
| brand | "Give it a face." | "Pick Your Fonts" | No | Loading message during color extraction |
| fonts | "Select a font" | "Continue" | No | None |
| follow-up | "Tell us more about your business" | "Continue" | No | Brief purpose text |
| tone | "Set your brand voice" | "Review & Generate" | **Yes** | Good — shows tone + example |
| review-settings | "Ready to generate?" | "Generate My Website" | No | Full input summary + strategy |

---

## 2. Architecture Assessment

### What changes and what doesn't

**NO structural UI changes needed.** The existing component architecture handles everything:

- `StepLayout` already supports `title`, `subtitle`, `buttonLabel`, `insightSlot` props
- `InferenceCard` already supports `title`, `items`, `explanation`, `editLabel` props
- `ONBOARDING_STEPS` and `STEP_SECTIONS` in `onboarding-steps.ts` already drive nav labels and sections
- Progress stepper already reads section names from `STEP_SECTIONS`

**What changes:**
1. String constants in `onboarding-steps.ts` (labels, section names)
2. Props passed to `StepLayout` in each step's `page.tsx` (title, subtitle, buttonLabel)
3. InferenceCard `title` prop changed from "AI understood" to "Archie understood"
4. New InferenceCards added to 3 step pages (pages, brand, fonts)
5. New API data needed for fonts/brand InferenceCards (minor)

### ADR-1: Named AI Persona vs. Generic "AI"

| Option | Pros | Cons |
|--------|------|------|
| **A. Named persona "Archie"** | Conversational, memorable, builds relationship, consistent reference point | Anthropomorphization risk; harder to change later |
| **B. Keep generic "AI"** | Neutral, accurate, no naming debates | Impersonal; every AI tool says "AI" — no differentiation |
| **C. "Your AI Architect"** | Descriptive, professional | Wordy; doesn't work in short contexts ("Your AI Architect understood") |

**Decision**: **Option A — "Archie" (short for "Architect")**

**Rationale**: The product's differentiator is that an AI *architect* designs your site, not just fills in templates. A short, friendly name makes copy more natural: "Archie understood" > "AI understood", "Give Archie more detail" > "Provide more detail for better results". The name appears only in UI copy — no technical coupling. If we want to change it later, it's a find-and-replace across ~15 string literals.

### ADR-2: InferenceCard Expansion Strategy — Real Data vs. Static Explanations

For the 3 new InferenceCard steps (pages, brand, fonts), the AI already processes input but doesn't return structured inference data suitable for cards.

| Option | Pros | Cons |
|--------|------|------|
| **A. Dynamic InferenceCards with real API data** | Consistent with idea/audience/tone; shows real AI reasoning | Needs API changes for brand/fonts; more work |
| **B. Static "how this shapes your site" explanation cards** | Zero API changes; fast to ship | Less impressive; doesn't show what AI actually understood |
| **C. Hybrid — dynamic where data exists, static where it doesn't** | Best of both; pragmatic | Inconsistent card behavior across steps |

**Decision**: **Option C — Hybrid approach**

**Rationale**:
- **Pages step**: Already has dynamic page suggestions from AI. Show "Archie planned {N} pages: [list]" — data already available.
- **Brand step**: Color extraction already returns hex values. Show "Archie extracted: [color swatches] from your upload" — data already available.
- **Fonts step**: No AI processing here (user picks from a list). Use static explanation: "Your font pairing shapes all headings and body text across your site."

This matches the existing pattern: InferenceCards appear where AI does work, static explanations appear where the user makes a direct choice.

### ADR-3: Button Label Strategy — Contextual vs. Uniform

| Option | Pros | Cons |
|--------|------|------|
| **A. All buttons say "Continue"** | Simple; predictable | Generic; no navigation preview |
| **B. All buttons say "Next: [Step Name]"** | Clear where you're going | Verbose; breaks rhythm |
| **C. Mix — contextual where it aids understanding, "Continue" for obvious flow** | Natural; conversational | Inconsistent (but intentionally so) |

**Decision**: **Option C — Contextual mix**

**Rationale**: The current codebase already uses a mix (some say "Continue", some say "Your Audience", "Pick Your Fonts"). We formalize this: use "Next: [Section]" at section boundaries (where the progress stepper changes), use action verbs within sections. This gives users orientation without being verbose.

---

## 3. Proposed Label Mapping

### Section Names (Progress Stepper)

| Current | Proposed |
|---------|----------|
| Vision | Your Business |
| Design | Site Structure |
| Content | Brand & Style |
| Launch | Review & Build |

### Step Labels, Headings, Subtitles, and Buttons

| Step | Current Label | New Label | New Heading | New Subtitle | New Button |
|------|--------------|-----------|-------------|--------------|------------|
| start | Welcome | Get Started | "Let's build your website together" | "Tell Archie about your business — the more detail you share, the better your site." | "Let's Go" |
| theme | Theme | Theme | "Pick a design foundation" | "Each theme has a distinct visual style. Archie will customize it with your brand." | "Continue" |
| name | Project Name | Your Name | "What's your business called?" | "This becomes your site title and appears in search results." | "Continue" |
| idea | Big Idea | Your Idea | "Tell us about your business" | "Describe what you do, who you serve, and what makes you different. The more detail, the better Archie can tailor your content." | "Next: Your Audience" |
| audience | Audience | Audience | "Who are your customers?" | "Help Archie understand who'll visit your site — their needs drive your messaging." | "Next: Site Structure" |
| pages | Page Map | Pages | "Here's your site plan" | "Archie mapped these pages based on your business. Add, remove, or rename as you like." | "Continue" |
| design | Design Source | Design | "How should it feel?" | "Upload a design reference or let Archie style it based on your brand." | "Continue" |
| brand | Brand | Brand | "Show us your brand" | "Drop your logo or brand kit — Archie will extract your colors automatically." | "Next: Brand & Style" |
| fonts | Fonts | Fonts | "Choose your typography" | "Your font pairing sets the tone. Archie applies it to all headings and body text." | "Continue" |
| follow-up | Details | Details | "Help Archie write better content" | "These details go directly into your page copy — specific answers make specific content." | "Continue" |
| tone | Tone & Voice | Voice | "Set your brand voice" | "Choose how your site talks to visitors. Archie uses this across every page." | "Next: Review & Build" |
| review-settings | Review & Generate | Review | "Review and launch" | "Here's everything Archie will use to build your site. Make any final changes." | "Generate My Website" |

### InferenceCard Title Change

All existing InferenceCards change `title` from `"AI understood"` to `"Archie understood"`.

---

## 4. New InferenceCards

### Pages Step — Dynamic

```typescript
// Triggered after page suggestions load (data already available)
<InferenceCard
  title="Archie planned your site"
  items={[
    { label: "Pages", value: `${pages.length} pages`, type: "text" },
    { label: "Structure", value: pages.map(p => p.title), type: "list" },
  ]}
  explanation="This structure is based on your industry and what similar businesses need. You can add or remove pages above."
  editLabel="Edit pages above"
/>
```

### Brand Step — Dynamic

```typescript
// Triggered after color extraction completes (data already available)
<InferenceCard
  title="Archie extracted your brand"
  items={[
    { label: "Primary color", value: primaryColor, type: "text" },
    { label: "Palette", value: `${colors.length} colors extracted`, type: "text" },
  ]}
  explanation="These colors will be applied to buttons, headings, and backgrounds across your site."
  editLabel="Adjust colors above"
/>
```

### Fonts Step — Static Explanation

```typescript
// No AI inference here — static explanation card
<InferenceCard
  title="How Archie uses your fonts"
  items={[
    { label: "Headings", value: selectedHeading || "Not yet selected", type: "text" },
    { label: "Body text", value: selectedBody || "Not yet selected", type: "text" },
  ]}
  explanation="Your heading font appears in hero sections and page titles. Body font is used for paragraphs and descriptions."
  editLabel="Change selection"
/>
```

---

## 5. Input Quality Feedback

Three steps benefit from real-time quality feedback (before InferenceCard appears):

### Follow-up Step
Currently shows "These details help us generate content that's specific to what you do."

Add per-field quality indicators:
- Empty: `"Archie needs this to write your [field] page"`
- Short (<20 chars): `"A bit more detail helps Archie write specific content"`
- Good (>50 chars): `"Great — Archie has plenty to work with"`

### Audience Step
Already has character count. Add quality tier:
- < 30 chars: `"Give Archie more detail — who exactly are your customers?"`
- 30-80 chars: `"Good start. Adding age range, location, or pain points helps."`
- > 80 chars: `"Excellent. Archie can really target your messaging now."`

### Idea Step
Already has validation. Ensure messages use "Archie":
- Current: `"Add a bit more detail for better results"` → `"Give Archie more detail for a better site"`
- Current: `"Looks great!"` → `"Archie has plenty to work with"`

---

## 6. Implementation Complexity

| Change Type | Count | Effort |
|------------|-------|--------|
| String constant changes (`onboarding-steps.ts`) | 1 file | XS |
| Heading/subtitle/button changes (12 step pages) | 12 files | S each |
| InferenceCard title change ("Archie understood") | 3 files | XS each |
| New InferenceCard on pages step | 1 file | S |
| New InferenceCard on brand step | 1 file | S |
| New InferenceCard on fonts step | 1 file | S |
| Input quality feedback (idea, audience, follow-up) | 3 files | S each |
| **Total** | **~15 files** | **M overall** |

No new APIs, no new components, no schema changes. This is a copy + prop change sprint.

---

## 7. Interaction with User Images Architecture

The `architecture-user-images.md` defines a new "images" step inserted between fonts and follow-up. When that milestone ships:

1. The images step should use the Archie-branded conversational style from day one
2. Heading: "Add your own photos" / Subtitle: "Drop your product shots, team photos, or office images. Archie will match them to the right sections — or use professional stock photos."
3. Button: "Continue"
4. InferenceCard after analysis: "Archie analyzed your photos" with items showing descriptions and match suggestions
5. The step should slot into the "Brand & Style" section (new name for "Content")

**No code coupling** — the UX polish sprint modifies existing steps only. The images step is a separate milestone that inherits the established patterns.

---

## 8. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| "Archie" name doesn't resonate | Low — easy to find-and-replace | All Archie references are string literals, no technical coupling |
| Conversational headings are ambiguous | Medium — users might not know what to do | Subtitles are more explicit; buttons preview next step |
| New InferenceCards slow down steps | Low — pages/brand already load data | Cards use existing data, no new API calls |
| Copy changes break i18n or tests | Low — project is English-only | Grep for old strings in tests before shipping |

---

## 9. Handoff

This architecture is ready for sprint planning. Key points for `/tpm`:

1. **All changes are string/prop edits** — no new APIs, no schema changes, no new components
2. **12 step page files + 1 config file** are the scope — parallelizable
3. **3 new InferenceCards** need data wiring but use existing component
4. **Input quality feedback** on 3 steps is the most nuanced work
5. **Recommend a single sprint** — this is cohesive UX work that should ship together, not incrementally
6. **User images (M22)** is a separate, larger initiative that follows after
