export type StepTip = {
  icon: string; // lucide icon name
  title: string;
  body: string;
};

export const ONBOARDING_STEPS = [
  { slug: "start", label: "Get Started" },
  {
    slug: "theme",
    label: "Theme",
    tips: [
      { icon: "Palette", title: "Set the mood", body: "Your theme choice drives the overall visual direction — colors, spacing, and layout style." },
      { icon: "Sparkles", title: "AI adapts to your pick", body: "Archie uses your theme to select matching fonts and component styles." },
      { icon: "RefreshCw", title: "Easy to change later", body: "You can always switch themes in the review step." },
    ] as StepTip[],
  },
  {
    slug: "name",
    label: "Your Name",
    tips: [
      { icon: "Type", title: "This becomes your site title", body: "It appears in the browser tab, search results, and your site header." },
      { icon: "Search", title: "SEO matters", body: "A clear business name helps customers find you on Google." },
      { icon: "RefreshCw", title: "You can change this later", body: "Edit your site name anytime from the review page." },
    ] as StepTip[],
  },
  {
    slug: "idea",
    label: "Your Idea",
    tips: [
      { icon: "Lightbulb", title: "Be specific", body: "The more detail you give, the better Archie can tailor your content and page structure." },
      { icon: "Users", title: "Mention your audience", body: "Include who you serve — Archie uses this to craft targeted messaging." },
      { icon: "RefreshCw", title: "You can change this later", body: "Come back and refine your description anytime." },
    ] as StepTip[],
  },
  {
    slug: "audience",
    label: "Audience",
    tips: [
      { icon: "Target", title: "Think about pain points", body: "What problems do your customers face? This shapes your homepage messaging." },
      { icon: "MapPin", title: "Age and location help", body: "Demographics let Archie choose the right tone and imagery." },
      { icon: "Sparkles", title: "AI will suggest more", body: "Based on your business idea, Archie generates audience suggestions." },
    ] as StepTip[],
  },
  {
    slug: "pages",
    label: "Pages",
    tips: [
      { icon: "LayoutGrid", title: "3-12 pages recommended", body: "Most small business sites work best with 4-8 focused pages." },
      { icon: "Plus", title: "You can add custom pages", body: "Type a page name and Archie will generate content for it." },
      { icon: "Sparkles", title: "AI structures by industry", body: "Archie suggests pages based on what works for your type of business." },
    ] as StepTip[],
  },
  {
    slug: "design",
    label: "Design",
    tips: [
      { icon: "Figma", title: "AI or Figma?", body: "Let Archie generate a design, or import your own from Figma." },
      { icon: "Paintbrush", title: "Design shapes everything", body: "This choice determines component layouts, spacing, and visual hierarchy." },
      { icon: "RefreshCw", title: "You can change this later", body: "Switch design sources from the review page." },
    ] as StepTip[],
  },
  {
    slug: "brand",
    label: "Brand",
    tips: [
      { icon: "Upload", title: "Upload a logo for color extraction", body: "Archie detects your brand colors automatically from your logo." },
      { icon: "FileText", title: "Brand kit PDF works too", body: "Upload a brand guide and Archie extracts your full palette." },
      { icon: "Palette", title: "Colors can be adjusted", body: "Add, remove, or tweak extracted colors before generating." },
    ] as StepTip[],
  },
  {
    slug: "fonts",
    label: "Fonts",
    tips: [
      { icon: "Type", title: "Heading font sets the tone", body: "Bold, serif, or playful — your heading font creates first impressions." },
      { icon: "AlignLeft", title: "Body font for readability", body: "Choose a clean body font so visitors can read your content easily." },
      { icon: "Upload", title: "Custom upload supported", body: "Have a brand font? Upload it and Archie will use it across your site." },
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
    slug: "follow-up",
    label: "Details",
    tips: [
      { icon: "MessageSquare", title: "Specific answers = specific content", body: "The more detail you provide, the less editing you'll need later." },
      { icon: "SkipForward", title: "Skip if unsure", body: "Leave questions blank and Archie will use industry-standard copy." },
      { icon: "Sparkles", title: "AI fills gaps", body: "Archie generates professional content for anything you don't answer." },
    ] as StepTip[],
  },
  {
    slug: "tone",
    label: "Voice",
    tips: [
      { icon: "Mic", title: "Tone applies to all pages", body: "Your chosen voice is used across every heading, paragraph, and CTA." },
      { icon: "Star", title: "Add differentiators", body: "Tell Archie what makes you unique — it weaves this into your copy." },
      { icon: "Link", title: "Reference URLs help", body: "Share websites whose tone you admire and Archie will match the style." },
    ] as StepTip[],
  },
  { slug: "review-settings", label: "Review" },
] as const;

export type StepSlug = (typeof ONBOARDING_STEPS)[number]["slug"];

export const STEP_SECTIONS = [
  { name: "Your Business", steps: ["start", "theme", "name", "idea", "audience"] },
  { name: "Site Structure", steps: ["pages", "design", "brand", "fonts"] },
  { name: "Brand & Style", steps: ["images", "follow-up", "tone"] },
  { name: "Review & Build", steps: ["review-settings"] },
] as const;

export function getSectionForStep(slug: string) {
  for (let i = 0; i < STEP_SECTIONS.length; i++) {
    const section = STEP_SECTIONS[i];
    const stepIndex = (section.steps as readonly string[]).indexOf(slug);
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
  return ONBOARDING_STEPS.findIndex((s) => s.slug === slug);
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
  const step = ONBOARDING_STEPS.find((s) => s.slug === slug);
  if (step && "tips" in step && step.tips) {
    return step.tips as StepTip[];
  }
  return [];
}
