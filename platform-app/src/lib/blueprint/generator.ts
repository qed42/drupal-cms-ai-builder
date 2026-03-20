import { prisma } from "@/lib/prisma";
import { generateSubdomain, spawnProvisioning } from "@/lib/provisioning";
import { getAIProvider } from "@/lib/ai/factory";
import { buildContentPrompt } from "@/lib/ai/prompts/content-generation";
import { buildPageLayoutPrompt } from "@/lib/ai/prompts/page-layout";
import { buildFormPrompt } from "@/lib/ai/prompts/form-generation";
import { buildComponentTree, buildFormTree } from "./component-tree-builder";
import type {
  BlueprintBundle,
  ContentItems,
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

  // Inject form component tree into contact page
  const contactPage = pages.find((p) => p.slug === "contact");
  if (contactPage && contactPage.component_tree) {
    // Find the placeholder space-form item that buildComponentTree created
    // (it will have no children — just a container + empty form).
    const formPlaceholderIdx = contactPage.component_tree.findIndex(
      (item) => item.component_id === "sdc.space_ds.space-form"
    );
    let insertIdx: number;
    if (formPlaceholderIdx !== -1) {
      const formItem = contactPage.component_tree[formPlaceholderIdx];
      // Find the container that wraps this placeholder
      const containerIdx =
        formItem.parent_uuid != null
          ? contactPage.component_tree.findIndex(
              (item) => item.uuid === formItem.parent_uuid
            )
          : -1;
      // Determine the earliest index to use as insertion point
      insertIdx =
        containerIdx !== -1
          ? Math.min(containerIdx, formPlaceholderIdx)
          : formPlaceholderIdx;
      // Remove placeholder items (descending order to preserve indices)
      const indicesToRemove = [formPlaceholderIdx];
      if (containerIdx !== -1) indicesToRemove.push(containerIdx);
      indicesToRemove.sort((a, b) => b - a);
      for (const idx of indicesToRemove) {
        contactPage.component_tree.splice(idx, 1);
      }
    } else {
      // No placeholder found — append before the last item (CTA) if possible
      insertIdx = contactPage.component_tree.length;
    }
    const formTree = buildFormTree(formFields);
    contactPage.component_tree.splice(insertIdx, 0, ...formTree);
  }

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
      colors: data.colors!,
      fonts: data.fonts!,
      logo_url: data.logo_url,
    },
    pages,
    content,
    forms: {
      contact: { fields: formFields },
    },
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
