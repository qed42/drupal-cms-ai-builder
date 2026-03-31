/**
 * Prompt builder and Zod schema for the Designer Agent (M26 TASK-503).
 *
 * Generates React/Preact + Tailwind CSS v4 code components for
 * Drupal Canvas from section design briefs.
 */

import { z } from "zod";
import type { SectionDesignBrief } from "@/lib/code-components/types";

// ---------------------------------------------------------------------------
// Zod Output Schema
// ---------------------------------------------------------------------------

export const CodeComponentResponseSchema = z.object({
  machineName: z
    .string()
    .regex(
      /^[a-z][a-z0-9_]{1,62}$/,
      "Must be a valid Drupal machine name (lowercase, underscores, 2-63 chars)"
    ),
  name: z.string().min(1).max(100),
  jsx: z.string().min(50, "JSX must contain actual component code"),
  css: z.string(),
  props: z.array(
    z.object({
      name: z
        .string()
        .regex(/^[a-z][a-zA-Z0-9_]*$/, "Prop name must be camelCase"),
      type: z.enum([
        "string",
        "formatted_text",
        "boolean",
        "integer",
        "number",
        "link",
        "image",
        "video",
        "list:text",
        "list:integer",
      ]),
      required: z.boolean(),
      default: z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.object({ url: z.string(), alt: z.string() }),
        z.null(),
      ]),
      description: z.string(),
    })
  ),
  slots: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    ),
});

export type CodeComponentResponse = z.infer<typeof CodeComponentResponseSchema>;

// ---------------------------------------------------------------------------
// Section-Type Guidance
// ---------------------------------------------------------------------------

const SECTION_TYPE_GUIDANCE: Record<string, string> = {
  hero: `Full-viewport hero section. Use a background image with gradient overlay, a bold headline (h1), supporting subheadline, and a prominent CTA button. The overlay gradient should use brand primary color. Image should be full-width via object-cover.`,
  features: `Grid of 3-4 feature/service cards. Each card has an icon area, heading (h3), and short description. Use a responsive grid: 1 column on mobile, 2 on tablet, 3-4 on desktop. Cards should have subtle hover effects.`,
  services: `Service listing with detail. Each service has a heading, description, and optional image. Can be a grid or alternating left/right layout. Include a CTA link per service. Expose services as props for editability.`,
  testimonials: `Customer testimonial display. Show quote text, author name, role/company, and optional avatar image. Can be a grid, slider, or stacked layout. Use large quotation marks or a quote icon for visual emphasis.`,
  cta: `Call-to-action banner. A compelling headline, short supporting text, and one or two action buttons (primary + optional secondary). Use a bold background (brand color or gradient). Full-width with generous padding.`,
  faq: `FAQ accordion section. Each item has a question heading and expandable answer. Use React useState for open/close toggle. Include a section heading above the FAQ list. Show one item open by default.`,
  team: `Team member cards in a responsive grid. Each member has a photo (image prop), name, role/title, and optional short bio. Grid: 1 col mobile, 2 tablet, 3-4 desktop. Photos should be consistent size.`,
  gallery: `Image gallery in a responsive grid. Support 4-8 images with hover overlay showing a caption or zoom icon. Grid: 2 cols mobile, 3 tablet, 4 desktop. Images use the image prop type.`,
  stats: `Statistics/numbers display. 3-4 large numbers with labels (e.g., "500+ Clients", "15 Years"). Numbers should be visually prominent. Optional count-up animation with motion-reduce fallback.`,
  contact: `Contact information section. Display address, phone, email with icons. Can include a map placeholder image and business hours. Layout: info on one side, map/image on the other.`,
  about: `About/story section. Narrative text with optional image. Alternating text-image layout or image on one side with text on the other. Include company values or mission statement. Rich text via formatted_text prop.`,
  header: `Site header/navigation bar. Must include: logo area (image prop or text), navigation menu links (expose as props), and a CTA button. Include a mobile hamburger menu using useState toggle. Sticky positioning with backdrop blur.`,
  footer: `Site footer. Include: brand logo/name, short description, navigation links, social media icon links, legal/copyright text. Multi-column layout: brand info, nav links, social links. Full-width background.`,
};

// ---------------------------------------------------------------------------
// Few-Shot Examples
// ---------------------------------------------------------------------------

const HERO_EXAMPLE: CodeComponentResponse = {
  machineName: "hero_gradient_ex",
  name: "Hero with Gradient Overlay",
  jsx: `export default function HeroGradientEx({ heading, subheading, ctaText, ctaUrl, backgroundImage }) {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      <img
        src={backgroundImage || "/placeholder/1920x800"}
        alt="Hero background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/90 to-transparent" />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-20 text-white">
        <h1 className="font-[var(--font-heading)] text-4xl md:text-5xl lg:text-6xl font-bold leading-tight motion-safe:animate-[fadeInUp_600ms_ease_both]">
          {heading}
        </h1>
        <p className="mt-4 text-lg md:text-xl opacity-90 motion-safe:animate-[fadeInUp_600ms_ease_200ms_both]">
          {subheading}
        </p>
        <a
          href={ctaUrl || "#contact"}
          className="inline-block mt-8 px-8 py-4 bg-[var(--color-accent)] text-black font-semibold rounded-lg motion-safe:animate-[fadeInUp_600ms_ease_400ms_both] hover:scale-105 transition-transform motion-reduce:transition-none"
          aria-label={ctaText}
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}`,
  css: `@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}`,
  props: [
    { name: "heading", type: "string", required: true, default: null, description: "Main hero headline" },
    { name: "subheading", type: "string", required: false, default: null, description: "Supporting text below the headline" },
    { name: "ctaText", type: "string", required: true, default: "Get Started", description: "Call-to-action button text" },
    { name: "ctaUrl", type: "link", required: false, default: null, description: "CTA button destination URL" },
    { name: "backgroundImage", type: "image", required: false, default: null, description: "Hero background image" },
  ],
  slots: [],
};

const FEATURES_EXAMPLE: CodeComponentResponse = {
  machineName: "features_grid_ex",
  name: "Features Grid",
  jsx: `export default function FeaturesGridEx({ sectionTitle, sectionDescription, feature1Title, feature1Desc, feature2Title, feature2Desc, feature3Title, feature3Desc }) {
  const features = [
    { title: feature1Title, desc: feature1Desc, icon: "\\u2726" },
    { title: feature2Title, desc: feature2Desc, icon: "\\u25C8" },
    { title: feature3Title, desc: feature3Desc, icon: "\\u25C9" },
  ];

  return (
    <section className="py-16 md:py-24 px-6 bg-[var(--color-surface,#f9fafb)]">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl font-bold text-[var(--color-primary)]">
          {sectionTitle}
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{sectionDescription}</p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow motion-reduce:transition-none"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
  css: "",
  props: [
    { name: "sectionTitle", type: "string", required: true, default: null, description: "Section heading" },
    { name: "sectionDescription", type: "string", required: false, default: null, description: "Section subtitle" },
    { name: "feature1Title", type: "string", required: true, default: null, description: "First feature title" },
    { name: "feature1Desc", type: "string", required: false, default: null, description: "First feature description" },
    { name: "feature2Title", type: "string", required: true, default: null, description: "Second feature title" },
    { name: "feature2Desc", type: "string", required: false, default: null, description: "Second feature description" },
    { name: "feature3Title", type: "string", required: true, default: null, description: "Third feature title" },
    { name: "feature3Desc", type: "string", required: false, default: null, description: "Third feature description" },
  ],
  slots: [],
};

const TESTIMONIALS_EXAMPLE: CodeComponentResponse = {
  machineName: "testimonials_cards_ex",
  name: "Testimonials Cards",
  jsx: `export default function TestimonialsCardsEx({ sectionTitle, quote1, author1, role1, avatar1, quote2, author2, role2, avatar2 }) {
  const testimonials = [
    { quote: quote1, author: author1, role: role1, avatar: avatar1 },
    { quote: quote2, author: author2, role: role2, avatar: avatar2 },
  ];

  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-[var(--font-heading)] text-3xl md:text-4xl font-bold text-center mb-12">
          {sectionTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <blockquote
              key={i}
              className="p-8 bg-white rounded-xl border border-gray-100 shadow-sm motion-safe:animate-[fadeIn_500ms_ease_both]"
              style={{ animationDelay: i * 150 + "ms" }}
            >
              <svg className="w-8 h-8 text-[var(--color-primary)] opacity-30 mb-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-gray-700 text-lg leading-relaxed">{t.quote}</p>
              <div className="mt-6 flex items-center gap-3">
                <img
                  src={t.avatar || "/placeholder/48x48"}
                  alt={"Photo of " + t.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{t.author}</div>
                  <div className="text-sm text-gray-500">{t.role}</div>
                </div>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}`,
  css: `@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}`,
  props: [
    { name: "sectionTitle", type: "string", required: true, default: "What Our Clients Say", description: "Section heading" },
    { name: "quote1", type: "string", required: true, default: null, description: "First testimonial quote" },
    { name: "author1", type: "string", required: true, default: null, description: "First testimonial author name" },
    { name: "role1", type: "string", required: false, default: null, description: "First author role/company" },
    { name: "avatar1", type: "image", required: false, default: null, description: "First author photo" },
    { name: "quote2", type: "string", required: true, default: null, description: "Second testimonial quote" },
    { name: "author2", type: "string", required: true, default: null, description: "Second testimonial author name" },
    { name: "role2", type: "string", required: false, default: null, description: "Second author role/company" },
    { name: "avatar2", type: "image", required: false, default: null, description: "Second author photo" },
  ],
  slots: [],
};

const FEW_SHOT_EXAMPLES = [HERO_EXAMPLE, FEATURES_EXAMPLE, TESTIMONIALS_EXAMPLE];

// ---------------------------------------------------------------------------
// Animation Level Guidance
// ---------------------------------------------------------------------------

const ANIMATION_GUIDANCE: Record<string, string> = {
  subtle: `ANIMATION LEVEL: Subtle
- Use only opacity transitions and gentle hover effects (hover:opacity-80, hover:shadow-md)
- No entrance animations or transforms
- Keep transitions under 200ms
- motion-reduce: variants should remove all transitions`,
  moderate: `ANIMATION LEVEL: Moderate
- Entrance animations: fade-in, slide-up on scroll (use motion-safe: prefix)
- Hover effects: scale, shadow elevation, color transitions
- Stagger child animations by 100-200ms delay
- @keyframes for entrance animations (fadeInUp, fadeIn)
- ALL animated elements must have motion-reduce: equivalent that removes animation`,
  dramatic: `ANIMATION LEVEL: Dramatic
- Bold entrance animations: parallax-style slides, reveal effects, staggered reveals
- Interactive hover states: scale-105, translateY, shadow-2xl, color shifts
- Use animation-delay for cascading effects across cards/items
- Complex @keyframes with multi-step transforms
- Consider scroll-triggered animations (use intersection observer pattern)
- ALL animated elements MUST have motion-reduce: variants`,
};

// ---------------------------------------------------------------------------
// Visual Style Guidance
// ---------------------------------------------------------------------------

const VISUAL_STYLE_GUIDANCE: Record<string, string> = {
  minimal: `VISUAL STYLE: Minimal
- Generous whitespace (py-20+, gap-12+)
- Thin borders (border, border-gray-100)
- Muted color palette — use primary color sparingly as accents
- Clean sans-serif typography
- Avoid shadows heavier than shadow-sm`,
  bold: `VISUAL STYLE: Bold
- High contrast: dark backgrounds with light text, or vivid brand colors
- Large typography (text-5xl+, font-bold/extrabold)
- Strong color blocks using brand primary/accent
- Prominent shadows (shadow-lg, shadow-xl)
- Full-bleed sections with generous inner padding`,
  elegant: `VISUAL STYLE: Elegant
- Serif accents for headings: font-serif or var(--font-heading)
- Subtle gradients (from-white to-gray-50)
- Refined spacing with asymmetric layouts
- Thin, understated borders with rounded-xl corners
- Gold/neutral accent tones complement well`,
  playful: `VISUAL STYLE: Playful
- Rounded corners everywhere (rounded-2xl, rounded-full for avatars)
- Bright accent colors — use var(--color-accent) generously
- Slightly larger text sizes with relaxed line-height
- Casual, friendly language in placeholder text
- Fun hover effects (scale, rotate-1, bounce)`,
};

// ---------------------------------------------------------------------------
// Prompt Builder
// ---------------------------------------------------------------------------

/**
 * Build the full prompt for code component generation.
 *
 * @param brief - Section context from the content plan
 * @param previousSections - Already-generated sections for visual rhythm
 * @returns Complete prompt string for the AI provider
 */
export function buildCodeComponentPrompt(
  brief: SectionDesignBrief,
  previousSections?: Array<{ machineName: string; sectionType: string }>,
  designRulesFragment?: string
): string {
  const sectionGuidance =
    SECTION_TYPE_GUIDANCE[brief.sectionType] ||
    SECTION_TYPE_GUIDANCE["features"] ||
    "";
  const animationGuidance =
    ANIMATION_GUIDANCE[brief.animationLevel] || ANIMATION_GUIDANCE.moderate;
  const styleGuidance =
    VISUAL_STYLE_GUIDANCE[brief.visualStyle] || VISUAL_STYLE_GUIDANCE.minimal;

  const brandSection = buildBrandSection(brief);
  const contextSection = buildContextSection(brief);
  const rhythmSection = buildRhythmSection(previousSections);
  const examplesSection = buildExamplesSection(brief.sectionType);

  return `You are a senior frontend designer generating a React/Preact component for Drupal Canvas.

## TECH STACK CONSTRAINTS (MUST FOLLOW)

- **Framework:** React/Preact — export default function ComponentName(props)
- **Styling:** Tailwind CSS v4 utility classes only. No raw CSS except @keyframes in the css field.
- **Available imports:** cn, clsx, cva (class-variance-authority), tailwind-merge, FormattedText
- **Image props:** Use Canvas "image" prop type. Render as <img src={props.imageName || "/placeholder/WxH"} alt="descriptive text" />
- **Links:** Use standard <a href={props.ctaUrl}> elements
- **State:** React useState is allowed for interactive elements (accordions, toggles, mobile menus)
- **FORBIDDEN:** No fetch(), no Function constructor, no document.cookie, window.location, localStorage, innerHTML assignment, @import, external url() in CSS

## BRAND TOKENS

${brandSection}

## ${animationGuidance}

## ${styleGuidance}

## RESPONSIVE DESIGN

- Mobile-first: default styles for mobile, then sm: (640px), md: (768px), lg: (1024px)
- Use Tailwind breakpoint prefixes exclusively — no @media queries in JSX
- @media queries are allowed ONLY in the css field for @keyframes and prefers-reduced-motion
- Ensure text is readable at all breakpoints (min text-base on mobile)

## SECTION CONTEXT

${contextSection}

## SECTION TYPE: ${brief.sectionType.toUpperCase()}

${sectionGuidance}

${rhythmSection}

## IMAGE PLACEHOLDERS

- Use <img src="/placeholder/{width}x{height}" alt="descriptive context for stock photo matching" />
- Alt text should describe the DESIRED image content (e.g., "Modern dental office interior" not "placeholder")
- Common sizes: hero 1920x800, cards 600x400, avatars 80x80, thumbnails 400x300

## OUTPUT FORMAT

Return a single JSON object matching this exact structure:

\`\`\`json
{
  "machineName": "section_type_shortid",
  "name": "Human Readable Section Name",
  "jsx": "export default function ComponentName({ ...props }) { return (<section>...</section>); }",
  "css": "@keyframes ... { } (only if needed for animations)",
  "props": [
    { "name": "propName", "type": "string|formatted_text|boolean|integer|number|link|image|video|list:text|list:integer", "required": true, "default": "optional default", "description": "What this prop controls" }
  ],
  "slots": []
}
\`\`\`

### RULES FOR OUTPUT:
- machineName: lowercase + underscores only, 2-63 chars, must start with a letter
- jsx: MUST contain \`export default function\` and return JSX
- props: expose all user-editable content (headings, descriptions, button text, images, URLs)
- Hardcode layout/structure in JSX; expose CONTENT through props
- Use var(--color-primary), var(--color-accent), var(--font-heading), var(--font-body) for brand tokens
- All <img> elements must have alt attributes
- All animations must use motion-safe: or motion-reduce: Tailwind variants

${examplesSection}
${designRulesFragment ? `\n${designRulesFragment}\n` : ""}
## GENERATE NOW

Generate section ${brief.position + 1}${brief.totalSections ? ` of ${brief.totalSections}` : ""} (${brief.sectionType}) based on the section context and design rules above. Return ONLY the JSON object, no markdown fencing.`;
}

// ---------------------------------------------------------------------------
// Prompt Helpers
// ---------------------------------------------------------------------------

function buildBrandSection(brief: SectionDesignBrief): string {
  const colors = brief.brandTokens.colors;
  const fonts = brief.brandTokens.fonts;

  const colorLines = Object.entries(colors)
    .map(([key, value]) => `- --color-${key}: ${value}`)
    .join("\n");

  return `Colors (use as CSS custom properties):
${colorLines || "- Use default brand color variables (--color-primary, --color-accent)"}
Fonts:
- Heading: var(--font-heading) → ${fonts.heading || "Inter"}
- Body: var(--font-body) → ${fonts.body || "Inter"}`;
}

function buildContextSection(brief: SectionDesignBrief): string {
  const lines = [
    `- **Type:** ${brief.sectionType}`,
    `- **Heading:** "${brief.heading}"`,
    `- **Content brief:** ${brief.contentBrief}`,
    `- **Tone:** ${brief.toneGuidance}`,
    `- **Position on page:** ${brief.position === 0 ? "First section (most prominent)" : `Section ${brief.position + 1}`}${brief.totalSections ? ` of ${brief.totalSections}` : ""}`,
  ];

  if (brief.targetKeywords?.length) {
    lines.push(`- **SEO keywords:** ${brief.targetKeywords.join(", ")}`);
  }

  if (brief.previousSectionSummary) {
    lines.push(`- **Previous section:** ${brief.previousSectionSummary}`);
  }

  return lines.join("\n");
}

function buildRhythmSection(
  previousSections?: Array<{ machineName: string; sectionType: string }>
): string {
  if (!previousSections || previousSections.length === 0) return "";

  const types = previousSections.map((s) => s.sectionType).join(" → ");
  return `## VISUAL RHYTHM

Previous sections on this page: ${types}
- Do NOT repeat the same layout pattern as the immediately preceding section
- Alternate between: full-width / contained, dark bg / light bg, centered / left-aligned
- Vary vertical spacing to create visual breathing room`;
}

function buildExamplesSection(sectionType: string): string {
  // Include the most relevant example first, then one more for variety
  const relevantExample = FEW_SHOT_EXAMPLES.find((ex) => {
    if (sectionType === "hero" || sectionType === "header") return ex.machineName.includes("hero");
    if (sectionType === "testimonials") return ex.machineName.includes("testimonials");
    return ex.machineName.includes("features");
  });

  const otherExample = FEW_SHOT_EXAMPLES.find((ex) => ex !== relevantExample);

  const examples = [relevantExample, otherExample].filter(Boolean);

  if (examples.length === 0) return "";

  const formatted = examples
    .map(
      (ex) =>
        `### Example: ${ex!.name}\n\`\`\`json\n${JSON.stringify(ex, null, 2)}\n\`\`\``
    )
    .join("\n\n");

  return `## REFERENCE EXAMPLES\n\nStudy these examples for output format and quality level. Your output should match or exceed this quality.\n\n${formatted}`;
}

/**
 * Format validation errors as a prompt appendix for retry.
 */
export function formatValidationFeedbackForRetry(
  errors: Array<{ rule: string; message: string; line?: number }>
): string {
  const lines = errors.map((e) => {
    const loc = e.line ? ` (line ${e.line})` : "";
    return `[${e.rule}] ${e.message}${loc}`;
  });

  return `--- CODE COMPONENT VALIDATION ERRORS ---\n${lines.join("\n")}\n\nPlease fix these issues and regenerate the component. Return the complete corrected JSON.`;
}
