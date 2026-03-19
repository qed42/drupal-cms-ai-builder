# TASK-269: Integrate Prop Validator into Generate Pipeline with Retry Loop

**Story:** US-048, FR-205
**Priority:** P0
**Effort:** M
**Sprint:** 14

## Description

Wire the component prop validator (TASK-268) into the generation pipeline so that every generated page is validated before being saved to the blueprint. On validation failure, retry the AI generation with specific error feedback.

## Implementation Notes

### Pipeline Integration Point
In `platform-app/src/lib/pipeline/phases/generate.ts`, after each page is generated and parsed:

1. Parse `props_json` strings into objects
2. Run through component validator
3. If validation errors exist AND are fixable (unknown props stripped → still valid): use sanitized version
4. If validation errors are blocking (unknown component, missing required props with no defaults): retry AI generation with error details in prompt
5. Max 2 retry attempts (matching existing `generateValidatedJSON` pattern)

### Retry Feedback Format
Feed validation errors back to the AI in the retry prompt:
```
The following props are INVALID and must not be used:
- Section "Hero Banner": prop "description" does not exist on space-hero-banner-style-01. Valid props: title, sub_headline, background_image
```

### Fix page-generation.ts Prompt
The prompt at line 109 incorrectly suggests `description` as a hero prop. Replace the hardcoded prop examples with dynamically generated examples from the component manifest.

## Acceptance Criteria

- [ ] Every generated page passes through component validator before blueprint save
- [ ] Invalid props are auto-stripped when the section is otherwise valid
- [ ] Blocking errors trigger AI retry with specific error feedback
- [ ] page-generation.ts prompt uses manifest-derived prop examples instead of hardcoded ones
- [ ] Pipeline logs validation warnings for observability
- [ ] End-to-end test: generate a blueprint and verify all props are valid per manifest

## Dependencies

- TASK-268 (Component Prop Validator)
