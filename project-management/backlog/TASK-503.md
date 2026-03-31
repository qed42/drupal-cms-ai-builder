# TASK-503: Designer Agent — System Prompt & Zod Output Schema

**Story:** US-101 — Designer Agent — AI-Generated Custom Sections
**Priority:** P0
**Effort:** L
**Milestone:** M26 — Code Component Generation

## Description

Build the system prompt template and Zod output schema for the Designer Agent. This is the creative/prompt-engineering half of US-101 — the prompt defines what the LLM generates, and the schema enforces output structure.

## Technical Approach

### 1. Zod Output Schema (`code-component-generation.ts`)

Define a schema that mirrors `CodeComponentOutput` from `types.ts`:

```typescript
import { z } from "zod";

export const CodeComponentResponseSchema = z.object({
  machineName: z.string().regex(/^[a-z][a-z0-9_]{1,62}$/),
  name: z.string().min(1).max(100),
  jsx: z.string().min(50),  // must contain actual JSX
  css: z.string(),           // may be empty if purely Tailwind utility classes
  props: z.array(z.object({
    name: z.string().regex(/^[a-z][a-zA-Z0-9_]*$/),
    type: z.enum([
      "string", "formatted_text", "boolean",
      "integer", "number", "link", "image", "video"
    ]),
    required: z.boolean(),
    default: z.unknown().optional(),
    description: z.string().optional(),
  })),
  slots: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
  })).optional(),
});

export type CodeComponentResponse = z.infer<typeof CodeComponentResponseSchema>;
```

### 2. System Prompt Builder (`code-component-generation.ts`)

Follow the same pattern as `buildPageGenerationPrompt()` in `prompts/page-generation.ts`:

```typescript
export function buildCodeComponentPrompt(
  brief: SectionDesignBrief,
  previousSections?: Array<{ machineName: string; sectionType: string }>
): string;
```

**Prompt sections to include:**

1. **Role** — "You are a senior frontend designer generating React/Preact components for Drupal Canvas."
2. **Tech stack constraints:**
   - React/Preact with `export default function ComponentName(props)` pattern
   - Tailwind CSS v4 utility classes (no raw CSS except `@apply`)
   - Available imports: `cn`, `clsx`, `cva`, `tailwind-merge`, `FormattedText`
   - Image props use Canvas `image` prop type, rendered as `<img src={props.imageName} />`
   - No external dependencies, no `fetch`, no `eval`, no DOM manipulation
3. **Brand token injection:**
   - Colors as CSS custom properties: `text-[var(--color-primary)]`, `bg-[var(--color-accent)]`
   - Fonts: `font-[var(--font-heading)]`, `font-[var(--font-body)]`
4. **Responsive design:**
   - Mobile-first with Tailwind breakpoints (`sm:`, `md:`, `lg:`)
   - No `@media` queries — Tailwind utilities only
5. **Animation rules (from brief.animationLevel):**
   - `subtle`: opacity transitions, gentle hovers
   - `moderate`: entrance animations, scroll-triggered fades, hover transforms
   - `dramatic`: parallax effects, staggered reveals, complex transforms
   - ALL animations must include `motion-reduce:` variant
6. **Image placeholders:**
   - Use `<img src="/placeholder/WxH" alt="descriptive context" />` convention
   - Alt text should describe the desired image for stock photo matching
7. **Visual style (from brief.visualStyle):**
   - `minimal`: whitespace-heavy, thin borders, muted palette
   - `bold`: high contrast, large typography, strong color blocks
   - `elegant`: serif accents, subtle gradients, refined spacing
   - `playful`: rounded corners, bright accents, casual typography
8. **Section context:**
   - Heading, content brief, section type, position, tone guidance
   - Previous section summary (for visual rhythm — avoid repeating same layout)
9. **Output format:**
   - JSON matching `CodeComponentResponseSchema`
   - `machineName` must be unique per site (append section type + short hash)
   - `props` should expose content-editable fields (headings, descriptions, button text, image)

### 3. Few-Shot Examples

Include 2-3 reference examples as string constants in the prompt file. Cover:
- **Hero section** — full-width, gradient overlay, animated entrance, CTA button
- **Features/services grid** — responsive card layout, icon props, hover effects
- **Testimonials** — quote styling, avatar image prop, rating display

Each example must be a valid `CodeComponentResponse` JSON that passes the Zod schema.

### 4. Section-Type Specific Guidance

Include a section-type instruction map:

```typescript
const SECTION_TYPE_GUIDANCE: Record<string, string> = {
  hero: "Full-viewport section with background image, overlay gradient, headline, subheadline, and CTA...",
  features: "Grid of 3-4 feature cards with icons, titles, and descriptions...",
  testimonials: "Testimonial cards or quotes with author avatar, name, role...",
  cta: "Prominent call-to-action with compelling headline and action button...",
  faq: "Accordion-style FAQ with expandable items (use useState for toggle)...",
  team: "Team member cards in a responsive grid with photo, name, role...",
  gallery: "Image gallery grid with lightbox-style hover effects...",
  stats: "Large number displays with labels and optional animations...",
  contact: "Contact information layout with address, phone, email, map placeholder...",
};
```

## Acceptance Criteria

- [ ] `CodeComponentResponseSchema` validates all 11 Canvas prop types
- [ ] `buildCodeComponentPrompt()` generates a complete prompt from a `SectionDesignBrief`
- [ ] Prompt includes tech constraints, brand tokens, animation rules, and responsive requirements
- [ ] At least 3 few-shot examples included (hero, features, testimonials) that pass Zod validation
- [ ] Section-type guidance covers 9+ section types
- [ ] Unit tests verify prompt structure for different brief configurations (minimal vs dramatic, bold vs elegant)

## Dependencies
- TASK-501 (types), TASK-502 (validator)

## Files to Create

- `platform-app/src/lib/ai/prompts/code-component-generation.ts`
- `platform-app/src/lib/ai/prompts/__tests__/code-component-generation.test.ts`
