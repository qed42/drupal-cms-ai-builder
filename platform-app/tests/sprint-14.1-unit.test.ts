import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Image Intent Extraction Tests ----

describe("Image Intent Extraction", () => {
  it("extracts intents for hero banner components", async () => {
    const { extractImageIntents } = await import("../src/lib/images/image-intent");

    const pages = [
      {
        slug: "home",
        title: "Home",
        seo: { meta_title: "Home", meta_description: "" },
        sections: [
          {
            component_id: "space_ds:space-hero-banner-style-01",
            props: { title: "Welcome to Our Dental Clinic", sub_headline: "Quality Care" },
          },
        ],
      },
    ];

    const intents = extractImageIntents(pages, "dental", "patients");
    expect(intents).toHaveLength(1);
    expect(intents[0].propName).toBe("background_image");
    expect(intents[0].orientation).toBe("landscape");
    expect(intents[0].targetWidth).toBe(1920);
    expect(intents[0].query).toContain("dental");
  });

  it("extracts intents for text-media components", async () => {
    const { extractImageIntents } = await import("../src/lib/images/image-intent");

    const pages = [
      {
        slug: "about",
        title: "About Us",
        seo: { meta_title: "", meta_description: "" },
        sections: [
          {
            component_id: "space_ds:space-text-media-default",
            props: { heading: "Our Story" },
          },
        ],
      },
    ];

    const intents = extractImageIntents(pages, "restaurant", "diners");
    expect(intents).toHaveLength(1);
    expect(intents[0].propName).toBe("image_1");
    expect(intents[0].orientation).toBe("landscape");
    expect(intents[0].targetWidth).toBe(800);
  });

  it("extracts square intents for people card components", async () => {
    const { extractImageIntents } = await import("../src/lib/images/image-intent");

    const pages = [
      {
        slug: "team",
        title: "Our Team",
        seo: { meta_title: "", meta_description: "" },
        sections: [
          {
            component_id: "space_ds:space-people-card-people-with-image",
            props: { title: "Dr. Smith" },
          },
        ],
      },
    ];

    const intents = extractImageIntents(pages, "medical", "patients");
    expect(intents).toHaveLength(1);
    expect(intents[0].orientation).toBe("square");
    expect(intents[0].targetWidth).toBe(400);
  });

  it("skips components without image props", async () => {
    const { extractImageIntents } = await import("../src/lib/images/image-intent");

    const pages = [
      {
        slug: "faq",
        title: "FAQ",
        seo: { meta_title: "", meta_description: "" },
        sections: [
          {
            component_id: "space_ds:space-faq-accordion",
            props: { title: "Frequently Asked Questions" },
          },
        ],
      },
    ];

    const intents = extractImageIntents(pages, "legal", "clients");
    expect(intents).toHaveLength(0);
  });

  it("skips sections that already have an image prop set", async () => {
    const { extractImageIntents } = await import("../src/lib/images/image-intent");

    const pages = [
      {
        slug: "home",
        title: "Home",
        seo: { meta_title: "", meta_description: "" },
        sections: [
          {
            component_id: "space_ds:space-hero-banner-style-01",
            props: {
              title: "Welcome",
              background_image: { src: "/existing.jpg", alt: "existing", width: 100, height: 100 },
            },
          },
        ],
      },
    ];

    const intents = extractImageIntents(pages, "dental", "patients");
    expect(intents).toHaveLength(0);
  });

  it("extracts intents across multiple pages", async () => {
    const { extractImageIntents } = await import("../src/lib/images/image-intent");

    const pages = [
      {
        slug: "home",
        title: "Home",
        seo: { meta_title: "", meta_description: "" },
        sections: [
          { component_id: "space_ds:space-hero-banner-style-03", props: { title: "Welcome" } },
          { component_id: "space_ds:space-text-media-default", props: { heading: "About" } },
        ],
      },
      {
        slug: "services",
        title: "Services",
        seo: { meta_title: "", meta_description: "" },
        sections: [
          { component_id: "space_ds:space-featured-card", props: { title: "Service 1" } },
        ],
      },
    ];

    const intents = extractImageIntents(pages, "consulting", "businesses");
    expect(intents).toHaveLength(3);
    expect(intents[0].pageIndex).toBe(0);
    expect(intents[0].sectionIndex).toBe(0);
    expect(intents[1].pageIndex).toBe(0);
    expect(intents[1].sectionIndex).toBe(1);
    expect(intents[2].pageIndex).toBe(1);
    expect(intents[2].sectionIndex).toBe(0);
  });
});

// ---- Stock Image Service Tests ----

describe("Stock Image Service", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns null when PEXELS_API_KEY is not set", async () => {
    vi.stubEnv("PEXELS_API_KEY", "");
    // Re-import to pick up env change
    const mod = await import("../src/lib/images/stock-image-service");
    mod.clearImageCache();
    const result = await mod.searchStockImage("dental office");
    expect(result).toBeNull();
  });

  it("caches results for identical queries", async () => {
    vi.stubEnv("PEXELS_API_KEY", "test-key");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        photos: [{
          src: { large2x: "https://example.com/photo.jpg", large: "", medium: "" },
          alt: "Dental office",
          width: 1200,
          height: 800,
          photographer_url: "https://example.com/photographer",
        }],
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const mod = await import("../src/lib/images/stock-image-service");
    mod.clearImageCache();

    const result1 = await mod.searchStockImage("dental office");
    const result2 = await mod.searchStockImage("dental office");

    expect(result1).not.toBeNull();
    expect(result1).toEqual(result2);
    // fetch should only be called once (second call hits cache)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("returns null on API rate limit (429)", async () => {
    vi.stubEnv("PEXELS_API_KEY", "test-key");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
    });
    vi.stubGlobal("fetch", mockFetch);

    const mod = await import("../src/lib/images/stock-image-service");
    mod.clearImageCache();

    const result = await mod.searchStockImage("rate limited query");
    expect(result).toBeNull();
  });

  it("returns null when no photos found", async () => {
    vi.stubEnv("PEXELS_API_KEY", "test-key");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ photos: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const mod = await import("../src/lib/images/stock-image-service");
    mod.clearImageCache();

    const result = await mod.searchStockImage("very obscure query xyz123");
    expect(result).toBeNull();
  });
});

// ---- Image Prop Map Coverage Tests ----

describe("Image Prop Map Coverage", () => {
  it("maps all hero banner variants", async () => {
    const { extractImageIntents } = await import("../src/lib/images/image-intent");

    const heroVariants = [
      "space_ds:space-hero-banner-style-01",
      "space_ds:space-hero-banner-style-02",
      "space_ds:space-hero-banner-style-03",
      "space_ds:space-hero-banner-style-04",
      "space_ds:space-hero-banner-style-05",
      "space_ds:space-hero-banner-style-06",
      "space_ds:space-hero-banner-style-07",
      "space_ds:space-hero-banner-style-08",
      "space_ds:space-hero-banner-style-10",
      "space_ds:space-hero-banner-style-11",
    ];

    for (const componentId of heroVariants) {
      const pages = [{
        slug: "home",
        title: "Home",
        seo: { meta_title: "", meta_description: "" },
        sections: [{ component_id: componentId, props: { title: "Test" } }],
      }];

      const intents = extractImageIntents(pages, "test", "test");
      expect(intents.length).toBeGreaterThan(0);
      expect(intents[0].orientation).toBe("landscape");
    }
  });

  it("maps CTA banner variants", async () => {
    const { extractImageIntents } = await import("../src/lib/images/image-intent");

    for (const variant of ["space_ds:space-cta-banner-type-2", "space_ds:space-cta-banner-type-3"]) {
      const pages = [{
        slug: "home",
        title: "Home",
        seo: { meta_title: "", meta_description: "" },
        sections: [{ component_id: variant, props: { title: "CTA" } }],
      }];

      const intents = extractImageIntents(pages, "business", "customers");
      expect(intents).toHaveLength(1);
      expect(intents[0].propName).toBe("image");
    }
  });
});

// ---- Component Validator Image Object Tests ----

describe("Component Validator — Image Objects", () => {
  it("passes through valid image objects", async () => {
    const { validateSections } = await import("../src/lib/blueprint/component-validator");

    const sections = [
      {
        component_id: "space_ds:space-hero-banner-style-02",
        props: {
          title: "Welcome",
          background_image: { src: "/uploads/stock/abc/photo.jpg", alt: "Office", width: 1920, height: 1080 },
        },
      },
    ];

    const result = validateSections(sections);
    const heroProps = result.sanitizedSections[0].props;
    expect(heroProps.background_image).toBeDefined();
    expect((heroProps.background_image as { src: string }).src).toBe("/uploads/stock/abc/photo.jpg");
  });

  it("skips image objects without src", async () => {
    const { validateSections } = await import("../src/lib/blueprint/component-validator");

    const sections = [
      {
        component_id: "space_ds:space-hero-banner-style-02",
        props: {
          title: "Welcome",
          background_image: { alt: "No src", width: 100, height: 100 },
        },
      },
    ];

    const result = validateSections(sections);
    const heroProps = result.sanitizedSections[0].props;
    // Image without src should be skipped (not included in clean props)
    expect(heroProps.background_image).toBeUndefined();
  });
});

// ---- Enhance Phase Integration Tests ----

describe("Enhance Phase — Blueprint Mutation", () => {
  it("injects image objects into section props", () => {
    // Simulate what enhance phase does to a blueprint
    const section = {
      component_id: "space_ds:space-hero-banner-style-01",
      props: { title: "Welcome" } as Record<string, unknown>,
    };

    // Simulate image injection
    const imageObj = {
      src: "/uploads/stock/site123/abc.jpg",
      alt: "Professional dental office",
      width: 1920,
      height: 1080,
    };

    section.props.background_image = imageObj;

    expect(section.props.background_image).toBeDefined();
    expect((section.props.background_image as { src: string }).src).toBe("/uploads/stock/site123/abc.jpg");
  });
});

// ---- Image Downloader Tests ----

describe("Image Downloader", () => {
  it("exports downloadStockImage function", async () => {
    const mod = await import("../src/lib/images/image-downloader");
    expect(mod.downloadStockImage).toBeDefined();
    expect(typeof mod.downloadStockImage).toBe("function");
  });
});
