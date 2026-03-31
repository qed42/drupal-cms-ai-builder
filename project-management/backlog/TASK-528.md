# TASK-528: Enforce short snake_case prop names in code component generation

**Story:** BUG-057
**Priority:** P0
**Estimate:** M
**Status:** To Do

## Description

Code component prop names are verbose camelCase strings (e.g., `primaryCallToActionButtonText`, `firstTestimonialAuthorPhoto`) that leak into displayed content when used as fallback values. Drupal/Canvas convention is short snake_case machine names.

### Root Cause

1. **Zod regex** (`code-component-generation.ts:29`):
   ```
   /^[a-z][a-zA-Z0-9_]*$/  // allows unlimited-length camelCase
   ```
   No max length, no snake_case enforcement.

2. **No prompt guidance**: The prompt shows `"name": "propName"` but doesn't specify naming conventions, length limits, or examples of good vs. bad names.

3. **Prop name as fallback content** (`config-builder.ts:72`):
   ```javascript
   schema.examples = [prop.name]; // "sectionDescription" becomes displayed text
   ```

4. **Few-shot examples** use camelCase (`sectionTitle`, `feature1Desc`, `backgroundImage`), teaching the AI this convention.

### Fix

1. **Update Zod schema** — change prop name regex to enforce snake_case with max length:
   ```
   /^[a-z][a-z0-9_]{0,30}$/  // snake_case, 1-31 chars
   ```

2. **Update prompt instructions** — add explicit naming rules:
   ```
   ### PROP NAMING RULES:
   - Use short snake_case names: heading, cta_text, hero_image, quote_1
   - Max 32 characters
   - Use numbered suffixes for repeated items: card_1_title, card_2_title
   - NO camelCase, NO verbose names
   - Good: heading, body_text, cta_url, hero_img, card_1_title
   - Bad: primaryCallToActionButtonText, firstFeatureCardDescription
   ```

3. **Update few-shot examples** — convert all prop names to snake_case:
   ```json
   // Before:
   { "name": "sectionTitle" }
   { "name": "feature1Title" }
   { "name": "backgroundImage" }
   // After:
   { "name": "section_title" }
   { "name": "feature_1_title" }
   { "name": "bg_image" }
   ```

4. **Update JSX in few-shot examples** to match:
   ```jsx
   // Before:
   function FeaturesGrid({ sectionTitle, feature1Title }) { ... }
   // After:
   function FeaturesGrid({ section_title, feature_1_title }) { ... }
   ```

## Files to Modify

1. `platform-app/src/lib/ai/prompts/code-component-generation.ts` — Zod schema, prompt text, all three few-shot examples
2. `platform-app/src/lib/code-components/types.ts` — update CodeComponentProp.name JSDoc
3. `platform-app/src/lib/ai/prompts/__tests__/code-component-generation.test.ts` — update test fixtures
4. `platform-app/src/lib/code-components/__tests__/config-builder.test.ts` — update test fixtures

## Acceptance Criteria

- [ ] Zod schema validates prop names as snake_case, max 32 chars
- [ ] Prompt explicitly instructs AI to use short snake_case prop names with examples
- [ ] All three few-shot examples use snake_case prop names
- [ ] JSX in few-shot examples destructures snake_case props
- [ ] AI-generated components use snake_case prop names (validated by schema)
- [ ] Existing tests updated to snake_case conventions and passing
- [ ] No TypeScript errors
