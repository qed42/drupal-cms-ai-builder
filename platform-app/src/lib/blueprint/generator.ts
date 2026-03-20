import { prisma } from "@/lib/prisma";
import { generateSubdomain, spawnProvisioning } from "@/lib/provisioning";
import { getAIProvider } from "@/lib/ai/factory";
import { buildContentPrompt } from "@/lib/ai/prompts/content-generation";
import { buildPageLayoutPrompt } from "@/lib/ai/prompts/page-layout";
import { buildFormPrompt } from "@/lib/ai/prompts/form-generation";
import { buildComponentTree, buildHeaderTree, buildFooterTree } from "./component-tree-builder";
import type {
  BlueprintBundle,
  ContentItems,
  HeaderConfig,
  FooterConfig,
  OnboardingData,
  PageLayout,
  FormField,
  GenerationStep,
} from "./types";

async function updateStep(
  blueprintId: string,
  step: GenerationStep,
  error?: string
) {
  await prisma.blueprint.update({
    where: { id: blueprintId },
    data: {
      generationStep: step,
      ...(error ? { generationError: error } : {}),
    },
  });
}

async function callAI(prompt: string): Promise<string> {
  const provider = await getAIProvider("generate");
  return provider.generateText(prompt, {
    temperature: 0.3,
    maxTokens: 4000,
    phase: "generate",
  });
}

function getFallbackContent(data: OnboardingData): ContentItems {
  return {
    services: [
      {
        title: "Our Core Service",
        description: `Professional ${data.industry || "business"} services tailored to ${data.audience || "our clients"}.`,
        icon: "star",
      },
      {
        title: "Consultation",
        description:
          "Expert consultation to understand your needs and provide personalized solutions.",
        icon: "chat",
      },
      {
        title: "Support",
        description:
          "Ongoing support and assistance to ensure your satisfaction.",
        icon: "shield",
      },
    ],
    team_members: [
      {
        title: "Alex Morgan",
        role: "Founder & CEO",
        bio: `Leading ${data.name || "our company"} with a passion for excellence.`,
      },
      {
        title: "Sarah Chen",
        role: "Director of Operations",
        bio: "Ensuring smooth operations and exceptional client experiences.",
      },
    ],
    testimonials: [
      {
        title: "Excellent Service",
        quote: "Outstanding experience from start to finish. Highly recommended!",
        author_name: "Jamie Williams",
        author_role: "Client",
        rating: 5,
      },
    ],
  };
}

function getFallbackPages(
  data: OnboardingData,
  content: ContentItems
): PageLayout[] {
  const pages = data.pages || [
    { slug: "home", title: "Home" },
    { slug: "about", title: "About Us" },
    { slug: "contact", title: "Contact" },
  ];
  return pages.map((page) => ({
    slug: page.slug,
    title: page.title,
    seo: {
      meta_title: `${page.title} | ${data.name || "Our Site"}`,
      meta_description: `${page.title} page for ${data.name || "our business"}.`,
    },
    sections:
      page.slug === "home"
        ? [
            {
              component_id: "space_ds:space-hero-banner-style-01",
              props: {
                title: `Welcome to ${data.name || "Our Site"}`,
                sub_headline: data.idea || "Your trusted partner",
              },
            },
            {
              component_id: "space_ds:space-text-media-default",
              props: {
                title: "Our Services",
                description: (content.services || [])
                  .map((s) => `${s.title}: ${s.description}`)
                  .join("\n\n"),
              },
            },
            {
              component_id: "space_ds:space-cta-banner-type-1",
              props: {
                title: "Ready to get started?",
                description: "Contact us today for a free consultation.",
              },
            },
          ]
        : page.slug === "contact"
          ? [
              {
                component_id: "space_ds:space-hero-banner-style-03",
                props: {
                  title: "Get in Touch",
                  sub_headline: "We'd love to hear from you.",
                },
              },
              {
                component_id: "space_ds:space-text-media-default",
                props: {
                  title: "Send us a message",
                  description:
                    "Fill out the form below and we'll get back to you as soon as possible.",
                },
              },
              {
                component_id: "space_ds:space-form",
                props: { _form_placeholder: true },
              },
              {
                component_id: "space_ds:space-cta-banner-type-1",
                props: {
                  title: "Need immediate assistance?",
                  description: `Call us or visit our office for a quick response.`,
                },
              },
            ]
          : [
              {
                component_id: "space_ds:space-hero-banner-style-03",
                props: {
                  title: page.title,
                  sub_headline: `Learn more about ${page.title.toLowerCase()}.`,
                },
              },
              {
                component_id: "space_ds:space-text-media-default",
                props: {
                  title: page.title,
                  description: `Welcome to our ${page.title.toLowerCase()} page.`,
                },
              },
            ],
  }));
}

function getFallbackFormFields(): FormField[] {
  return [
    { name: "name", type: "text", label: "Your Name", required: true },
    {
      name: "email",
      type: "email",
      label: "Email Address",
      required: true,
    },
    {
      name: "phone",
      type: "tel",
      label: "Phone Number",
      required: false,
    },
    { name: "message", type: "textarea", label: "Message", required: true },
  ];
}

/**
 * Map onboarding color roles to Space DS native setting keys.
 *
 * Accepts both native keys (pass-through) and legacy generic keys
 * (primary, secondary, accent, etc.) and auto-derives background colors
 * from the brand palette when not explicitly provided.
 */
function mapColorsToSpaceDS(
  colors: Record<string, string>
): Record<string, string> {
  const LEGACY_MAP: Record<string, string> = {
    brand: "base_brand_color",
    base: "base_brand_color",
    primary: "accent_color_primary",
    secondary: "accent_color_secondary",
    neutral: "neutral_color",
    text: "neutral_color",
    heading: "heading_color",
    accent: "accent_color_primary",
    muted: "gray_color",
    dark: "heading_color",
    light: "background_color_2",
  };

  const NATIVE_KEYS = new Set([
    "base_brand_color",
    "accent_color_primary",
    "accent_color_secondary",
    "neutral_color",
    "heading_color",
    "border_color",
    "gray_color",
    "success_color",
    "danger_color",
    "warning_color",
    "info_color",
    ...Array.from({ length: 10 }, (_, i) => `background_color_${i + 1}`),
  ]);

  const result: Record<string, string> = {};

  // Map input colors to native keys.
  for (const [key, value] of Object.entries(colors)) {
    if (!value) continue;
    if (NATIVE_KEYS.has(key)) {
      result[key] = value;
    } else if (LEGACY_MAP[key]) {
      // Only set if not already provided as a native key.
      if (!result[LEGACY_MAP[key]]) {
        result[LEGACY_MAP[key]] = value;
      }
    }
  }

  // Auto-derive background colors if not explicitly provided.
  // Uses the brand color to create a harmonious 10-shade palette.
  const brandColor = result.base_brand_color || result.accent_color_primary;
  if (brandColor && !result.background_color_1) {
    const bgDefaults: Record<string, string> = {
      background_color_1: "#ffffff",
      background_color_2: "#f8f9fa",
      background_color_3: "#e2e6ea",
      background_color_4: "#ced4da",
      background_color_5: "#adb5bd",
      background_color_6: "#6c757d",
      background_color_7: "#343a40",
      background_color_8: result.accent_color_primary || "#007bff",
      background_color_9: mixHexColors(brandColor, "#ffffff", 0.9),
      background_color_10: result.accent_color_secondary || "#dc3545",
    };
    for (const [bgKey, bgValue] of Object.entries(bgDefaults)) {
      if (!result[bgKey]) {
        result[bgKey] = bgValue;
      }
    }
  }

  return result;
}

/**
 * Simple hex color mixer: blends color1 toward color2 by ratio (0-1).
 */
function mixHexColors(hex1: string, hex2: string, ratio: number): string {
  const parse = (h: string) => {
    const c = h.replace("#", "");
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = parse(hex1);
  const [r2, g2, b2] = parse(hex2);
  const mix = (a: number, b: number) =>
    Math.round(a + (b - a) * ratio)
      .toString(16)
      .padStart(2, "0");
  return `#${mix(r1, r2)}${mix(g1, g2)}${mix(b1, b2)}`;
}

export async function generateBlueprint(
  blueprintId: string,
  siteId: string,
  sessionData: OnboardingData
): Promise<BlueprintBundle> {
  const data: OnboardingData = {
    name: sessionData.name || "My Site",
    idea: sessionData.idea || "",
    audience: sessionData.audience || "general audience",
    industry: sessionData.industry || "other",
    tone: sessionData.tone || "professional_warm",
    pages: sessionData.pages || [],
    colors: sessionData.colors || {},
    fonts: sessionData.fonts || { heading: "Inter", body: "Inter" },
    logo_url: sessionData.logo_url,
    compliance_flags: sessionData.compliance_flags || [],
    keywords: sessionData.keywords || [],
  };

  // Step 1: Generate content items
  await updateStep(blueprintId, "site_metadata");
  let content: ContentItems;
  let siteTagline = data.idea || "";
  let siteDescription = "";
  let footerDescription = "";
  let footerDisclaimer = "";
  let ctaText = "Get Started";

  try {
    const contentPrompt = buildContentPrompt({
      name: data.name!,
      idea: data.idea!,
      audience: data.audience!,
      industry: data.industry!,
      tone: data.tone!,
      pages: (data.pages || []).map((p) => p.title),
      compliance_flags: data.compliance_flags!,
    });

    const contentJson = await callAI(contentPrompt);
    const parsed = JSON.parse(contentJson);
    content = {
      services: parsed.services || [],
      team_members: parsed.team_members || [],
      testimonials: parsed.testimonials || [],
    };
    siteTagline = parsed.site_tagline || siteTagline;
    siteDescription = parsed.site_description || siteDescription;
    footerDescription = parsed.footer_description || "";
    footerDisclaimer = parsed.footer_disclaimer || "";
    ctaText = parsed.cta_text || "Get Started";
  } catch {
    content = getFallbackContent(data);
  }

  // Step 2: Generate page layouts
  await updateStep(blueprintId, "page_layouts");
  let pages: PageLayout[];

  try {
    const contentSummary = [
      content.services?.length
        ? `Services: ${content.services.map((s) => s.title).join(", ")}`
        : null,
      content.team_members?.length
        ? `Team: ${content.team_members.map((t) => t.title).join(", ")}`
        : null,
      content.testimonials?.length
        ? `${content.testimonials.length} testimonials available`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const layoutPrompt = buildPageLayoutPrompt({
      name: data.name!,
      industry: data.industry!,
      tone: data.tone!,
      audience: data.audience!,
      pages: data.pages || [
        { slug: "home", title: "Home" },
        { slug: "about", title: "About" },
        { slug: "contact", title: "Contact" },
      ],
      contentSummary,
      compliance_flags: data.compliance_flags!,
    });

    const layoutJson = await callAI(layoutPrompt);
    const parsed = JSON.parse(layoutJson);
    // AI may return { pages: [...] } or just [...]
    pages = Array.isArray(parsed) ? parsed : parsed.pages || [];
  } catch {
    pages = getFallbackPages(data, content);
  }

  // Attach Canvas component trees to each page
  for (const page of pages) {
    page.component_tree = buildComponentTree(page.sections);
  }

  // Step 3: Generate form fields
  await updateStep(blueprintId, "forms");
  let formFields: FormField[];

  try {
    const formPrompt = buildFormPrompt({
      name: data.name!,
      industry: data.industry!,
      audience: data.audience!,
      compliance_flags: data.compliance_flags!,
    });

    const formJson = await callAI(formPrompt);
    const parsed = JSON.parse(formJson);
    formFields = parsed.fields || [];
  } catch {
    formFields = getFallbackFormFields();
  }

  // Note: In Space DS v2, contact pages use space-contact-card molecules
  // composed in flexi grids instead of form atoms. The contact form injection
  // via buildFormTree has been removed — contact sections are now handled
  // entirely through composition patterns in buildComponentTree.

  // Step 4: Generate header and footer component trees
  const contactPage = pages.find(
    (p) => p.slug === "contact" || p.slug === "contact-us"
  );
  const ctaUrl = contactPage ? `/${contactPage.slug}` : "/contact";

  const headerTree = buildHeaderTree(
    data.name!,
    (data.pages || []).map((p) => ({ slug: p.slug, title: p.title })),
    {
      logoUrl: data.logo_url,
      menuAlign: "center",
      ctaText,
      ctaUrl,
    }
  );

  const defaultLegalLinks = [
    { title: "Privacy Policy", url: "/privacy" },
    { title: "Terms of Service", url: "/terms" },
  ];

  const footerNavLinks = (data.pages || []).map((p) => ({
    title: p.title,
    url: `/${p.slug}`,
  }));

  const defaultSocialLinks = [
    { platform: "Facebook", url: "https://facebook.com", icon: "facebook-logo" },
    { platform: "Twitter", url: "https://twitter.com", icon: "twitter-logo" },
    { platform: "Instagram", url: "https://instagram.com", icon: "instagram-logo" },
    { platform: "LinkedIn", url: "https://linkedin.com", icon: "linkedin-logo" },
  ];

  const footerTree = buildFooterTree(
    { name: data.name!, tagline: siteTagline },
    {
      brandDescription: footerDescription || siteDescription,
      disclaimer: footerDisclaimer || undefined,
      navLinks: footerNavLinks,
      socialLinks: defaultSocialLinks,
      legalLinks: defaultLegalLinks,
    }
  );

  const header: HeaderConfig = {
    menu_align: "center",
    cta_text: ctaText,
    cta_url: ctaUrl,
    component_tree: headerTree,
  };

  const footer: FooterConfig = {
    brand_description: footerDescription || siteDescription,
    disclaimer: footerDisclaimer || undefined,
    legal_links: defaultLegalLinks,
    component_tree: footerTree,
  };

  // Map onboarding colors to Space DS native token names.
  const brandColors = mapColorsToSpaceDS(data.colors || {});

  // Assemble blueprint
  const blueprint: BlueprintBundle = {
    site: {
      name: data.name!,
      tagline: siteTagline,
      industry: data.industry!,
      audience: data.audience!,
      compliance_flags: data.compliance_flags!,
      tone: data.tone!,
    },
    brand: {
      colors: brandColors,
      fonts: data.fonts!,
      logo_url: data.logo_url,
    },
    pages,
    content,
    forms: {
      contact: { fields: formFields },
    },
    header,
    footer,
  };

  // Save to DB
  await prisma.blueprint.update({
    where: { id: blueprintId },
    data: {
      payload: JSON.parse(JSON.stringify(blueprint)),
      status: "ready",
      generationStep: "ready",
    },
  });

  // Look up user email for provisioning.
  const siteRecord = await prisma.site.findUnique({
    where: { id: siteId },
    include: { user: { select: { email: true } } },
  });

  const subdomain = generateSubdomain(data.name || "site");

  await prisma.site.update({
    where: { id: siteId },
    data: { status: "provisioning", subdomain },
  });

  // Auto-trigger provisioning (fire-and-forget).
  spawnProvisioning({
    siteId,
    siteName: data.name!,
    email: siteRecord?.user?.email || data.name!,
    industry: data.industry!,
    subdomain,
    blueprintPayload: JSON.parse(JSON.stringify(blueprint)),
  }).catch((err) => {
    console.error("[provisioning] Failed to spawn:", err);
    prisma.site
      .update({ where: { id: siteId }, data: { status: "blueprint_ready" } })
      .catch(() => {});
  });

  return blueprint;
}
