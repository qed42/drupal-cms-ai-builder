import type { OnboardingData } from "@/lib/blueprint/types";
import type { ResearchBrief, ContentPlan } from "@/lib/pipeline/schemas";
import type { z } from "zod";
import type { ContentPlanPageSchema } from "@/lib/pipeline/schemas";
import { getManifestComponent } from "../../blueprint/component-validator";
import { formatRulesForGeneration, classifyPageType, getRule } from "../page-design-rules";
import { getDefaultAdapter } from "@/lib/design-systems/setup";

type ContentPlanPage = z.infer<typeof ContentPlanPageSchema>;

function buildComponentPropReference(): string {
  return getDefaultAdapter().buildPromptComponentReference();
}

/**
 * Generate page-type-specific interlinking hints.
 * Guides the AI on which pages to link from CTAs, cards, and inline text.
 */
function getInterlinkingHints(
  pageType: string,
  allPages: Array<{ slug: string; title: string }>,
  currentSlug: string
): string[] {
  const slugs = new Set(allPages.map((p) => p.slug));
  const otherPages = allPages.filter((p) => p.slug !== currentSlug);
  if (otherPages.length === 0) return [];

  const hints: string[] = [];
  const findPage = (...candidates: string[]) =>
    otherPages.find((p) => candidates.some((c) => p.slug.includes(c)));

  const contactPage = findPage("contact");
  const servicesPage = findPage("services", "service");
  const aboutPage = findPage("about");
  const teamPage = findPage("team");
  const portfolioPage = findPage("portfolio", "work", "case");
  const faqPage = findPage("faq");

  switch (pageType) {
    case "home":
      hints.push(`- **Home page linking**: CTA banner → ${contactPage ? `/${contactPage.slug}` : servicesPage ? `/${servicesPage.slug}` : "conversion page"}`);
      if (servicesPage) hints.push(`  - Feature/service cards → /${servicesPage.slug}`);
      if (aboutPage) hints.push(`  - About teaser → /${aboutPage.slug}`);
      if (teamPage) hints.push(`  - Team mention → /${teamPage.slug}`);
      break;
    case "services":
      hints.push(`- **Services page linking**: CTA banner → ${contactPage ? `/${contactPage.slug}` : "conversion page"}`);
      if (portfolioPage) hints.push(`  - Service cards → /${portfolioPage.slug}`);
      if (aboutPage) hints.push(`  - Trust section → /${aboutPage.slug}`);
      break;
    case "about":
      hints.push(`- **About page linking**: CTA banner → ${contactPage ? `/${contactPage.slug}` : servicesPage ? `/${servicesPage.slug}` : "conversion page"}`);
      if (servicesPage) hints.push(`  - Value props → /${servicesPage.slug}`);
      if (teamPage) hints.push(`  - Team mention → /${teamPage.slug}`);
      break;
    case "contact":
      hints.push(`- **Contact page linking**: No closing CTA banner needed (this IS the conversion page)`);
      if (servicesPage) hints.push(`  - Supporting text → /${servicesPage.slug}`);
      if (faqPage) hints.push(`  - FAQ reference → /${faqPage.slug}`);
      break;
    case "faq":
      hints.push(`- **FAQ page linking**: CTA banner → ${contactPage ? `/${contactPage.slug}` : "conversion page"}`);
      if (servicesPage) hints.push(`  - Answer links → /${servicesPage.slug}`);
      break;
    default:
      if (contactPage) hints.push(`- CTA banner → /${contactPage.slug}`);
      else if (servicesPage) hints.push(`- CTA banner → /${servicesPage.slug}`);
      break;
  }

  return hints;
}

/**
 * Build a per-page generation prompt using the research brief, content plan,
 * and onboarding context. Each page gets its own AI call with full context.
 */
export function buildPageGenerationPrompt(
  page: ContentPlanPage,
  data: OnboardingData,
  research: ResearchBrief,
  plan: ContentPlan,
  allPages?: Array<{ slug: string; title: string; purpose?: string }>
): string {
  const sections: string[] = [
    `You are a professional website copywriter generating content for a specific page.`,
    ``,
    `## Site Context`,
    `- **Business:** ${data.name || plan.siteName}`,
    `- **Industry:** ${research.industry}`,
    `- **Audience:** ${research.targetAudience.primary}`,
    `- **Tone:** ${research.toneGuidance.primary}`,
    `- **Tagline:** ${plan.tagline}`,
    `- **Key Messages:** ${research.keyMessages.join("; ")}`,
  ];

  if (data.differentiators) {
    sections.push(`- **Differentiators:** ${data.differentiators}`);
  }

  if (research.complianceNotes && research.complianceNotes.length > 0) {
    sections.push(`- **Compliance:** ${research.complianceNotes.join("; ")}`);
  }

  // Tone guidance
  sections.push(
    ``,
    `## Tone Guidelines`,
    `- Style: ${research.toneGuidance.primary}`,
    `- Avoid: ${research.toneGuidance.avoid.join(", ") || "N/A"}`,
    `- Example sentences: ${research.toneGuidance.examples.join(" | ") || "N/A"}`
  );

  // Site pages available for interlinking (TASK-335)
  if (allPages && allPages.length > 0) {
    sections.push(
      ``,
      `## Site Pages (available for interlinking)`,
      ...allPages.map((p) =>
        p.slug === page.slug
          ? `- /${p.slug} — ${p.title} ← THIS PAGE (do not self-link)`
          : `- /${p.slug} — ${p.title}${p.purpose ? `: ${p.purpose}` : ""}`
      ),
      ``
    );
  }

  // Page-specific plan with section count requirement
  const pageType = classifyPageType(page.slug, page.title);
  const designRule = getRule(pageType);

  sections.push(
    ``,
    `## Page: ${page.title} (/${page.slug})`,
    `- **Purpose:** ${page.purpose}`,
    `- **SEO Keywords:** ${page.targetKeywords.join(", ")}`,
    `- **REQUIRED SECTION COUNT:** ${designRule.sectionCountRange[0]}-${designRule.sectionCountRange[1]} sections (you MUST generate at least ${designRule.sectionCountRange[0]} sections for this ${pageType} page)`,
    ``,
    `## Sections to Generate`
  );

  for (const section of page.sections) {
    const wordTarget = section.estimatedWordCount
      ? ` (~${section.estimatedWordCount} words)`
      : "";
    sections.push(
      `### ${section.heading} (type: ${section.type})${wordTarget}`,
      `Brief: ${section.contentBrief}`,
      section.componentSuggestion
        ? `Component: ${section.componentSuggestion}`
        : "",
      ``
    );
  }

  // Available services/team/testimonials from plan
  if (plan.globalContent.services.length > 0) {
    sections.push(
      `## Available Services`,
      ...plan.globalContent.services.map(
        (s) => `- **${s.title}:** ${s.briefDescription}`
      ),
      ``
    );
  }

  if (plan.globalContent.teamMembers && plan.globalContent.teamMembers.length > 0) {
    sections.push(
      `## Team Members`,
      ...plan.globalContent.teamMembers.map((t) => `- ${t.name}, ${t.role}`),
      ``
    );
  }

  if (plan.globalContent.testimonials && plan.globalContent.testimonials.length > 0) {
    sections.push(
      `## Testimonials`,
      ...plan.globalContent.testimonials.map(
        (t) => `- "${t.quote}" — ${t.authorName}${t.authorRole ? `, ${t.authorRole}` : ""}`
      ),
      ``
    );
  }

  sections.push(
    `## Output Format`,
    `Return JSON with:`,
    `- "slug": "${page.slug}"`,
    `- "title": "${page.title}"`,
    `- "seo": { "meta_title": string (50-60 chars, include primary keyword), "meta_description": string (150-160 chars) }`,
    `- "sections": Array. Each section is ONE of:`,
    ``,
    `  A. **Organism section** (hero, CTA, accordion, slider):`,
    `     - "component_id": organism component ID from the component manifest (use IDs from the Component Prop Reference below)`,
    `     - "props_json": JSON-encoded STRING of props`,
    `     - "children": (optional) array of child components for slots, each with:`,
    `       - "component_id": child component ID`,
    `       - "slot": slot name (e.g., "slide_item", "content", "items")`,
    `       - "props_json": JSON-encoded STRING of child props`,
    ``,
    `  B. **Composed section** (text+image, features, stats, team, cards):`,
    `     - "component_id": "" (MUST be empty string — the pattern name is NOT a component ID)`,
    `     - "props_json": "" (MUST be empty string for composed sections)`,
    `     - "pattern": composition pattern name (e.g., "text-image-split-50-50")`,
    `     - "section_heading": { "label": string, "title": string, "description": string } (optional)`,
    `     - "container_background": background color for container (${getDefaultAdapter().getColorPalette().values.join("|")})`,
    `     - "children": array of child components, each with:`,
    `       - "component_id": atom/molecule component ID from the component manifest (use IDs from the Component Prop Reference below)`,
    `       - "slot": target slot name (the tree builder assigns correct slots per design system — use "content" as default)`,
    `       - "props_json": JSON-encoded STRING of props`,
    ``,
    `    - IMPORTANT: props_json must be a valid JSON string, not an object`,
    `    - Use REAL, specific content — not placeholder text`,
    ``,
    `## Component Prop Reference (ONLY use props listed here)`,
    ``,
    buildComponentPropReference(),
    ``,
    ...formatRulesForGeneration(page.slug, page.title),
    ``,
    `IMPORTANT: Choose the most appropriate component or composition pattern for each section. Use organisms (type A) for heroes, CTAs, accordions, sliders. Use composed sections (type B) for content areas with text, images, cards, stats.`,
    ``,
    `## Layout Rules (MUST FOLLOW)`,
    ``,
    `### Container & Width`,
    `- Hero banners and CTA banners are full-width organisms — output them as type A sections`,
    `- All other content sections use composition patterns (type B) with the design system's layout components`,
    `- Width is controlled at the container level, NOT on individual components. Do NOT add "width" to component props_json unless it is explicitly listed in the Component Prop Reference above.`,
    ``,
    `### Section Structure`,
    `- Every non-hero, non-CTA section should have a section_heading introducing it`,
    `- Alternate container backgrounds for visual rhythm: ${getDefaultAdapter().getColorPalette().defaultAlternation.join(" → ")}`,
    `- Never use the same background on consecutive sections`,
    ``,
    `### Column Matching`,
    `- The number of children MUST match the composition pattern: "33-33-33" = 3 children, "50-50" = 2 children, "25-25-25-25" = 4 children`,
    ``,
    `### Anti-Monotony`,
    `- NEVER use the same composition pattern in two consecutive sections`,
    `- For text+image sections, alternate the column order (text-left/image-right then image-left/text-right)`,
    ``,
    `### Heading Hierarchy (Semantic HTML)`,
    `- Hero title uses h1 — only ONE h1 per page`,
    `- Section headings use h2`,
    `- Subsection headings use h3`,
    `- Never skip heading levels`,
    ``,
    `### Icon Validation`,
    `- All icon names MUST be valid Phosphor Icons (https://phosphoricons.com/)`,
    `- Safe values: rocket, star, phone, envelope, map-pin, clock, shield-check, heart, users, chart-line, lightbulb, gear, house, arrow-right, check-circle, trophy, handshake, target, briefcase, globe`,
    ``,
    `### Component-Specific Rules`,
    `- **Multi-column layouts**: Every column slot MUST have at least one child component. Never leave a column empty.`,
    `- **Images**: Each component that accepts an image prop should describe a unique, contextually relevant image. Use different images for different sections — never reuse the same image description across sections.`,
    `- **HTML content props**: Wrap text content in <p> tags where the prop accepts HTML.`,
    `- CRITICAL: Only use prop names that are listed in the Component Prop Reference above. Do NOT guess or invent prop names.`,
    ``,
    getDefaultAdapter().buildPromptAccessibilityRules(),
    ``,
    `### Internal Linking Strategy (SEO/GEO Critical)`,
    `- Every CTA banner MUST link to a real page from the Site Pages list above`,
    `- Every composed section with a button component SHOULD link to a relevant sibling page`,
    `- Use descriptive CTA text that hints at the destination — not generic "Learn More" or "Click Here"`,
    `  Good: "Explore Our Services →", "Meet the Team →", "Get a Free Quote →"`,
    `  Bad: "Learn More", "Click Here", "Read More"`,
    `- Card components: set link/url to link cards to relevant pages`,
    `- In HTML content props, embed internal links naturally: <a href="/services">our services</a>`,
    `- Do NOT link to the current page (self-link)`,
    `- All internal URLs must use relative format: /{slug} (matching a page from the Site Pages list)`,
    ...getInterlinkingHints(pageType, allPages ?? [], page.slug),
    ``,
    `Guidelines:`,
    `- CRITICAL: Only use props that are listed in the Component Prop Reference above. Do NOT use props that don't exist on a component.`,
    `- Write REAL content, not lorem ipsum or placeholders`,
    `- CTAs must be specific to the business (not "Get started" or "Learn more")`,
    `- Include SEO keywords naturally in headings and body text`,
    `- Match the tone guidelines exactly`,
    `- Meet the word count targets for each section`,
    ``,
    `Return ONLY valid JSON.`
  );

  return sections.filter(Boolean).join("\n");
}
