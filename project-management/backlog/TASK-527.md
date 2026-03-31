# TASK-527: Update code component generation prompt for content-aware defaults

**Story:** BUG-057
**Priority:** P1
**Estimate:** M
**Status:** To Do

## Description

The code component generation prompt should instruct the AI to generate more content-aware default values instead of generic placeholders. Currently the AI often sets `default: null` for content props, which causes the generate phase to fall back to description text.

### Changes

1. **Update prompt instructions** (`code-component-generation.ts`):
   - Add explicit instruction: "For content props (headings, descriptions, button text), generate defaults that match the content brief — not generic text like 'Section Title' or 'Description here'"
   - Add instruction: "Use the content brief, heading, and tone to craft realistic default values"
   - Add instruction: "For CTA buttons, use action-oriented text relevant to the section type and industry"

2. **Enrich the section context** in the prompt:
   - Currently: `contentBrief` is included as a single line
   - Add: relevant global content items when available
     - For features/services sections: include service titles and descriptions
     - For testimonials: include quotes, author names, roles
     - For team sections: include member names and roles
   - Add: business name, contact info when relevant (header, footer, contact sections)

3. **Update few-shot examples** to show content-aware defaults:
   ```json
   // Before:
   { "name": "heading", "default": null, "description": "Main hero headline" }
   // After:
   { "name": "heading", "default": "Transform Your Smile Today", "description": "Main hero headline" }
   ```

## Files to Modify

1. `platform-app/src/lib/ai/prompts/code-component-generation.ts`
2. `platform-app/src/lib/pipeline/phases/generate-code-components.ts` (buildSectionDesignBrief — pass global content)
3. `platform-app/src/lib/code-components/types.ts` (SectionDesignBrief — add globalContent field)

## Dependencies

- None (can be done in parallel with TASK-526, both contribute to the same goal)

## Acceptance Criteria

- [ ] Prompt explicitly instructs AI to generate content-aware defaults
- [ ] Section design brief includes relevant global content (services, testimonials, etc.)
- [ ] Few-shot examples show realistic default values, not null/generic text
- [ ] AI-generated components have meaningful default prop values
- [ ] Tests updated and passing
