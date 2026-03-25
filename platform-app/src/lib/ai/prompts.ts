export const INDUSTRY_OPTIONS = [
  "technology",
  "healthcare",
  "legal",
  "food_and_beverage",
  "retail",
  "education",
  "real_estate",
  "finance",
  "manufacturing",
  "creative_and_design",
  "hospitality",
  "fitness_and_wellness",
  "automotive",
  "nonprofit",
  "professional_services",
  "other",
] as const;

export type IndustryType = (typeof INDUSTRY_OPTIONS)[number];

export const INDUSTRY_LABELS: Record<string, string> = {
  technology: "Technology",
  healthcare: "Healthcare",
  legal: "Legal",
  food_and_beverage: "Food & Beverage",
  retail: "Retail",
  education: "Education",
  real_estate: "Real Estate",
  finance: "Finance",
  manufacturing: "Manufacturing",
  creative_and_design: "Creative & Design",
  hospitality: "Hospitality",
  fitness_and_wellness: "Fitness & Wellness",
  automotive: "Automotive",
  nonprofit: "Non-Profit",
  professional_services: "Professional Services",
  other: "Other",
};

export const ANALYZE_PROMPT = `You are a business analyst. Analyze the following business description and audience.

Return a JSON object with exactly these fields:
- "industry": one of ${INDUSTRY_OPTIONS.map((i) => `"${i}"`).join(", ")}
- "keywords": array of 5-10 relevant keywords
- "compliance_flags": array of applicable flags from ["hipaa", "ada", "fair_housing", "attorney_advertising", "gdpr", "ferpa", "pci_dss"]
- "tone": one of "professional_warm", "corporate", "casual", "friendly"
- "detectedServices": array of 2-5 specific services or offerings mentioned or implied in the description

Be specific with industry classification. For example:
- A bakery, cafe, restaurant, or food truck → "food_and_beverage"
- A gym, yoga studio, or personal trainer → "fitness_and_wellness"
- A hotel, B&B, or resort → "hospitality"
- A car dealership or mechanic → "automotive"
- A graphic design studio or photography business → "creative_and_design"
- A software company or IT services → "technology"
- A bank, accounting firm, or financial advisor → "finance"
- A factory or production facility → "manufacturing"
- An online store or retail shop → "retail"
Only use "other" if the business truly does not fit any of the above categories.

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
  technology: [
    { slug: "home", title: "Home", description: "Company overview with product highlights, tech capabilities, and call-to-action", required: true },
    { slug: "products", title: "Products", description: "Product or platform descriptions with features, pricing tiers, and use cases", required: true },
    { slug: "solutions", title: "Solutions", description: "Industry-specific solutions showing how your technology solves real problems", required: false },
    { slug: "about", title: "About Us", description: "Company story, team, and technology vision", required: true },
    { slug: "blog", title: "Blog", description: "Technical articles, product updates, and industry insights", required: false },
    { slug: "contact", title: "Contact", description: "Sales inquiries, support channels, and demo request form", required: true },
  ],
  food_and_beverage: [
    { slug: "home", title: "Home", description: "Showcase with ambiance photos, featured items, and reservation or ordering CTA", required: true },
    { slug: "menu", title: "Menu", description: "Full menu with descriptions, dietary info, and seasonal highlights", required: true },
    { slug: "ordering", title: "Order Online", description: "Online ordering for pickup, delivery, or catering services", required: false },
    { slug: "gallery", title: "Gallery", description: "Photo gallery of dishes, baked goods, drinks, and dining spaces", required: false },
    { slug: "about", title: "About Us", description: "Story, culinary philosophy, and what makes your food special", required: true },
    { slug: "contact", title: "Contact", description: "Location, hours, phone, and catering or event inquiry form", required: true },
  ],
  restaurant: [
    { slug: "home", title: "Home", description: "Restaurant showcase with ambiance photos, featured dishes, and reservation CTA", required: true },
    { slug: "menu", title: "Menu", description: "Full menu with descriptions, dietary info, and seasonal highlights", required: true },
    { slug: "reservations", title: "Reservations", description: "Online reservation system with date, time, and party size selection", required: true },
    { slug: "gallery", title: "Gallery", description: "Photo gallery of dishes, dining spaces, and events", required: false },
    { slug: "about", title: "About Us", description: "Restaurant story, chef background, and culinary philosophy", required: true },
    { slug: "contact", title: "Contact", description: "Location, hours, phone, and catering or event inquiry form", required: true },
  ],
  retail: [
    { slug: "home", title: "Home", description: "Storefront showcase with featured products, promotions, and brand story", required: true },
    { slug: "products", title: "Products", description: "Product catalog with categories, descriptions, and pricing", required: true },
    { slug: "about", title: "About Us", description: "Brand story, values, and what makes your shop unique", required: true },
    { slug: "testimonials", title: "Testimonials", description: "Customer reviews and shopping experiences", required: false },
    { slug: "faq", title: "FAQ", description: "Shipping, returns, sizing, and common product questions", required: false },
    { slug: "contact", title: "Contact", description: "Store location, hours, and customer service contact form", required: true },
  ],
  finance: [
    { slug: "home", title: "Home", description: "Firm overview with service highlights and trust-building credentials", required: true },
    { slug: "services", title: "Services", description: "Financial services offered with scope, approach, and client benefits", required: true },
    { slug: "team", title: "Our Team", description: "Advisor profiles with certifications, experience, and specializations", required: true },
    { slug: "resources", title: "Resources", description: "Financial guides, calculators, and educational content", required: false },
    { slug: "about", title: "About Us", description: "Firm history, philosophy, and fiduciary commitment", required: true },
    { slug: "contact", title: "Contact", description: "Office locations, consultation scheduling, and inquiry form", required: true },
  ],
  manufacturing: [
    { slug: "home", title: "Home", description: "Company overview with capabilities, industries served, and quality commitment", required: true },
    { slug: "products", title: "Products", description: "Product lines with specifications, materials, and applications", required: true },
    { slug: "capabilities", title: "Capabilities", description: "Manufacturing processes, equipment, and capacity details", required: true },
    { slug: "quality", title: "Quality & Certifications", description: "Quality standards, certifications (ISO, etc.), and testing procedures", required: false },
    { slug: "about", title: "About Us", description: "Company history, facilities, and manufacturing expertise", required: true },
    { slug: "contact", title: "Contact", description: "RFQ form, facility address, and sales contact information", required: true },
  ],
  creative_and_design: [
    { slug: "home", title: "Home", description: "Creative showcase with featured work, capabilities, and brand personality", required: true },
    { slug: "portfolio", title: "Portfolio", description: "Gallery of completed projects with case studies and client results", required: true },
    { slug: "services", title: "Services", description: "Creative services offered with process descriptions and deliverables", required: true },
    { slug: "about", title: "About Us", description: "Creative philosophy, team bios, and studio story", required: true },
    { slug: "blog", title: "Blog", description: "Design insights, project spotlights, and creative inspiration", required: false },
    { slug: "contact", title: "Contact", description: "Project inquiry form, studio location, and collaboration details", required: true },
  ],
  hospitality: [
    { slug: "home", title: "Home", description: "Property showcase with stunning imagery, amenities, and booking CTA", required: true },
    { slug: "rooms", title: "Rooms & Suites", description: "Room types with photos, amenities, rates, and availability", required: true },
    { slug: "amenities", title: "Amenities", description: "Facilities, dining, spa, activities, and guest services", required: true },
    { slug: "events", title: "Events & Meetings", description: "Event spaces, wedding venues, and corporate meeting facilities", required: false },
    { slug: "about", title: "About Us", description: "Property story, location highlights, and hospitality philosophy", required: true },
    { slug: "contact", title: "Contact", description: "Reservations, directions, and guest inquiry form", required: true },
  ],
  fitness_and_wellness: [
    { slug: "home", title: "Home", description: "Welcome page with service highlights, trainer features, and booking CTA", required: true },
    { slug: "services", title: "Services", description: "Programs, classes, and wellness services with descriptions and benefits", required: true },
    { slug: "trainers", title: "Our Trainers", description: "Trainer and practitioner profiles with certifications and specialties", required: true },
    { slug: "schedule", title: "Schedule", description: "Class schedule, session availability, and booking information", required: false },
    { slug: "about", title: "About Us", description: "Studio story, wellness philosophy, and community mission", required: true },
    { slug: "contact", title: "Contact", description: "Location, hours, membership inquiries, and contact form", required: true },
  ],
  automotive: [
    { slug: "home", title: "Home", description: "Business showcase with featured vehicles or services and trust signals", required: true },
    { slug: "inventory", title: "Inventory", description: "Vehicle listings or service catalog with details and pricing", required: true },
    { slug: "services", title: "Services", description: "Automotive services offered with descriptions and scheduling", required: true },
    { slug: "about", title: "About Us", description: "Business history, certifications, and customer commitment", required: true },
    { slug: "testimonials", title: "Testimonials", description: "Customer reviews and satisfaction stories", required: false },
    { slug: "contact", title: "Contact", description: "Location, hours, appointment scheduling, and inquiry form", required: true },
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
