export type StepTip = {
  icon: string; // lucide icon name
  title: string;
  body: string;
};

export const ONBOARDING_STEPS = [
  { slug: "start", label: "Get Started" },
  {
    slug: "describe",
    label: "Your Business",
    tips: [
      { icon: "Lightbulb", title: "Be specific", body: "The more detail you give, the better Archie can tailor your content and page structure." },
      { icon: "Users", title: "Mention your audience", body: "Include who you serve — Archie uses this to craft targeted messaging." },
      { icon: "RefreshCw", title: "You can change this later", body: "Come back and refine your description anytime." },
    ] as StepTip[],
  },
  {
    slug: "style",
    label: "Style & Tone",
    tips: [
      { icon: "Palette", title: "Set the mood", body: "Your theme choice drives the overall visual direction — colors, spacing, and layout style." },
      { icon: "Mic", title: "Tone applies everywhere", body: "Your chosen voice is used across every heading, paragraph, and CTA." },
      { icon: "RefreshCw", title: "Easy to change later", body: "You can always switch themes and tone in the review step." },
    ] as StepTip[],
  },
  {
    slug: "brand",
    label: "Brand Identity",
    tips: [
      { icon: "Upload", title: "Upload a logo for color extraction", body: "Archie detects your brand colors automatically from your logo." },
      { icon: "Type", title: "Heading font sets the tone", body: "Bold, serif, or playful — your heading font creates first impressions." },
      { icon: "Palette", title: "Colors can be adjusted", body: "Add, remove, or tweak extracted colors before generating." },
    ] as StepTip[],
  },
  {
    slug: "pages",
    label: "Site Pages",
    tips: [
      { icon: "LayoutGrid", title: "3-12 pages recommended", body: "Most small business sites work best with 4-8 focused pages." },
      { icon: "Plus", title: "You can add custom pages", body: "Type a page name and Archie will generate content for it." },
      { icon: "Sparkles", title: "AI structures by industry", body: "Archie suggests pages based on what works for your type of business." },
    ] as StepTip[],
  },
  {
    slug: "images",
    label: "Your Photos",
    tips: [
      { icon: "Image", title: "Your photos replace stock images", body: "Upload real photos and Archie places them in the best spots." },
      { icon: "Sparkles", title: "AI analyzes content", body: "Each photo is analyzed to match it with the right page section." },
      { icon: "Hash", title: "Up to 20 images", body: "Upload your best 5-20 photos for optimal site coverage." },
    ] as StepTip[],
  },
  {
    slug: "details",
    label: "Content Details",
    tips: [
      { icon: "MessageSquare", title: "Specific answers = specific content", body: "The more detail you provide, the less editing you'll need later." },
      { icon: "SkipForward", title: "Skip if unsure", body: "Leave questions blank and Archie will use industry-standard copy." },
      { icon: "Sparkles", title: "AI fills gaps", body: "Archie generates professional content for anything you don't answer." },
    ] as StepTip[],
  },
  { slug: "review-settings", label: "Review & Launch" },
] as const;

export type StepSlug = (typeof ONBOARDING_STEPS)[number]["slug"];

export const STEP_SECTIONS = [
  { name: "Your Business", steps: ["start", "describe"] },
  { name: "Design", steps: ["style", "brand"] },
  { name: "Content", steps: ["pages", "images", "details"] },
  { name: "Launch", steps: ["review-settings"] },
] as const;

/**
 * Maps old step slugs to new ones for session resume and redirects.
 */
export const STEP_SLUG_REDIRECTS: Record<string, string> = {
  name: "describe",
  idea: "describe",
  audience: "describe",
  theme: "style",
  design: "style",
  tone: "style",
  fonts: "brand",
  "follow-up": "details",
};

export function getSectionForStep(slug: string) {
  // Resolve old slugs
  const resolvedSlug = STEP_SLUG_REDIRECTS[slug] || slug;
  for (let i = 0; i < STEP_SECTIONS.length; i++) {
    const section = STEP_SECTIONS[i];
    const stepIndex = (section.steps as readonly string[]).indexOf(resolvedSlug);
    if (stepIndex !== -1) {
      return {
        sectionIndex: i,
        stepIndexInSection: stepIndex,
        sectionStepCount: section.steps.length,
        sectionName: section.name,
      };
    }
  }
  return null;
}

export function getStepIndex(slug: string): number {
  const resolvedSlug = STEP_SLUG_REDIRECTS[slug] || slug;
  return ONBOARDING_STEPS.findIndex((s) => s.slug === resolvedSlug);
}

export function getNextStep(slug: string): string | null {
  const idx = getStepIndex(slug);
  if (idx === -1 || idx >= ONBOARDING_STEPS.length - 1) return null;
  return ONBOARDING_STEPS[idx + 1].slug;
}

export function getPrevStep(slug: string): string | null {
  const idx = getStepIndex(slug);
  if (idx <= 0) return null;
  return ONBOARDING_STEPS[idx - 1].slug;
}

export function getTipsForStep(slug: string): StepTip[] {
  const resolvedSlug = STEP_SLUG_REDIRECTS[slug] || slug;
  const step = ONBOARDING_STEPS.find((s) => s.slug === resolvedSlug);
  if (step && "tips" in step && step.tips) {
    return step.tips as StepTip[];
  }
  return [];
}

/**
 * Resolves an old step slug to its new equivalent.
 * Returns the slug as-is if it's already a valid new step.
 */
export function resolveStepSlug(slug: string): string {
  return STEP_SLUG_REDIRECTS[slug] || slug;
}
