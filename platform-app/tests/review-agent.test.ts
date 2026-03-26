import { describe, it, expect } from "vitest";
import { reviewPage, estimateWordCount, formatReviewLog } from "../src/lib/pipeline/phases/review";
import type { ReviewInput, ReviewPageSection } from "../src/lib/pipeline/phases/review";

// ---------------------------------------------------------------------------
// Helpers — build test fixtures
// ---------------------------------------------------------------------------

function makeSection(
  componentId: string,
  props: Record<string, unknown> = {},
  extra?: { children?: Array<{ component_id: string; slot: string; props: Record<string, unknown> }>; pattern?: string }
): ReviewPageSection {
  return { component_id: componentId, props, ...extra };
}

function makeHomePage(sections: ReviewPageSection[], seo?: { meta_title: string; meta_description: string }) {
  return {
    slug: "home",
    title: "Home",
    seo: seo ?? { meta_title: "Best Dental Care in Portland | SmileBright Dental", meta_description: "SmileBright Dental offers professional dental care in Portland. Book your appointment today for cleanings, implants, and cosmetic dentistry." },
    sections,
  };
}

function makeInput(overrides: Partial<ReviewInput> = {}): ReviewInput {
  const servicesText = "We provide exceptional dental care with over 15 years of experience serving the Portland community. Our team of certified dentists offers comprehensive services including regular cleanings, dental implants, cosmetic dentistry, teeth whitening, and orthodontics for families and individuals. We use the latest dental technology and techniques to ensure comfortable, effective treatments. Every patient receives a personalized treatment plan designed to address their unique dental needs and goals. From preventive care to complex restorative procedures, our Portland dental clinic is equipped to handle all aspects of your oral health. We also offer emergency dental services for unexpected situations that require immediate attention. Our friendly and compassionate team makes every visit as comfortable as possible, using gentle techniques and modern anesthesia options to minimize discomfort during procedures.";
  const aboutText = "We have served 500+ clients with a commitment to gentle, professional dental care. Our modern Portland clinic features the latest dental technology including digital X-rays and laser dentistry. Our dentists are board-certified with specialized training in cosmetic and restorative procedures. We believe everyone deserves a healthy, beautiful smile and we work to make dental care accessible and affordable for our entire community. SmileBright Dental has been a trusted name in Portland since 2010, consistently earning five-star reviews from satisfied patients. We participate in community outreach programs and provide discounted dental services to underserved populations. Our state-of-the-art facility includes private treatment rooms, a comfortable waiting area, and the most advanced diagnostic and treatment equipment available in modern dentistry.";
  const sections = [
    makeSection("space_ds:space-hero-banner-style-01", { title: "Expert Dental Care in Portland — Smiles That Last a Lifetime", sub_headline: "Your trusted dental care provider in Portland Oregon offering comprehensive dental services including cleanings, implants, cosmetic dentistry, and emergency care for the whole family" }),
    makeSection("space_ds:space-text-media-with-checklist", { title: "Our Dental Care Services", description: servicesText }),
    makeSection("space_ds:space-text-media-default", { title: "Why Choose SmileBright Dental", description: aboutText }),
    makeSection("space_ds:space-stats-kpi", { title: "SmileBright Dental By The Numbers", stats: [{ value: "15+", label: "Years of dental care experience in Portland" }, { value: "500+", label: "Happy patients and families served" }, { value: "4.9", label: "Average star rating from patient reviews" }] }),
    makeSection("space_ds:space-testimony-card", { title: "What Our Patients Say About Our Dental Care", quote: "Excellent dental care service! The team at SmileBright is professional and caring. Our whole family trusts them with our dental health. The facilities are modern, clean, and welcoming. I would highly recommend SmileBright Dental to anyone looking for a trusted dental care provider in the Portland area.", author_name: "Sarah M.", author_role: "Patient since 2018" }),
    makeSection("space_ds:space-text-media-with-images", { title: "Our Modern Portland Dental Facility", description: "Our state-of-the-art dental clinic in Portland features private treatment rooms, digital X-rays, laser dentistry equipment, and a comfortable waiting area. We invest in the latest dental technology to provide you with the most effective and comfortable care possible." }),
    makeSection("space_ds:space-cta-banner-type-1", { title: "Book Your Dental Care Appointment Today in Portland", description: "Ready for a healthier smile? Our Portland dental care team is here for you. Contact us at /contact to schedule your appointment today. New patients receive a complimentary consultation and comprehensive dental exam. We accept most major dental insurance plans and offer flexible payment options for all dental care procedures." }),
  ];

  return {
    page: makeHomePage(sections),
    planPage: {
      slug: "home",
      title: "Home",
      targetKeywords: ["dental care", "Portland dentist"],
      sections: [
        { type: "hero", heading: "Welcome", estimatedWordCount: 40 },
        { type: "features", heading: "Services", estimatedWordCount: 150 },
        { type: "text", heading: "Why Choose Us", estimatedWordCount: 150 },
        { type: "stats", heading: "By The Numbers", estimatedWordCount: 30 },
        { type: "testimonials", heading: "Testimonials", estimatedWordCount: 80 },
        { type: "text", heading: "Our Facility", estimatedWordCount: 60 },
        { type: "cta", heading: "Book Now", estimatedWordCount: 30 },
      ],
    },
    research: {
      industry: "dental",
      keyMessages: ["Professional dental care in Portland"],
      targetAudience: { primary: "families and individuals" },
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// estimateWordCount utility
// ---------------------------------------------------------------------------

describe("estimateWordCount", () => {
  it("counts words in string props", () => {
    expect(estimateWordCount({ title: "Hello World", description: "This is a test" })).toBe(6);
  });

  it("ignores non-string props", () => {
    expect(estimateWordCount({ title: "Two words", count: 42, active: true })).toBe(2);
  });

  it("returns 0 for empty props", () => {
    expect(estimateWordCount({})).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Content Depth Checks (TASK-290)
// ---------------------------------------------------------------------------

describe("Content Depth Checks", () => {
  it("section-count: PASS when Home has 7 sections", () => {
    const result = reviewPage(makeInput());
    const check = result.checks.find((c) => c.name === "section-count");
    expect(check?.passed).toBe(true);
  });

  it("section-count: FAIL when Home has 2 sections", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome" }),
        makeSection("space_ds:space-cta-banner-type-1", { title: "Contact Us" }),
      ]),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "section-count");
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("error");
    expect(check?.fix).toBeDefined();
  });

  it("total-word-count: PASS when Home has 400+ words", () => {
    const result = reviewPage(makeInput());
    const totalWords = result.checks.find((c) => c.name === "total-word-count");
    // Our test fixture has enough text
    expect(totalWords).toBeDefined();
  });

  it("total-word-count: FAIL when Home has <400 words", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "Hi" }),
        makeSection("space_ds:space-text-media-default", { title: "Short" }),
        makeSection("space_ds:space-text-media-with-checklist", { title: "Brief" }),
        makeSection("space_ds:space-testimony-card", { title: "OK" }),
        makeSection("space_ds:space-cta-banner-type-1", { title: "Go" }),
      ]),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "total-word-count");
    expect(check?.passed).toBe(false);
  });

  it("no-placeholders: PASS when no placeholder text", () => {
    const result = reviewPage(makeInput());
    const check = result.checks.find((c) => c.name === "no-placeholders");
    expect(check?.passed).toBe(true);
  });

  it("no-placeholders: FAIL when props contain 'Lorem ipsum'", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "Lorem ipsum dolor sit amet" }),
        makeSection("space_ds:space-text-media-default", { title: "Content" }),
        makeSection("space_ds:space-text-media-with-checklist", { title: "More" }),
        makeSection("space_ds:space-testimony-card", { title: "Review" }),
        makeSection("space_ds:space-cta-banner-type-1", { title: "CTA" }),
      ]),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "no-placeholders");
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("error");
  });

  it("visual-rhythm: PASS with varied components", () => {
    const result = reviewPage(makeInput());
    const check = result.checks.find((c) => c.name === "visual-rhythm");
    expect(check?.passed).toBe(true);
  });

  it("visual-rhythm: WARN when consecutive identical components", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome" }),
        makeSection("space_ds:space-text-media-default", { title: "First" }),
        makeSection("space_ds:space-text-media-default", { title: "Second" }),
        makeSection("space_ds:space-testimony-card", { title: "Review" }),
        makeSection("space_ds:space-cta-banner-type-1", { title: "CTA" }),
      ]),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "visual-rhythm");
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("warning");
  });

  it("required-sections: PASS when Home has hero, features, testimonials, cta", () => {
    const result = reviewPage(makeInput());
    const check = result.checks.find((c) => c.name === "required-sections");
    expect(check?.passed).toBe(true);
  });

  it("required-sections: FAIL when Home missing CTA", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome" }),
        makeSection("space_ds:space-text-media-with-checklist", { title: "Features" }),
        makeSection("space_ds:space-text-media-default", { title: "About" }),
        makeSection("space_ds:space-testimony-card", { title: "Reviews" }),
        makeSection("space_ds:space-text-media-with-images", { title: "Gallery" }),
      ]),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "required-sections");
    expect(check?.passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SEO Checks (TASK-291)
// ---------------------------------------------------------------------------

describe("SEO Checks", () => {
  it("meta-title-length: PASS for 50-60 char title", () => {
    const result = reviewPage(makeInput());
    const check = result.checks.find((c) => c.name === "meta-title-length");
    // "Best Dental Care in Portland | SmileBright Dental" is ~50 chars
    expect(check).toBeDefined();
  });

  it("meta-title-length: WARN when title is too long", () => {
    const input = makeInput({
      page: makeHomePage(
        makeInput().page.sections,
        {
          meta_title: "This Is An Extremely Long Meta Title That Exceeds The Sixty Character Limit For Search Engines",
          meta_description: "SmileBright Dental offers professional dental care in Portland. Book your appointment today for cleanings, implants, and cosmetic dentistry services.",
        }
      ),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "meta-title-length");
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("warning");
  });

  it("meta-title-keyword: PASS when keyword present", () => {
    const result = reviewPage(makeInput());
    const check = result.checks.find((c) => c.name === "meta-title-keyword");
    // "Best Dental Care in Portland" contains "dental care"
    expect(check?.passed).toBe(true);
  });

  it("meta-title-keyword: WARN when no keyword", () => {
    const input = makeInput({
      page: makeHomePage(
        makeInput().page.sections,
        {
          meta_title: "Welcome to Our Amazing Website Today",
          meta_description: "Visit our website for great services and more information about what we offer.",
        }
      ),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "meta-title-keyword");
    expect(check?.passed).toBe(false);
  });

  it("hero-heading: PASS when hero has title", () => {
    const result = reviewPage(makeInput());
    const check = result.checks.find((c) => c.name === "hero-heading");
    expect(check?.passed).toBe(true);
  });

  it("hero-heading: FAIL when hero has empty title", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "", sub_headline: "Something" }),
        makeSection("space_ds:space-text-media-with-checklist", { title: "Features" }),
        makeSection("space_ds:space-text-media-default", { title: "Content" }),
        makeSection("space_ds:space-testimony-card", { title: "Reviews" }),
        makeSection("space_ds:space-cta-banner-type-1", { title: "CTA" }),
      ]),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "hero-heading");
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("error");
  });

  it("keyword-distribution: PASS when keywords in 2+ sections", () => {
    const result = reviewPage(makeInput());
    const check = result.checks.find((c) => c.name === "keyword-distribution");
    // "dental care" appears in hero and text sections
    expect(check?.passed).toBe(true);
  });

  it("cta-internal-links: PASS when CTA has /contact", () => {
    const result = reviewPage(makeInput());
    const check = result.checks.find((c) => c.name === "cta-internal-links");
    expect(check?.passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GEO Checks (TASK-292)
// ---------------------------------------------------------------------------

describe("GEO Checks", () => {
  it("entity-clarity: PASS when industry mentioned in content", () => {
    const result = reviewPage(makeInput());
    const check = result.checks.find((c) => c.name === "entity-clarity");
    expect(check?.passed).toBe(true);
  });

  it("entity-clarity: WARN when industry not mentioned", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome to Our Company" }),
        makeSection("space_ds:space-text-media-with-checklist", { title: "Features", description: "We offer great services" }),
        makeSection("space_ds:space-text-media-default", { title: "About Us", description: "A great company" }),
        makeSection("space_ds:space-testimony-card", { title: "Reviews" }),
        makeSection("space_ds:space-cta-banner-type-1", { title: "Contact" }),
      ]),
      research: { industry: "aerospace", keyMessages: ["Innovation"], targetAudience: { primary: "engineers" } },
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "entity-clarity");
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("warning");
  });

  it("structured-claims: PASS when numeric claims present", () => {
    const result = reviewPage(makeInput());
    const check = result.checks.find((c) => c.name === "structured-claims");
    // "15 years of experience" and "500+ clients" in fixture
    expect(check?.passed).toBe(true);
  });

  it("faq-presence: WARN when no accordion in site", () => {
    const input = makeInput({ sitePages: [] });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "faq-presence");
    // No accordion in default fixture
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("warning");
  });

  it("faq-presence: PASS when accordion exists in another page", () => {
    const input = makeInput({
      sitePages: [
        { slug: "faq", sections: [makeSection("space_ds:space-accordion", { title: "FAQ" })] },
      ],
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "faq-presence");
    expect(check?.passed).toBe(true);
  });

  it("authoritative-voice: PASS when 'we'/'our' used", () => {
    const result = reviewPage(makeInput());
    const check = result.checks.find((c) => c.name === "authoritative-voice");
    // "We provide" and "Our team" in fixture
    expect(check?.passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Hero Heading Quality (TASK-423)
// ---------------------------------------------------------------------------

describe("Hero Heading Quality", () => {
  it("hero-heading-quality: PASS for marketing-grade headline", () => {
    const result = reviewPage(makeInput());
    const check = result.checks.find((c) => c.name === "hero-heading-quality");
    expect(check?.passed).toBe(true);
  });

  it("hero-heading-quality: FAIL for 'Welcome to [Name]'", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome to SmileBright Dental" }),
        makeSection("space_ds:space-text-media-with-checklist", { title: "Services", description: "We provide dental care with 15 years experience for 500+ clients in our modern Portland clinic." }),
        makeSection("space_ds:space-text-media-default", { title: "About", description: "We have served the Portland community with our professional dental team." }),
        makeSection("space_ds:space-testimony-card", { title: "Reviews" }),
        makeSection("space_ds:space-cta-banner-type-1", { title: "Book Now at /contact" }),
      ]),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "hero-heading-quality");
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("error");
    expect(check?.fix).toContain("Replace the hero heading");
  });

  it("hero-heading-quality: FAIL for bare 'Welcome'", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome" }),
        makeSection("space_ds:space-text-media-with-checklist", { title: "Services", description: "We provide dental care with 15 years experience for 500+ clients in our modern Portland clinic." }),
        makeSection("space_ds:space-text-media-default", { title: "About", description: "We have served the Portland community with our professional dental team." }),
        makeSection("space_ds:space-testimony-card", { title: "Reviews" }),
        makeSection("space_ds:space-cta-banner-type-1", { title: "Book Now at /contact" }),
      ]),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "hero-heading-quality");
    expect(check?.passed).toBe(false);
  });

  it("hero-heading: PASS with Mercury heading_text prop", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("mercury:hero-billboard", { heading_text: "Portland's Trusted Dental Care Experts" }),
        makeSection("space_ds:space-text-media-with-checklist", { title: "Services", description: "We provide dental care with 15 years experience for 500+ clients in our modern Portland clinic." }),
        makeSection("space_ds:space-text-media-default", { title: "About", description: "We have served the Portland community with our professional dental team." }),
        makeSection("space_ds:space-testimony-card", { title: "Reviews" }),
        makeSection("space_ds:space-cta-banner-type-1", { title: "Book at /contact" }),
      ]),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "hero-heading");
    expect(check?.passed).toBe(true);
  });

  it("hero-heading: PASS with Mercury child heading_text in hero_slot", () => {
    const input = makeInput({
      page: makeHomePage([
        {
          component_id: "mercury:hero-billboard",
          props: { overlay_opacity: "40%" },
          children: [
            { component_id: "mercury:heading", slot: "hero_slot", props: { heading_text: "Portland's Trusted Dental Care Experts" } },
          ],
        },
        makeSection("space_ds:space-text-media-with-checklist", { title: "Services", description: "We provide dental care with 15 years experience for 500+ clients in our modern Portland clinic." }),
        makeSection("space_ds:space-text-media-default", { title: "About", description: "We have served the Portland community with our professional dental team." }),
        makeSection("space_ds:space-testimony-card", { title: "Reviews" }),
        makeSection("space_ds:space-cta-banner-type-1", { title: "Book at /contact" }),
      ]),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "hero-heading");
    expect(check?.passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Design Checks (TASK-425)
// ---------------------------------------------------------------------------

describe("Design Checks", () => {
  it("consecutive-backgrounds: PASS when no consecutive same background", () => {
    const result = reviewPage(makeInput());
    const check = result.checks.find((c) => c.name === "consecutive-backgrounds");
    expect(check?.passed).toBe(true);
    expect(check?.dimension).toBe("design");
  });

  it("consecutive-backgrounds: WARN when two sections share background", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "Expert Dental Care", container_background: "primary" }),
        makeSection("space_ds:space-text-media-default", { title: "About", container_background: "primary", description: "We provide dental care with 15 years experience for 500+ clients in our modern Portland clinic." }),
        makeSection("space_ds:space-text-media-with-checklist", { title: "Services", description: "We offer comprehensive dental services." }),
        makeSection("space_ds:space-testimony-card", { title: "Reviews" }),
        makeSection("space_ds:space-cta-banner-type-1", { title: "Book at /contact" }),
      ]),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "consecutive-backgrounds");
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("warning");
  });

  it("pattern-variety: WARN for consecutive identical patterns", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "Expert Dental Care" }),
        { component_id: "", props: {}, pattern: "text-image-split-50-50" },
        { component_id: "", props: {}, pattern: "text-image-split-50-50" },
        makeSection("space_ds:space-testimony-card", { title: "Reviews" }),
        makeSection("space_ds:space-cta-banner-type-1", { title: "Book at /contact" }),
      ]),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "pattern-variety");
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("warning");
  });

  it("image-alternation: PASS when text-image patterns alternate", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "Expert Dental Care" }),
        { component_id: "", props: {}, pattern: "text-image-split-50-50" },
        { component_id: "", props: {}, pattern: "image-text-split-33-66" },
        makeSection("space_ds:space-testimony-card", { title: "Reviews" }),
        makeSection("space_ds:space-cta-banner-type-1", { title: "Book at /contact" }),
      ]),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "image-alternation");
    expect(check?.passed).toBe(true);
  });

  it("image-alternation: WARN when consecutive text-image sections have same side", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "Expert Dental Care" }),
        { component_id: "", props: {}, pattern: "text-image-split-50-50" },
        { component_id: "", props: {}, pattern: "text-image-split-66-33" },
        makeSection("space_ds:space-testimony-card", { title: "Reviews" }),
        makeSection("space_ds:space-cta-banner-type-1", { title: "Book at /contact" }),
      ]),
    });
    const result = reviewPage(input);
    const check = result.checks.find((c) => c.name === "image-alternation");
    expect(check?.passed).toBe(false);
    expect(check?.severity).toBe("warning");
  });
});

// ---------------------------------------------------------------------------
// Integration Tests
// ---------------------------------------------------------------------------

describe("reviewPage integration", () => {
  it("returns PASS for well-formed Home page", () => {
    const result = reviewPage(makeInput());
    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThan(0.7);
    expect(result.feedback).toBe("");
  });

  it("returns FAIL with actionable feedback for thin page", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "Hi" }),
        makeSection("space_ds:space-cta-banner-type-1", { title: "Go" }),
      ]),
    });
    const result = reviewPage(input);
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain("CONTENT REVIEW FAILED");
    expect(result.feedback).toContain("section-count");
  });

  it("feedback format is suitable for prompt injection", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "Welcome" }),
        makeSection("space_ds:space-text-media-default", { title: "Short" }),
      ]),
    });
    const result = reviewPage(input);
    expect(result.feedback).toContain("---");
    expect(result.feedback).toContain("Fix:");
  });

  it("score reflects proportion of checks passed", () => {
    const result = reviewPage(makeInput());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.checks.length).toBe(21);
  });
});

// ---------------------------------------------------------------------------
// formatReviewLog
// ---------------------------------------------------------------------------

describe("formatReviewLog", () => {
  it("formats PASS result", () => {
    const result = reviewPage(makeInput());
    const log = formatReviewLog("Home", result);
    expect(log).toContain("[review]");
    expect(log).toContain("PASS");
    expect(log).toContain("depth=");
    expect(log).toContain("seo=");
    expect(log).toContain("geo=");
    expect(log).toContain("design=");
  });

  it("formats FAIL result", () => {
    const input = makeInput({
      page: makeHomePage([
        makeSection("space_ds:space-hero-banner-style-01", { title: "Hi" }),
      ]),
    });
    const result = reviewPage(input);
    const log = formatReviewLog("Home", result);
    expect(log).toContain("FAIL");
  });
});
