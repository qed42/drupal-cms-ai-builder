// TASK-202: Tone sample configurations for onboarding selection

export interface ToneSample {
  id: string;
  name: string;
  description: string;
  sample: string;
}

export const TONE_SAMPLES: ToneSample[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Polished and authoritative",
    sample:
      "We deliver exceptional results through proven methodologies and deep industry expertise. Our team of specialists is committed to helping you achieve measurable outcomes that drive long-term success.",
  },
  {
    id: "warm",
    name: "Warm & Friendly",
    description: "Approachable and caring",
    sample:
      "We're here to help you every step of the way. Think of us as your trusted partner — someone who truly cares about your success and takes the time to understand what matters most to you.",
  },
  {
    id: "bold",
    name: "Bold & Confident",
    description: "Energetic and direct",
    sample:
      "Ready to transform your business? We don't do average. Our bold approach cuts through the noise and delivers results that speak for themselves. Let's make something remarkable together.",
  },
  {
    id: "casual",
    name: "Casual",
    description: "Relaxed and conversational",
    sample:
      "Hey there! We keep things simple and straightforward — no jargon, no fuss. Just honest, quality work that gets the job done. Drop us a line anytime; we'd love to chat.",
  },
];

export const INDUSTRY_DIFFERENTIATOR_PLACEHOLDERS: Record<string, string> = {
  healthcare:
    "e.g., We offer same-day appointments and a patient-first approach with bilingual staff",
  legal:
    "e.g., 20+ years of trial experience with a 95% case success rate and flexible payment plans",
  restaurant:
    "e.g., Farm-to-table ingredients sourced from local farms within 50 miles",
  real_estate:
    "e.g., Hyperlocal market expertise with virtual tours and 48-hour response guarantee",
  professional_services:
    "e.g., Boutique firm offering personalized attention with Fortune 500 experience",
  education:
    "e.g., Small class sizes with mentors who are active industry practitioners",
  ecommerce:
    "e.g., Handcrafted products with a lifetime warranty and free returns",
  nonprofit:
    "e.g., 92 cents of every dollar goes directly to programs, not overhead",
  _default:
    "e.g., What makes your business different from competitors?",
};

export function getDifferentiatorPlaceholder(industry: string): string {
  return (
    INDUSTRY_DIFFERENTIATOR_PLACEHOLDERS[industry] ||
    INDUSTRY_DIFFERENTIATOR_PLACEHOLDERS._default
  );
}
