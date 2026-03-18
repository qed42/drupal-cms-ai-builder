export const ANALYZE_PROMPT = `You are a business analyst. Analyze the following business description and audience.

Return a JSON object with exactly these fields:
- "industry": one of "healthcare", "legal", "real_estate", "restaurant", "professional_services", "education", "ecommerce", "nonprofit", "other"
- "keywords": array of 5-10 relevant keywords
- "compliance_flags": array of applicable flags from ["hipaa", "ada", "fair_housing", "attorney_advertising", "gdpr", "ferpa", "pci_dss"]
- "tone": one of "professional_warm", "corporate", "casual", "friendly"

Business idea: {idea}
Target audience: {audience}

Return ONLY valid JSON, no markdown or explanation.`;

export const SUGGEST_PAGES_PROMPT = `You are a web architect. Based on the business details below, suggest 5-8 pages for a website.

Return a JSON array of objects, each with:
- "slug": URL-friendly page slug (e.g., "about-us")
- "title": Human-readable page title (e.g., "About Us")
- "required": boolean — true for essential pages, false for optional

Industry: {industry}
Business idea: {idea}
Target audience: {audience}

Always include "home" and "contact" as required pages. Add industry-appropriate pages.

Return ONLY a valid JSON array, no markdown or explanation.`;

export const INDUSTRY_DEFAULT_PAGES: Record<string, Array<{ slug: string; title: string; required: boolean }>> = {
  healthcare: [
    { slug: "home", title: "Home", required: true },
    { slug: "services", title: "Services", required: true },
    { slug: "providers", title: "Our Providers", required: true },
    { slug: "patient-portal", title: "Patient Portal", required: false },
    { slug: "about", title: "About Us", required: true },
    { slug: "contact", title: "Contact", required: true },
  ],
  legal: [
    { slug: "home", title: "Home", required: true },
    { slug: "practice-areas", title: "Practice Areas", required: true },
    { slug: "attorneys", title: "Our Attorneys", required: true },
    { slug: "case-results", title: "Case Results", required: false },
    { slug: "about", title: "About Us", required: true },
    { slug: "contact", title: "Contact", required: true },
  ],
  real_estate: [
    { slug: "home", title: "Home", required: true },
    { slug: "listings", title: "Property Listings", required: true },
    { slug: "agents", title: "Our Agents", required: true },
    { slug: "neighborhoods", title: "Neighborhoods", required: false },
    { slug: "about", title: "About Us", required: true },
    { slug: "contact", title: "Contact", required: true },
  ],
  restaurant: [
    { slug: "home", title: "Home", required: true },
    { slug: "menu", title: "Menu", required: true },
    { slug: "reservations", title: "Reservations", required: true },
    { slug: "gallery", title: "Gallery", required: false },
    { slug: "about", title: "About Us", required: true },
    { slug: "contact", title: "Contact", required: true },
  ],
  professional_services: [
    { slug: "home", title: "Home", required: true },
    { slug: "services", title: "Services", required: true },
    { slug: "team", title: "Our Team", required: true },
    { slug: "testimonials", title: "Testimonials", required: false },
    { slug: "about", title: "About Us", required: true },
    { slug: "contact", title: "Contact", required: true },
  ],
  other: [
    { slug: "home", title: "Home", required: true },
    { slug: "about", title: "About Us", required: true },
    { slug: "services", title: "Services", required: true },
    { slug: "blog", title: "Blog", required: false },
    { slug: "faq", title: "FAQ", required: false },
    { slug: "contact", title: "Contact", required: true },
  ],
};

export function getDefaultPages(industry: string) {
  return INDUSTRY_DEFAULT_PAGES[industry] || INDUSTRY_DEFAULT_PAGES.other;
}
