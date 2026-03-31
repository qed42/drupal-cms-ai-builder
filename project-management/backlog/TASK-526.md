# TASK-526: Add Content Hydration phase to pipeline

**Story:** BUG-057, US-120
**Priority:** P0
**Estimate:** XL
**Status:** To Do

## Description

Code components currently have generic placeholder content making sites look like wireframes. The ContentPlan has rich, context-specific content (services, testimonials, headings, descriptions) but it's only stored in `_meta.contentBrief` — never mapped to actual code component prop values.

**Current prop fallback chain** (generate-code-components.ts:237-249):
```
AI default → description text → prop name
```

Example: A features section heading prop gets `"Section heading"` (the description), not `"Why Choose Our Restaurant"` (the actual content from the plan).

### Solution: Add a Hydrate phase between Generate and Enhance

```
Research → Plan → Generate → **Hydrate** → Enhance → Provision
```

The Hydrate phase uses AI to populate code component props with real, contextual content derived from the ContentPlan, ResearchBrief, and OnboardingData.

### Deliverables

1. **`platform-app/src/lib/pipeline/phases/hydrate.ts`** — New phase:

   For each page section in the blueprint:
   a. Collect context: `planSection.contentBrief`, `planSection.heading`, `plan.globalContent` (services, testimonials, teamMembers), `research.keyMessages`, `data.name`
   b. Build a content mapping prompt that includes:
      - The section's prop schema (names, types, descriptions)
      - The content brief for this section
      - The relevant global content (services for features sections, testimonials for testimonial sections, etc.)
      - The business name, industry, audience, and tone
   c. Call AI to generate prop values that match the content plan:
      - String props get real headlines, descriptions, button text
      - formatted_text props get short HTML paragraphs
      - list:text props get real list items
      - image props get descriptive alt text (URLs stay as placeholders — Enhance handles those)
      - link props get contextual paths (e.g., `/contact`, `/services`)
   d. Update `section.props` with hydrated values
   e. Update the YAML config `examples` block with hydrated values

2. **Smart content mapping** (before AI call, try direct mapping):
   - `planSection.heading` → props named `heading`, `title`, `sectionTitle`
   - `plan.globalContent.services[i]` → feature/service card props (title, description)
   - `plan.globalContent.testimonials[i]` → testimonial props (quote, author, role)
   - `plan.globalContent.teamMembers[i]` → team member props (name, role)
   - `data.name` → props named `brandName`, `companyName`, `siteName`
   - `plan.tagline` → props named `tagline`, `subtitle`, `subheading` (on hero)
   - `data.phone`, `data.email`, `data.address` → contact section props

   Only call AI for remaining unresolved props.

3. **`platform-app/src/lib/pipeline/phases/hydrate.test.ts`** — Tests:
   - Direct mapping: heading prop gets planSection.heading
   - Direct mapping: service card props get globalContent.services
   - Direct mapping: testimonial props get globalContent.testimonials
   - AI fallback: unresolved props are populated by AI call
   - Image props: alt text populated, URL left as placeholder
   - link props: get contextual page paths, not example.com

4. **Pipeline integration** (`orchestrator.ts`):
   - Add `hydrate` / `hydrate_complete` / `hydrate_failed` phases
   - Call `runHydratePhase()` after Generate, before Enhance
   - Emit progress messages: "Populating your {industry} content..."
   - Non-fatal: if hydration fails, fall back to current generic defaults

## Dependencies

- TASK-525 (image prop format fix — should be done first)

## Acceptance Criteria

- [ ] Code component props contain real, context-specific content (not descriptions)
- [ ] Hero heading matches the content plan section heading
- [ ] Feature/service sections use actual service names and descriptions from the plan
- [ ] Testimonial sections use actual quotes, authors, and roles from the plan
- [ ] Team sections use actual member names and roles from the plan
- [ ] CTA text is contextual (not "Get Started" for every site)
- [ ] Contact sections include business name, industry-appropriate text
- [ ] Generated sites look like real websites, not wireframes
- [ ] Pipeline works end-to-end with the new phase
- [ ] Hydrate failure is non-fatal (falls back to current behavior)
- [ ] Tests pass
