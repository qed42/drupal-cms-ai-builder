// TASK-200: Industry-specific follow-up questions configuration

export interface IndustryQuestion {
  id: string;
  text: string;
  inputType: "text" | "select" | "multi-select";
  options?: string[];
  placeholder?: string;
}

export const INDUSTRY_QUESTIONS: Record<string, IndustryQuestion[]> = {
  healthcare: [
    {
      id: "specialties",
      text: "What are your top 3 specialties or services?",
      inputType: "text",
      placeholder: "e.g., Family Medicine, Pediatrics, Dermatology",
    },
    {
      id: "insurance",
      text: "Do you accept insurance?",
      inputType: "select",
      options: ["Yes — most major plans", "Yes — select plans only", "No — cash pay only", "Not applicable"],
    },
    {
      id: "patient_type",
      text: "Who are your primary patients?",
      inputType: "multi-select",
      options: ["Adults", "Children", "Seniors", "Families", "Athletes", "Corporate/Occupational"],
    },
    {
      id: "booking",
      text: "How do patients book appointments?",
      inputType: "select",
      options: ["Online booking", "Phone only", "Both online and phone", "Walk-ins welcome"],
    },
  ],

  legal: [
    {
      id: "practice_areas",
      text: "What are your primary practice areas?",
      inputType: "text",
      placeholder: "e.g., Personal Injury, Family Law, Criminal Defense",
    },
    {
      id: "consultation",
      text: "Do you offer free consultations?",
      inputType: "select",
      options: ["Yes — always free", "Yes — for certain case types", "No — paid consultations", "Virtual consultations available"],
    },
    {
      id: "service_area",
      text: "What geographic area do you serve?",
      inputType: "text",
      placeholder: "e.g., Greater Chicago area, State of California",
    },
  ],

  restaurant: [
    {
      id: "cuisine",
      text: "What type of cuisine do you serve?",
      inputType: "text",
      placeholder: "e.g., Italian, Farm-to-Table, Sushi",
    },
    {
      id: "services",
      text: "Which services do you offer?",
      inputType: "multi-select",
      options: ["Dine-in", "Takeout", "Delivery", "Catering", "Private events", "Food truck"],
    },
    {
      id: "reservation",
      text: "Do you accept reservations?",
      inputType: "select",
      options: ["Yes — online reservations", "Yes — phone only", "No — first come, first served", "Required for groups of 6+"],
    },
    {
      id: "highlight",
      text: "What makes your dining experience special?",
      inputType: "text",
      placeholder: "e.g., Rooftop seating, live music, locally sourced ingredients",
    },
  ],

  real_estate: [
    {
      id: "property_types",
      text: "What types of properties do you specialize in?",
      inputType: "multi-select",
      options: ["Residential", "Commercial", "Luxury", "Land", "Rentals", "New Construction"],
    },
    {
      id: "service_area",
      text: "What areas do you serve?",
      inputType: "text",
      placeholder: "e.g., Downtown Austin, North Shore suburbs",
    },
    {
      id: "services",
      text: "Which services do you provide?",
      inputType: "multi-select",
      options: ["Buying", "Selling", "Property management", "Investment consulting", "Relocation assistance"],
    },
  ],

  professional_services: [
    {
      id: "services",
      text: "What are your core services?",
      inputType: "text",
      placeholder: "e.g., Tax preparation, IT consulting, Marketing strategy",
    },
    {
      id: "client_type",
      text: "Who are your typical clients?",
      inputType: "multi-select",
      options: ["Small businesses", "Mid-size companies", "Enterprise", "Individuals", "Startups", "Nonprofits"],
    },
    {
      id: "engagement",
      text: "How do clients typically engage with you?",
      inputType: "select",
      options: ["Project-based", "Monthly retainer", "Hourly consulting", "Annual contracts", "Mixed"],
    },
  ],

  education: [
    {
      id: "programs",
      text: "What programs or courses do you offer?",
      inputType: "text",
      placeholder: "e.g., K-12 tutoring, Online coding bootcamp, MBA program",
    },
    {
      id: "format",
      text: "How are your programs delivered?",
      inputType: "multi-select",
      options: ["In-person", "Online live", "Self-paced online", "Hybrid", "On-site corporate training"],
    },
    {
      id: "audience",
      text: "Who are your students?",
      inputType: "multi-select",
      options: ["K-12 students", "College students", "Working professionals", "Career changers", "Hobbyists"],
    },
  ],

  ecommerce: [
    {
      id: "products",
      text: "What types of products do you sell?",
      inputType: "text",
      placeholder: "e.g., Handmade jewelry, Organic skincare, Tech accessories",
    },
    {
      id: "shipping",
      text: "Where do you ship?",
      inputType: "select",
      options: ["Local only", "Nationwide", "International", "Digital products — no shipping"],
    },
    {
      id: "unique_selling",
      text: "What makes your products stand out?",
      inputType: "text",
      placeholder: "e.g., Sustainably sourced, Handcrafted, Patented technology",
    },
  ],

  wellness: [
    {
      id: "modalities",
      text: "What wellness services or modalities do you offer?",
      inputType: "text",
      placeholder: "e.g., Yoga, Massage therapy, Acupuncture, Meditation",
    },
    {
      id: "setting",
      text: "Where do you provide services?",
      inputType: "multi-select",
      options: ["Studio/clinic", "Client's home", "Online/virtual", "Retreats", "Corporate on-site"],
    },
    {
      id: "certifications",
      text: "Do you hold any certifications or licenses?",
      inputType: "select",
      options: ["Yes — nationally certified", "Yes — state licensed", "Yes — multiple certifications", "In progress", "Not applicable"],
    },
  ],

  event_planning: [
    {
      id: "event_types",
      text: "What types of events do you specialize in?",
      inputType: "multi-select",
      options: ["Weddings", "Corporate events", "Conferences", "Private parties", "Fundraisers", "Festivals"],
    },
    {
      id: "service_scope",
      text: "What level of service do you provide?",
      inputType: "select",
      options: ["Full-service planning", "Day-of coordination", "Partial planning", "Venue sourcing only", "All of the above"],
    },
    {
      id: "capacity",
      text: "What event sizes do you typically handle?",
      inputType: "select",
      options: ["Intimate (under 50)", "Medium (50-150)", "Large (150-500)", "Grand (500+)", "All sizes"],
    },
  ],

  nonprofit: [
    {
      id: "mission",
      text: "What is your organization's mission in one sentence?",
      inputType: "text",
      placeholder: "e.g., Providing clean water access to rural communities",
    },
    {
      id: "involvement",
      text: "How can people get involved?",
      inputType: "multi-select",
      options: ["Donate", "Volunteer", "Attend events", "Sponsor", "Partner", "Advocate"],
    },
    {
      id: "impact",
      text: "What is your primary impact area?",
      inputType: "select",
      options: ["Health", "Education", "Environment", "Social justice", "Arts & culture", "Community development", "Animal welfare"],
    },
  ],

  _default: [
    {
      id: "core_offering",
      text: "What is the main product or service you offer?",
      inputType: "text",
      placeholder: "e.g., Web design services, Fitness coaching, Event planning",
    },
    {
      id: "target_market",
      text: "Who is your ideal customer?",
      inputType: "text",
      placeholder: "e.g., Small business owners, Health-conscious millennials",
    },
    {
      id: "location",
      text: "Do you serve a specific geographic area?",
      inputType: "select",
      options: ["Local — single city/town", "Regional — multi-city", "Nationwide", "International", "Online only"],
    },
  ],
};

export function getQuestionsForIndustry(industry: string): IndustryQuestion[] {
  return INDUSTRY_QUESTIONS[industry] || INDUSTRY_QUESTIONS._default;
}
