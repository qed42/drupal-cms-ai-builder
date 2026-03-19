export const ONBOARDING_STEPS = [
  { slug: "start", label: "Welcome" },
  { slug: "name", label: "Project Name" },
  { slug: "idea", label: "Big Idea" },
  { slug: "audience", label: "Audience" },
  { slug: "pages", label: "Page Map" },
  { slug: "design", label: "Design Source" },
  { slug: "brand", label: "Brand" },
  { slug: "fonts", label: "Fonts" },
  { slug: "follow-up", label: "Details" },
  { slug: "tone", label: "Tone & Voice" },
] as const;

export type StepSlug = (typeof ONBOARDING_STEPS)[number]["slug"];

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
