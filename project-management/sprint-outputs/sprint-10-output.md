# Sprint 10 Output: Enhanced Onboarding Wizard

**Sprint:** Sprint 10 — Enhanced Onboarding Wizard
**Milestone:** M6 — Onboarding Enrichment
**Status:** Complete

## Delivered Tasks

### TASK-200: Industry Questions Configuration
**Status:** Complete
**Files:**
- `platform-app/src/lib/onboarding/industry-questions.ts` (new)

**What was built:**
- `IndustryQuestion` interface with support for `text`, `select`, and `multi-select` input types
- `INDUSTRY_QUESTIONS` config covering 8 industries + `_default` fallback:
  - healthcare (4 questions), legal (3), restaurant (4), real_estate (3), professional_services (3), education (3), ecommerce (3), nonprofit (3), _default (3)
- `getQuestionsForIndustry()` function with fallback to `_default`

---

### TASK-201: Follow-up Questions Onboarding Step
**Status:** Complete
**Files:**
- `platform-app/src/app/onboarding/follow-up/page.tsx` (new)
- `platform-app/src/lib/onboarding-steps.ts` (modified — added follow-up step)
- `platform-app/src/app/onboarding/fonts/page.tsx` (modified — navigates to follow-up)

**What was built:**
- New onboarding step that renders industry-specific questions dynamically
- Supports text inputs, single-select buttons, and multi-select toggles
- Reads detected industry from session data
- Saves answers to `followUpAnswers` in onboarding session
- Navigation: fonts → follow-up → tone

---

### TASK-202: Tone Selection & Differentiators Step
**Status:** Complete
**Files:**
- `platform-app/src/app/onboarding/tone/page.tsx` (new)
- `platform-app/src/lib/onboarding/tone-samples.ts` (new)

**What was built:**
- 4 tone samples as selectable radio-style cards with preview text:
  Professional, Warm & Friendly, Bold & Confident, Casual
- Differentiators text input with industry-specific placeholder
- Collapsible "Advanced options" section with:
  - Reference URLs (up to 3)
  - Existing copy textarea (max 2,000 chars with counter)
- This step triggers blueprint generation (moved from fonts step)
- Saves `tone`, `differentiators`, `referenceUrls`, `existingCopy` to session

---

### TASK-203: Enhanced Page Suggestions API
**Status:** Complete
**Files:**
- `platform-app/src/app/api/ai/suggest-pages/route.ts` (modified)
- `platform-app/src/lib/ai/prompts.ts` (modified)
- `platform-app/src/app/onboarding/pages/page.tsx` (modified)

**What was built:**
- Updated `SUGGEST_PAGES_PROMPT` to request `description` field in response
- Updated `PageSuggestion` interface to include `description: string`
- Updated all `INDUSTRY_DEFAULT_PAGES` entries with descriptive text
- API now returns `{ slug, title, description, required }[]`
- Pages step UI shows both title and description for each page

---

### TASK-204: Custom Page Addition UI
**Status:** Complete
**Files:**
- `platform-app/src/app/onboarding/pages/page.tsx` (modified)

**What was built:**
- "Add Custom Page" button with purple accent styling
- Inline form with title input + description textarea
- Max 3 custom pages enforced with message when limit reached
- Custom pages visually distinguished with purple border + "Custom" badge
- Custom page data saved alongside AI suggestions in session
- Page cards redesigned from chips to list items with descriptions

---

## Updated Onboarding Flow (10 steps)

1. Welcome → 2. Project Name → 3. Big Idea → 4. Audience → 5. Page Map → 6. Design Source → 7. Brand → 8. Fonts → **9. Details (follow-up)** → **10. Tone & Voice** → Generate

## Notes
- TypeScript compilation passes with zero errors
- All v2 session fields (`followUpAnswers`, `differentiators`, `referenceUrls`, `existingCopy`) from TASK-205 are now populated by the new steps
- Blueprint generation trigger moved from fonts step to tone step (final step)
- ProgressDots component auto-adapts to 10 steps (reads from ONBOARDING_STEPS)
