# TASK-316: Update AI generation prompts for compositional component model

**Story:** Space DS v2 Migration
**Priority:** P0
**Estimated Effort:** L
**Milestone:** Space DS v2 Migration

## Description

AI generation prompts reference old component IDs and assume a "pick an organism" model. The new compositional model requires prompts that teach the AI to:
1. Choose section patterns (text-image split, features grid, testimonials carousel, etc.)
2. Specify flexi layout column widths for each section
3. Generate content for individual atoms (heading, text, image, button) placed in slots
4. Handle section heading components as section intros

## Technical Approach

### 1. Update page-layout prompt
- Replace organism component IDs with composition pattern names
- Add flexi column width guidance per section type
- Add section heading guidance (when to use, alignment choices)

### 2. Update content generation prompt
- Content now maps to individual atoms, not organism props
- Generate: heading text, paragraph HTML, button text+url, image descriptions
- Remove references to `wordCountRange` on organisms (content is distributed across atoms)

### 3. Update form generation prompt
- Contact forms can't use Space DS form atoms (removed from theme)
- Two options: (a) Use Drupal Webform module, (b) Use `space-contact-card` for contact info display
- `space-contact-card` provides email, phone, FAQ link — may be sufficient for MVP contact pages

### 4. Add new section pattern library to prompts
Document composition patterns the AI can choose from:
- `text-image-split-50-50`: section-heading + flexi(50-50) with text+button / image
- `text-image-split-66-33`: wider text, narrower image
- `image-text-split-33-66`: image first (reversed)
- `features-grid-3col`: section-heading + flexi(33-33-33) with icon+heading+text per column
- `features-grid-4col`: section-heading + flexi(25-25-25-25)
- `stats-row`: flexi(25-25-25-25) with stats-kpi components
- `testimonials-carousel`: section-heading + slider with testimony-cards
- `team-grid`: section-heading + flexi(25-25-25-25) with user-cards
- `card-grid-3col`: section-heading + flexi(33-33-33) with imagecards
- `contact-cards`: flexi(33-33-33) with contact-cards
- `faq-accordion`: section-heading + accordion with accordion-items
- `logo-showcase`: logo-section with heading + images
- `blog-listing`: section-heading + flexi(33-33-33) or slider with imagecards (date, category, read_time)

### 5. Update container background guidance
AI should alternate backgrounds for visual rhythm:
- Content sections: alternate `transparent` ↔ `option-1` or `option-2`
- CTA: use `base-brand` or `black` for contrast
- Dark sections: use `black` with light text

## Acceptance Criteria

- [ ] Page layout prompt generates composition patterns, not flat organism IDs
- [ ] Content generation prompt produces content for individual atoms
- [ ] Section patterns cover all major page section types
- [ ] No references to deleted components in any prompt
- [ ] Generated content maps cleanly to component-tree-builder input
- [ ] Contact page handling documented (contact-card vs. form)

## Dependencies
- TASK-312 (manifest — component IDs)
- TASK-313 (page design rules — section types)

## Files/Modules Affected
- `platform-app/src/lib/ai/prompts/page-layout.ts`
- `platform-app/src/lib/ai/prompts/content-generation.ts` (or equivalent)
- `platform-app/src/lib/ai/prompts/form-generation.ts` (review/update)
