# UX Expectations: Modern SaaS Design Standards

**Author:** Product Owner
**Date:** 2026-03-19
**Status:** Draft — Pending TPM Review
**Trigger:** External review flagged the application as having an "AI-generated tool" aesthetic. This document sets the UX quality bar the product must meet before any public-facing release.

---

## 1. Executive Summary

The current platform UI is functional but does not meet the design quality bar expected of a modern SaaS product. An outside observer immediately perceives it as an AI-scaffolded demo rather than a polished, trustworthy product.

**The gap:** Users who arrive at our onboarding flow should feel like they've landed on a premium website builder — something in the same league as Squarespace, Framer, or Webflow. Today, they land on a dark screen with purple gradients and no product identity. This directly undermines trust and conversion.

**The expectation:** Every screen a user touches — from registration to dashboard — must communicate: *"A real team built this. They care about design. I can trust them to build my website."*

---

## 2. Current State Diagnosis

### Why the Application Feels AI-Generated

The following patterns are now strongly associated with AI code generation output and generic template scaffolding. Their presence signals "no designer touched this":

| Pattern | Where It Appears | Why It's a Problem |
|---------|------------------|--------------------|
| Deep navy gradient background (`#0a0a2e`) | Every screen — auth, onboarding, dashboard | Single-tone dark backgrounds with no variation between contexts is the #1 AI scaffold signature |
| Indigo/purple accent color | All buttons, focus states, gradients, badges | Indigo+purple is the default "AI tool" palette. Every AI product from 2023-2025 uses it |
| Default Next.js font (Geist) | All text | Signals "this was `npx create-next-app`, not designed" |
| No product logo or brand mark | Auth pages, onboarding header, dashboard | Zero visual identity. Users can't even name the product from the UI |
| Same pulsing bars animation on every step | All 10 onboarding steps | A generic equalizer animation repeated as the only visual element |
| Opacity-only text hierarchy (`white/60`, `white/50`, `white/30`) | All screens | Technically correct but creates a washed-out, low-contrast feel |
| `rounded-2xl bg-white/5 border border-white/10` on every card | Dashboard, onboarding | One card style for everything = visual monotony |
| No illustrations, icons, or imagery | Entire application | Zero visual assets. Just text and colored rectangles in a void |
| Technical jargon in user-facing UI | Pipeline progress ("Research → Plan → Generate") | Internal architecture leaked into the UX |

---

## 3. Screen-by-Screen Expectations

### 3.1 Authentication (Login & Register)

**Current state:** A centered card with email/password fields on a dark gradient. No logo, no social login, no visual identity.

**Expectations:**

| # | Acceptance Criterion | Priority |
|---|----------------------|----------|
| AUTH-1 | Product logo/wordmark is visible above or within the auth form | P0 |
| AUTH-2 | A value proposition panel (illustration, screenshot, or benefit statement) accompanies the form. Industry pattern: split layout with visual on left, form on right | P0 |
| AUTH-3 | "Continue with Google" social login is available as the primary auth method | P1 |
| AUTH-4 | The auth screen is visually distinct from the onboarding flow (different background treatment, not the same dark gradient) | P1 |
| AUTH-5 | Password field shows strength indicator and requirements inline (not just as a disappearing placeholder) | P2 |
| AUTH-6 | "Forgot password" link is present on the login form | P2 |
| AUTH-7 | Register page communicates what the user will get — not generic "Start building in minutes" but specific value: "AI builds your Drupal website in under 5 minutes" | P1 |

### 3.2 Onboarding Wizard

**Current state:** 10 identical-looking steps. Each has: pulsing bars → title → subtitle → input → pill button → tiny dots. No visual progression, no step labeling, no illustrations.

**Expectations:**

| # | Acceptance Criterion | Priority |
|---|----------------------|----------|
| ONB-1 | Each onboarding step has a unique visual element (icon, illustration, or graphic) relevant to that step's topic. The generic pulsing bars animation is removed | P0 |
| ONB-2 | A visible, labeled step indicator shows progress — e.g., "Step 3 of 10 — Your Audience" or a segmented progress bar with step names | P0 |
| ONB-3 | Steps that accept optional input have a visible "Skip" option or "Optional" label — users should not wonder if the Continue button is broken | P1 |
| ONB-4 | Text input steps include contextual examples or inspiration (e.g., "Your Audience" shows: *"Example: Small business owners in Portland looking for affordable legal help"*) | P1 |
| ONB-5 | The layout varies by step type: text input steps are compact and centered; selection steps (Pages, Design, Tone) use wider layouts with visual cards; upload steps (Brand) show prominent drop zones with file type guidance | P1 |
| ONB-6 | Page transitions between steps use subtle animation (slide, fade, or morph) rather than hard navigation cuts | P2 |
| ONB-7 | The start page communicates a clear value proposition with visual impact — not just "Let's shape your big idea" but a hero section that sells the outcome | P0 |
| ONB-8 | Button labels follow a consistent pattern: all action-oriented verbs ("Define Your Audience", "Choose Your Pages", "Set Your Tone") — not a mix of nouns and verbs | P2 |

### 3.3 Review Step (New — Does Not Currently Exist)

**Current state:** Users go directly from "Tone" to "Generation Progress" with no review.

**Expectations:**

| # | Acceptance Criterion | Priority |
|---|----------------------|----------|
| REV-1 | A summary/review step exists between the last input step and generation, showing everything the user has configured: site name, business idea, audience, selected pages, colors, fonts, tone | P0 |
| REV-2 | Each section in the review is editable — clicking "Edit" on a section returns the user to that specific step | P1 |
| REV-3 | The review step sets time expectations: "This will take approximately 2-3 minutes" | P1 |
| REV-4 | A prominent "Generate My Website" CTA button triggers generation — this is the moment of commitment and should feel significant | P0 |

### 3.4 Generation Progress

**Current state:** Shows "Research → Plan → Generate" pipeline phases with technical labels and a progress bar.

**Expectations:**

| # | Acceptance Criterion | Priority |
|---|----------------------|----------|
| GEN-1 | Phase labels use user-meaningful language, not internal pipeline names. Expected: "Analyzing your business" → "Designing your pages" → "Writing your content" (or similar) | P0 |
| GEN-2 | Contextual messages update during generation to show specific work: "Learning about dental practices in Portland...", "Designing your About page...", "Writing homepage content..." | P1 |
| GEN-3 | Estimated time remaining is shown ("About 1 minute left") | P2 |
| GEN-4 | The completion state includes a visual preview or summary of what was generated (page count, content stats, design preview) — not just a green checkmark and "Your website is ready!" | P0 |
| GEN-5 | Completion includes a celebration moment — animation, confetti, or visual flourish that marks the achievement | P2 |
| GEN-6 | Error states explain what happened in plain language and whether user data is safe: "We hit a snag generating your content, but all your settings are saved. You can try again." | P1 |

### 3.5 Dashboard

**Current state:** Heading + flat site card + subscription badge. No visual richness, no navigation, developer-facing "Download Blueprint JSON" button.

**Expectations:**

| # | Acceptance Criterion | Priority |
|---|----------------------|----------|
| DASH-1 | Each site card shows a visual preview — either a real screenshot/thumbnail of the generated site, or a stylized placeholder using the site's colors and fonts | P0 |
| DASH-2 | The dashboard has a navigation structure (sidebar or top nav) with access to: Sites, Settings, Billing, Help/Support | P1 |
| DASH-3 | First-time users see a welcome state with guidance: "Your first site is being set up. Here's what happens next..." | P1 |
| DASH-4 | Developer/debug actions ("Download Blueprint JSON") are hidden behind a "..." overflow menu, not shown as primary actions | P1 |
| DASH-5 | Site cards show key metrics or last-edited date to give the dashboard a sense of activity | P2 |
| DASH-6 | The subscription/trial status communicates value: what the user gets, what the limits are, when the trial expires, and what upgrading unlocks — not just "Free Trial / Active" | P1 |
| DASH-7 | The "Add new website" action is visually prominent and inviting, not just a text button | P2 |

---

## 4. Design System Expectations

These are cross-cutting requirements that apply to all screens.

| # | Acceptance Criterion | Priority |
|---|----------------------|----------|
| DS-1 | The product has a defined color palette that is NOT indigo/purple as the primary accent. Acceptable alternatives: teal, coral, warm orange, forest green — anything that breaks the "AI tool" association | P0 |
| DS-2 | A product logo/wordmark is displayed in the header or navigation of every authenticated screen | P0 |
| DS-3 | The default font is not Geist (the Next.js default). A deliberately chosen typeface that reflects the product personality is used | P1 |
| DS-4 | Light mode is supported as the default. Dark mode is available as an option. Website builders should default to light — it's closer to what users' actual sites look like | P1 |
| DS-5 | A component library (shadcn/ui or equivalent) provides consistent styling for all buttons, inputs, cards, badges, and dialogs | P1 |
| DS-6 | Illustration assets exist for: onboarding steps, empty states, success states, and error states. These can be simple line art or abstract shapes — they do not need to be complex | P1 |
| DS-7 | All interactive elements have visible focus states, hover states, and disabled states that are distinct from each other | P2 |
| DS-8 | Form validation errors appear inline next to the relevant field with clear language, not just a disabled button | P1 |
| DS-9 | Success feedback (toasts or inline messages) confirms actions like "Settings saved" or "Logo uploaded" | P2 |
| DS-10 | The favicon and browser tab title reflect the product brand, not Next.js defaults | P2 |

---

## 5. Competitive Benchmark

The product's UX should be evaluated against these benchmarks. We don't need to match their budgets, but we need to match their *intentionality*.

| Dimension | Minimum Bar (must match) | Stretch Goal |
|-----------|--------------------------|--------------|
| **Product identity** | Visible logo + custom color palette + custom font on every screen | Cohesive brand language with illustration style |
| **Onboarding personality** | Each step visually distinct with relevant icon/illustration | Interactive previews that update as users make choices |
| **Progress feedback** | User-meaningful labels + contextual messages during generation | Live preview building progressively |
| **Dashboard** | Site cards with visual preview + navigation | Activity feed, analytics, team collaboration |
| **Design consistency** | Component library + design tokens + light mode | Full design system with documentation |
| **Trust signals** | Professional look and feel, no technical jargon | Testimonials, security badges, uptime status |

**Reference products:** Squarespace, Framer, Webflow, Wix ADI, Durable.co, 10Web

---

## 6. Implementation Priority

### Phase 1: Identity Crisis Fix (P0 items)
*Eliminates the "AI generated" perception*

- Product logo and brand identity (DS-1, DS-2)
- Auth screen redesign with value proposition (AUTH-1, AUTH-2, AUTH-7)
- Step-specific onboarding visuals (ONB-1, ONB-2, ONB-7)
- Review step before generation (REV-1, REV-4)
- User-friendly generation labels (GEN-1, GEN-4)
- Dashboard site previews (DASH-1)

**Definition of Done:** An outside observer shown the app for 5 seconds can name the product, describe what it does, and does NOT describe it as "an AI tool" or "a template."

### Phase 2: Trust & Delight (P1 items)
*Makes the product feel professional and trustworthy*

- Social login, distinct auth styling (AUTH-3, AUTH-4)
- Onboarding helper text, skip options, layout variation (ONB-3, ONB-4, ONB-5)
- Review step editing, time estimates (REV-2, REV-3)
- Generation contextual messages, error clarity (GEN-2, GEN-6)
- Dashboard navigation, welcome state, subscription clarity (DASH-2, DASH-3, DASH-4, DASH-6)
- Light mode, component library, illustrations, validation (DS-3, DS-4, DS-5, DS-6, DS-8)

**Definition of Done:** A user can complete the full journey (register → onboard → generate → dashboard) and rate the experience 7+ out of 10 for trustworthiness and design quality.

### Phase 3: Polish (P2 items)
*Elevates from good to great*

- Password strength, forgot password (AUTH-5, AUTH-6)
- Step transitions, button label consistency (ONB-6, ONB-8)
- Time estimates, celebrations (GEN-3, GEN-5)
- Dashboard metrics, activity, add-site CTA (DASH-5, DASH-7)
- Focus states, success toasts, favicon (DS-7, DS-9, DS-10)

**Definition of Done:** The product passes a heuristic evaluation against Nielsen's 10 usability heuristics with no critical findings.

---

## 7. Handoff

- **Next action:** `/tpm` to break Phase 1 into user stories and plan a sprint
- **Architecture input needed:** `/architect` for social login integration (AUTH-3) and light/dark mode theming approach (DS-4)
- **Design assets needed:** Logo, illustrations, color palette — either designed externally or generated with clear creative direction (not default AI output)
- **Development:** `/dev` can begin with DS-1 (color palette swap) and DS-2 (logo placement) as quick wins while larger stories are planned
