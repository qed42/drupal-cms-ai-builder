export const ONBOARDING_STEPS = [
  { slug: "start", label: "Welcome" },
  { slug: "theme", label: "Theme" },
  { slug: "name", label: "Project Name" },
  { slug: "idea", label: "Big Idea" },
  { slug: "audience", label: "Audience" },
  { slug: "pages", label: "Page Map" },
  { slug: "design", label: "Design Source" },
  { slug: "brand", label: "Brand" },
  { slug: "fonts", label: "Fonts" },
  { slug: "follow-up", label: "Details" },
  { slug: "tone", label: "Tone & Voice" },
  { slug: "review-settings", label: "Review & Generate" },
] as const;

export type StepSlug = (typeof ONBOARDING_STEPS)[number]["slug"];

export const STEP_SECTIONS = [
  { name: "Vision", steps: ["start", "theme", "name", "idea", "audience"] },
  { name: "Design", steps: ["pages", "design", "brand", "fonts"] },
  { name: "Content", steps: ["follow-up", "tone"] },
  { name: "Launch", steps: ["review-settings"] },
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
