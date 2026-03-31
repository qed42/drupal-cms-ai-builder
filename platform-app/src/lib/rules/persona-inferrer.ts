/**
 * Persona Inferrer (M27).
 *
 * Derives a persona slug from onboarding data using keyword matching.
 * Personas are implicit — users never select them directly.
 */

interface PersonaRule {
  persona: string;
  /** Keywords matched against industry + audience + tone (case-insensitive) */
  keywords: string[];
}

const PERSONA_RULES: PersonaRule[] = [
  {
    persona: "solo-creative",
    keywords: [
      "photography", "photographer", "artist", "illustrator", "designer",
      "freelance", "portfolio", "creative", "musician", "filmmaker",
      "videographer", "writer", "author", "architect",
    ],
  },
  {
    persona: "enterprise",
    keywords: [
      "enterprise", "corporation", "Fortune 500", "compliance",
      "regulated", "financial services", "insurance", "banking",
      "government", "institutional",
    ],
  },
  {
    persona: "small-business",
    keywords: [
      "local", "small business", "shop", "store", "family",
      "neighborhood", "community", "independent", "startup",
      "restaurant", "cafe", "bakery", "salon", "clinic",
      "plumber", "electrician", "contractor", "landscaping",
    ],
  },
];

/**
 * Infer a persona slug from onboarding context.
 * Returns "general" when no keywords match.
 */
export function inferPersona(
  industry: string,
  audience?: string,
  tone?: string
): string {
  const haystack = [industry, audience, tone]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!haystack) return "general";

  for (const rule of PERSONA_RULES) {
    const matched = rule.keywords.some((kw) => haystack.includes(kw.toLowerCase()));
    if (matched) return rule.persona;
  }

  return "general";
}
