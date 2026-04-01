import { describe, it, expect } from "vitest";
import YAML from "yaml";
import {
  directMapProp,
  isPlaceholderValue,
  updateConfigYamlExamples,
  extractPropMeta,
} from "../hydrate";
import type { DirectMapContext } from "../hydrate";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeContext(overrides: Partial<DirectMapContext> = {}): DirectMapContext {
  return {
    sectionType: "hero",
    planHeading: "Welcome to Sunrise Dental",
    planBrief: "Hero section with headline, subheadline, and CTA button",
    siteName: "Sunrise Dental",
    tagline: "Your Smile, Our Priority",
    industry: "healthcare",
    tone: "professional",
    pageSlug: "home",
    services: [
      { title: "General Dentistry", briefDescription: "Comprehensive dental care for the whole family" },
      { title: "Cosmetic Dentistry", briefDescription: "Teeth whitening, veneers, and smile makeovers" },
      { title: "Emergency Care", briefDescription: "Same-day appointments for dental emergencies" },
    ],
    testimonials: [
      { quote: "Best dental experience ever!", authorName: "Sarah Johnson", authorRole: "Patient" },
      { quote: "Professional and caring staff.", authorName: "Mike Chen", authorRole: "Long-time Patient" },
    ],
    teamMembers: [
      { name: "Dr. Emily Carter", role: "Lead Dentist" },
      { name: "Dr. James Wilson", role: "Orthodontist" },
    ],
    ...overrides,
  };
}

const SAMPLE_YAML = `langcode: en
status: true
machineName: hero_banner
name: Hero Banner
required: []
props:
  heading:
    title: Main hero headline
    type: string
    examples:
      - Transform Your Business Today
  subheading:
    title: Supporting text
    type: string
    examples:
      - We deliver exceptional results
  cta_text:
    title: CTA button text
    type: string
    examples:
      - Get Started
  cta_url:
    title: 'https://example.com'
    type: string
    format: uri
    examples:
      - 'https://example.com'
  bg_image:
    title: Hero background image
    type: object
    '$ref': 'json-schema-definitions://canvas.module/image'
    examples:
      - src: 'https://placehold.co/1200x800'
        width: 1200
        height: 800
        alt: Hero background
slots: {}
js:
  original: 'export default function HeroBanner() { return <div/>; }'
css:
  original: ''
`;

// ---------------------------------------------------------------------------
// isPlaceholderValue
// ---------------------------------------------------------------------------

describe("isPlaceholderValue", () => {
  it("detects generic section headings", () => {
    expect(isPlaceholderValue("Section Title")).toBe(true);
    expect(isPlaceholderValue("Feature heading")).toBe(true);
    expect(isPlaceholderValue("Card description")).toBe(true);
  });

  it("detects 'first/second' prefixed placeholders", () => {
    expect(isPlaceholderValue("First feature description")).toBe(true);
    expect(isPlaceholderValue("Second testimonial quote")).toBe(true);
  });

  it("detects 'your/description here' patterns", () => {
    expect(isPlaceholderValue("Your title")).toBe(true);
    expect(isPlaceholderValue("Description here")).toBe(true);
  });

  it("detects lorem ipsum and placeholder text", () => {
    expect(isPlaceholderValue("Lorem ipsum dolor sit amet")).toBe(true);
    expect(isPlaceholderValue("Placeholder text")).toBe(true);
    expect(isPlaceholderValue("Sample heading text")).toBe(true);
    expect(isPlaceholderValue("Example service description")).toBe(true);
  });

  it("does not flag real content", () => {
    expect(isPlaceholderValue("Welcome to Sunrise Dental")).toBe(false);
    expect(isPlaceholderValue("General Dentistry")).toBe(false);
    expect(isPlaceholderValue("Best dental experience ever!")).toBe(false);
    expect(isPlaceholderValue("Book Your Appointment")).toBe(false);
  });

  it("ignores non-string values", () => {
    expect(isPlaceholderValue(42)).toBe(false);
    expect(isPlaceholderValue(null)).toBe(false);
    expect(isPlaceholderValue(undefined)).toBe(false);
    expect(isPlaceholderValue(true)).toBe(false);
    expect(isPlaceholderValue("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// directMapProp — heading / subheading / brand
// ---------------------------------------------------------------------------

describe("directMapProp", () => {
  const ctx = makeContext();

  it("maps heading prop to planSection.heading", () => {
    expect(directMapProp("heading", "string", "Main hero headline", ctx)).toBe("Welcome to Sunrise Dental");
    expect(directMapProp("title", "string", "Title", ctx)).toBe("Welcome to Sunrise Dental");
    expect(directMapProp("section_title", "string", "Title", ctx)).toBe("Welcome to Sunrise Dental");
  });

  it("maps subheading to tagline on hero sections", () => {
    expect(directMapProp("subheading", "string", "old value", ctx)).toBe("Your Smile, Our Priority");
    expect(directMapProp("tagline", "string", "old value", ctx)).toBe("Your Smile, Our Priority");
  });

  it("does not map subheading on non-hero sections", () => {
    const featuresCtx = makeContext({ sectionType: "features" });
    expect(directMapProp("subheading", "string", "old value", featuresCtx)).toBeUndefined();
  });

  it("maps brand_name to siteName", () => {
    expect(directMapProp("brand_name", "string", "old", ctx)).toBe("Sunrise Dental");
    expect(directMapProp("company_name", "string", "old", ctx)).toBe("Sunrise Dental");
    expect(directMapProp("site_name", "string", "old", ctx)).toBe("Sunrise Dental");
  });

  it("maps CTA text by section type", () => {
    expect(directMapProp("cta_text", "string", "old", ctx)).toBe("Get Started");
    const ctaCtx = makeContext({ sectionType: "cta" });
    expect(directMapProp("cta_text", "string", "old", ctaCtx)).toBe("Contact Us");
    const contactCtx = makeContext({ sectionType: "contact" });
    expect(directMapProp("button_text", "string", "old", contactCtx)).toBe("Get in Touch");
  });

  it("maps CTA URL to /contact for hero and cta sections", () => {
    expect(directMapProp("cta_url", "link", "old", ctx)).toBe("/contact");
    const ctaCtx = makeContext({ sectionType: "cta" });
    expect(directMapProp("cta_url", "link", "old", ctaCtx)).toBe("/contact");
  });

  it("maps CTA URL to page slug for other sections", () => {
    const servicesCtx = makeContext({ sectionType: "services", pageSlug: "services" });
    expect(directMapProp("cta_url", "link", "old", servicesCtx)).toBe("/services");
  });

  it("skips image/video/boolean props", () => {
    expect(directMapProp("heading", "image", {}, ctx)).toBeUndefined();
    expect(directMapProp("heading", "video", {}, ctx)).toBeUndefined();
    expect(directMapProp("heading", "boolean", true, ctx)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// directMapProp — service/feature cards
// ---------------------------------------------------------------------------

describe("directMapProp — services", () => {
  const ctx = makeContext({ sectionType: "features" });

  it("maps card_1_title to first service", () => {
    expect(directMapProp("card_1_title", "string", "old", ctx)).toBe("General Dentistry");
    expect(directMapProp("feature_1_name", "string", "old", ctx)).toBe("General Dentistry");
  });

  it("maps card_2_desc to second service description", () => {
    expect(directMapProp("card_2_desc", "string", "old", ctx)).toBe("Teeth whitening, veneers, and smile makeovers");
    expect(directMapProp("feature_2_description", "string", "old", ctx)).toBe("Teeth whitening, veneers, and smile makeovers");
  });

  it("maps card_3_title to third service", () => {
    expect(directMapProp("card_3_title", "string", "old", ctx)).toBe("Emergency Care");
  });

  it("returns undefined for out-of-range card indices", () => {
    expect(directMapProp("card_5_title", "string", "old", ctx)).toBeUndefined();
  });

  it("does not match service patterns on non-service sections", () => {
    const heroCtx = makeContext({ sectionType: "hero" });
    expect(directMapProp("card_1_title", "string", "old", heroCtx)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// directMapProp — testimonials
// ---------------------------------------------------------------------------

describe("directMapProp — testimonials", () => {
  const ctx = makeContext({ sectionType: "testimonials" });

  it("maps quote_1 to first testimonial", () => {
    expect(directMapProp("quote_1", "string", "old", ctx)).toBe("Best dental experience ever!");
  });

  it("maps author_1 to first testimonial author", () => {
    expect(directMapProp("author_1", "string", "old", ctx)).toBe("Sarah Johnson");
  });

  it("maps role_1 to first testimonial author role", () => {
    expect(directMapProp("role_1", "string", "old", ctx)).toBe("Patient");
  });

  it("maps quote_2 to second testimonial", () => {
    expect(directMapProp("quote_2", "string", "old", ctx)).toBe("Professional and caring staff.");
  });

  it("returns undefined for out-of-range testimonials", () => {
    expect(directMapProp("quote_5", "string", "old", ctx)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// directMapProp — team members
// ---------------------------------------------------------------------------

describe("directMapProp — team members", () => {
  const ctx = makeContext({ sectionType: "team" });

  it("maps name_1 to first team member", () => {
    expect(directMapProp("name_1", "string", "old", ctx)).toBe("Dr. Emily Carter");
    expect(directMapProp("member_name_1", "string", "old", ctx)).toBe("Dr. Emily Carter");
  });

  it("maps role_1 to first team member role", () => {
    expect(directMapProp("role_1", "string", "old", ctx)).toBe("Lead Dentist");
  });

  it("maps name_2 to second team member", () => {
    expect(directMapProp("name_2", "string", "old", ctx)).toBe("Dr. James Wilson");
  });
});

// ---------------------------------------------------------------------------
// extractPropMeta
// ---------------------------------------------------------------------------

describe("extractPropMeta", () => {
  it("extracts prop names and types from YAML config", () => {
    const metas = extractPropMeta(SAMPLE_YAML);
    expect(metas).toHaveLength(5);
    expect(metas[0]).toEqual({ name: "heading", type: "string", description: "Main hero headline" });
    expect(metas[1]).toEqual({ name: "subheading", type: "string", description: "Supporting text" });
    expect(metas[2]).toEqual({ name: "cta_text", type: "string", description: "CTA button text" });
    expect(metas[3]).toEqual({ name: "cta_url", type: "link", description: "https://example.com" });
    expect(metas[4]).toEqual({ name: "bg_image", type: "image", description: "Hero background image" });
  });

  it("returns empty array for invalid YAML", () => {
    expect(extractPropMeta("{ not valid yaml [")).toEqual([]);
  });

  it("returns empty array for YAML without props", () => {
    expect(extractPropMeta("langcode: en\nstatus: true")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// updateConfigYamlExamples
// ---------------------------------------------------------------------------

describe("updateConfigYamlExamples", () => {
  it("updates string examples with hydrated values", () => {
    const result = updateConfigYamlExamples(SAMPLE_YAML, {
      heading: "Welcome to Sunrise Dental",
      subheading: "Your Smile, Our Priority",
      cta_text: "Book Now",
    });

    const parsed = YAML.parse(result);
    expect(parsed.props.heading.examples).toEqual(["Welcome to Sunrise Dental"]);
    expect(parsed.props.subheading.examples).toEqual(["Your Smile, Our Priority"]);
    expect(parsed.props.cta_text.examples).toEqual(["Book Now"]);
  });

  it("skips image object props", () => {
    const result = updateConfigYamlExamples(SAMPLE_YAML, {
      bg_image: { src: "https://example.com/img.jpg", alt: "test" },
    });
    const parsed = YAML.parse(result);
    // Image examples should remain unchanged
    expect(parsed.props.bg_image.examples[0].src).toBe("https://placehold.co/1200x800");
  });

  it("returns unchanged YAML for invalid input", () => {
    expect(updateConfigYamlExamples("{ not valid [", { heading: "test" })).toBe("{ not valid [");
  });

  it("preserves non-updated props", () => {
    const result = updateConfigYamlExamples(SAMPLE_YAML, {
      heading: "New Heading",
    });
    const parsed = YAML.parse(result);
    // cta_url should be unchanged
    expect(parsed.props.cta_url.examples).toEqual(["https://example.com"]);
    expect(parsed.props.cta_url.format).toBe("uri");
  });
});
