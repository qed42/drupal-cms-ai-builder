# TASK-230: Blueprint-to-Markdown Renderer

**Story:** US-046
**Priority:** P0
**Estimated Effort:** M
**Milestone:** M8 — Content Review & Editing

## Description
Create a utility that transforms blueprint JSON page data into human-readable markdown for the review page. Maps component IDs to friendly labels and extracts text content from component props.

## Technical Approach
- Create `platform-app/src/lib/blueprint/markdown-renderer.ts`
- Define `COMPONENT_LABELS` map: component_id → friendly name (e.g., "space_ds:space-hero-banner-style-01" → "Hero Banner")
- `blueprintPageToMarkdown(page: PageLayout): string` — renders each section with component label, title, subtitle, description, list items
- Handle different component types: hero (title + subtitle), text-media (title + description), card-grid (multiple cards), CTA (title + button text), form (field list)
- Handle content items (services, team members, testimonials) rendered within component props

## Acceptance Criteria
- [ ] All current Space DS components have friendly labels
- [ ] Text content is extracted from component props correctly
- [ ] Output is readable markdown with section headings and component type labels
- [ ] Lists and multi-item components render correctly
- [ ] Form fields render as a field list preview

## Dependencies
- None

## Files/Modules Affected
- `platform-app/src/lib/blueprint/markdown-renderer.ts` (new)
