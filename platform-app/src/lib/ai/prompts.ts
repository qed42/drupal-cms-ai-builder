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
- "description": One sentence explaining what this page will contain and its purpose for the business
- "required": boolean — true for essential pages, false for optional

Industry: {industry}
Business idea: {idea}
Target audience: {audience}

Always include "home" and "contact" as required pages. Add industry-appropriate pages.
Each description should be specific to the business idea, not generic.

Return ONLY a valid JSON array, no markdown or explanation.`;

export interface DefaultPage {
  slug: string;
  title: string;
  description: string;
  required: boolean;
}

export const INDUSTRY_DEFAULT_PAGES: Record<string, DefaultPage[]> = {
  healthcare: [
    { slug: "home", title: "Home", description: "Welcome page with practice overview, key services, and patient trust signals", required: true },
    { slug: "services", title: "Services", description: "Detailed descriptions of medical services and specialties offered", required: true },
    { slug: "providers", title: "Our Providers", description: "Provider bios with credentials, specialties, and patient-friendly introductions", required: true },
    { slug: "patient-portal", title: "Patient Portal", description: "Access point for appointment scheduling, records, and patient resources", required: false },
    { slug: "about", title: "About Us", description: "Practice history, mission, values, and what makes your care different", required: true },
    { slug: "contact", title: "Contact", description: "Location, hours, phone number, and appointment request form", required: true },
  ],
  legal: [
    { slug: "home", title: "Home", description: "Firm overview with practice highlights and call-to-action for consultations", required: true },
    { slug: "practice-areas", title: "Practice Areas", description: "Detailed breakdown of legal services with case type explanations", required: true },
    { slug: "attorneys", title: "Our Attorneys", description: "Attorney profiles with experience, bar admissions, and notable results", required: true },
    { slug: "case-results", title: "Case Results", description: "Notable verdicts and settlements demonstrating firm track record", required: false },
    { slug: "about", title: "About Us", description: "Firm history, values, and commitment to client advocacy", required: true },
    { slug: "contact", title: "Contact", description: "Office locations, consultation scheduling, and inquiry form", required: true },
  ],
  real_estate: [
    { slug: "home", title: "Home", description: "Featured listings, market highlights, and quick property search", required: true },
    { slug: "listings", title: "Property Listings", description: "Searchable property catalog with filters for price, location, and type", required: true },
    { slug: "agents", title: "Our Agents", description: "Agent profiles with specialties, sold history, and contact info", required: true },
    { slug: "neighborhoods", title: "Neighborhoods", description: "Area guides with market data, schools, and lifestyle information", required: false },
    { slug: "about", title: "About Us", description: "Brokerage story, market expertise, and client success approach", required: true },
    { slug: "contact", title: "Contact", description: "Office locations, agent directory, and property inquiry form", required: true },
  ],
  restaurant: [
    { slug: "home", title: "Home", description: "Restaurant showcase with ambiance photos, featured dishes, and reservation CTA", required: true },
    { slug: "menu", title: "Menu", description: "Full menu with descriptions, dietary info, and seasonal highlights", required: true },
    { slug: "reservations", title: "Reservations", description: "Online reservation system with date, time, and party size selection", required: true },
    { slug: "gallery", title: "Gallery", description: "Photo gallery of dishes, dining spaces, and events", required: false },
    { slug: "about", title: "About Us", description: "Restaurant story, chef background, and culinary philosophy", required: true },
    { slug: "contact", title: "Contact", description: "Location, hours, phone, and catering or event inquiry form", required: true },
  ],
  professional_services: [
    { slug: "home", title: "Home", description: "Company overview with service highlights and client trust signals", required: true },
    { slug: "services", title: "Services", description: "Detailed service descriptions with scope, deliverables, and benefits", required: true },
    { slug: "team", title: "Our Team", description: "Team member profiles with expertise, credentials, and experience", required: true },
    { slug: "testimonials", title: "Testimonials", description: "Client success stories and reviews demonstrating proven results", required: false },
    { slug: "about", title: "About Us", description: "Company history, values, approach, and what sets you apart", required: true },
    { slug: "contact", title: "Contact", description: "Office info, consultation booking, and general inquiry form", required: true },
  ],
  other: [
    { slug: "home", title: "Home", description: "Welcome page with business overview and key value propositions", required: true },
    { slug: "about", title: "About Us", description: "Your story, mission, and what makes your business unique", required: true },
    { slug: "services", title: "Services", description: "Detailed descriptions of what you offer and how it helps customers", required: true },
    { slug: "blog", title: "Blog", description: "Articles, news, and insights to engage visitors and build authority", required: false },
    { slug: "faq", title: "FAQ", description: "Answers to common questions to help visitors make decisions", required: false },
    { slug: "contact", title: "Contact", description: "Location, hours, and contact form for inquiries", required: true },
  ],
};

export function getDefaultPages(industry: string) {
  return INDUSTRY_DEFAULT_PAGES[industry] || INDUSTRY_DEFAULT_PAGES.other;
}
