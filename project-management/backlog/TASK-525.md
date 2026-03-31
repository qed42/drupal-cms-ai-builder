# TASK-525: Fix image prop format mismatch in code component prompt and enhance phase

**Story:** BUG-057
**Priority:** P0
**Estimate:** M
**Status:** To Do

## Description

Code component images don't render because of two format mismatches:

### Bug A: JSX accesses image props as strings, but they're objects

The code component generation prompt (`code-component-generation.ts:336`) instructs the AI:
```
Image props: Render as <img src={props.imageName || "/placeholder/WxH"} />
```

Canvas image props are objects `{ src, width, height, alt }`, so `src={props.backgroundImage}` renders as `src="[object Object]"`.

**Fix:** Update the prompt instruction to:
```
Image props: Render as <img src={props.imageName?.src || "/placeholder/WxH"} alt={props.imageName?.alt || "descriptive text"} />
```

Update the few-shot examples (HERO_EXAMPLE, TESTIMONIALS_EXAMPLE) accordingly:
```jsx
// Before:
src={backgroundImage || "/placeholder/1920x800"}
// After:
src={backgroundImage?.src || "/placeholder/1920x800"}
alt={backgroundImage?.alt || "Hero background"}
```

### Bug B: Enhance phase uses `url` key instead of `src`

`enhance.ts:172` sets: `section.props[propName] = { url: src, alt: matched.description }`
`enhance.ts:200` sets: `section.props[propName] = { url: downloaded.localPath, alt: downloaded.alt }`

Canvas and the YAML config expect `{ src, width, height, alt }`.

**Fix:** Change both lines to use the Canvas image schema:
```typescript
section.props[propName] = { src: downloadedUrl, width: 1200, height: 800, alt: altText };
```

### Bug C: `isPlaceholderUrl` checks `obj.url` but should also check `obj.src`

`enhance.ts:146` checks `obj.url` but after fix B, we use `obj.src`. Update the skip check.

## Files to Modify

1. `platform-app/src/lib/ai/prompts/code-component-generation.ts` — prompt text + few-shot examples
2. `platform-app/src/lib/pipeline/phases/enhance.ts` — image prop format
3. `platform-app/src/lib/ai/prompts/__tests__/code-component-generation.test.ts` — update tests

## Acceptance Criteria

- [ ] Prompt instructs AI to access `props.imageName?.src` (not `props.imageName` directly)
- [ ] All three few-shot examples use `?.src` pattern for image props
- [ ] Enhance phase sets image props as `{ src, width, height, alt }` (not `{ url, alt }`)
- [ ] `isPlaceholderUrl` skip check works with both `url` and `src` keys
- [ ] Existing tests updated and passing
- [ ] No TypeScript errors
