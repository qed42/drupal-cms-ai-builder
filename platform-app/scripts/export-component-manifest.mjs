#!/usr/bin/env node

/**
 * Export Space DS component manifest from *.component.yml files.
 *
 * Usage:
 *   node scripts/export-component-manifest.mjs /path/to/space_ds
 *
 * Output:
 *   src/lib/ai/space-component-manifest.json
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, resolve, basename, dirname } from "path";
import yaml from "js-yaml";

const SPACE_DS_PATH = process.argv[2];
if (!SPACE_DS_PATH) {
  console.error("Usage: node scripts/export-component-manifest.mjs <space_ds_path>");
  process.exit(1);
}

const COMPONENTS_DIR = join(resolve(SPACE_DS_PATH), "components");
const OUTPUT_PATH = join(
  resolve(dirname(new URL(import.meta.url).pathname)),
  "..",
  "src",
  "lib",
  "ai",
  "space-component-manifest.json"
);

// Recursively find all *.component.yml files
function findComponentFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...findComponentFiles(fullPath));
    } else if (entry.endsWith(".component.yml")) {
      results.push(fullPath);
    }
  }
  return results;
}

// Derive category from the directory structure (00-base, 01-atoms, 02-molecules, 03-organisms)
function deriveCategory(filePath) {
  const relative = filePath.replace(COMPONENTS_DIR + "/", "");
  const parts = relative.split("/");
  const categoryMap = {
    "00-base": "base",
    "01-atoms": "atom",
    "02-molecules": "molecule",
    "03-organisms": "organism",
  };
  return categoryMap[parts[0]] || "unknown";
}

// ---------------------------------------------------------------------------
// Blueprint-mapping usage hints
// ---------------------------------------------------------------------------
// These hints tell the AI blueprint generator WHEN to pick each component,
// WHAT content model it maps to, and HOW it differs from sibling variants.
// Organisms get detailed per-component descriptions; atoms/molecules get
// role-based hints since they're composed inside organisms.
// ---------------------------------------------------------------------------

// Exact-match lookup keyed by component file-name (without .component.yml).
// Every organism MUST have an entry here so the blueprint AI can disambiguate
// variants and choose the right one for the page being designed.
const BLUEPRINT_HINTS = {
  // ── Hero banners ──────────────────────────────────────────────────────
  "space-hero-banner-style-01":
    "Full-width background-image hero with centered title and sub-headline. Has a form slot for email capture / lead-gen and an info-items slot for short stat highlights. Best for: homepage or campaign landing pages where you want a striking visual backdrop plus an inline lead form. Blueprint mapping: maps to the site's primary entry point; populate title from site name/tagline, sub_headline from elevator pitch.",
  "space-hero-banner-style-02":
    "Full-width background-image hero with centered title, sub-headline, form slot, and info-items slot. Similar to Style-01 but applies mx-auto centering for a more balanced visual hierarchy. Best for: homepage hero or primary landing page when centre-aligned symmetry is preferred. Blueprint mapping: same content model as Style-01; choose this when the design calls for centred balance rather than left-aligned impact.",
  "space-hero-banner-style-03":
    "Split-layout hero — tall featured image on the left (50 %) with title, sub-headline, description paragraph, and CTA slot on the right. Unique among hero variants for having a full description prop. Best for: about pages, case-study intros, or feature showcases where you need narrative prose alongside imagery. Blueprint mapping: populate description from the page's introductory copy; use CTA slot for primary page action (e.g., 'Learn More', 'Book Consultation').",
  "space-hero-banner-style-04":
    "Centred hero with title and sub-headline above, large product/feature image positioned below the CTA buttons. Best for: feature launches, service introductions, or product pages where the image illustrates the offering. Blueprint mapping: title = page heading, sub_headline = value proposition; image shows the product/service being promoted.",
  "space-hero-banner-style-05":
    "Split hero — text and CTA on the left (50 %) with a large display heading (display2XL), featured image on the right (50 %). Best for: core service pages, value-proposition sections, or trust-building pages where a large authentic image reinforces credibility. Blueprint mapping: title = primary service/value proposition; image = team photo, office, or product shot.",
  "space-hero-banner-style-06":
    "Split hero — text-heavy left column (≈ 65 %) with smaller image on the right (≈ 35 %). Favours body text over imagery. Best for: thought-leadership pages, educational content intros, or blog landing pages. Blueprint mapping: title + sub_headline carry the main message; the image is supporting/illustrative rather than dominant.",
  "space-hero-banner-style-07":
    "Centred hero with title and sub-headline above, full-width showcase image below the CTA buttons. Larger image container than Style-04 (screen-lg vs 50 rem). Best for: immersive product showcases, portfolio entries, or visual case-study headers. Blueprint mapping: use when the page's primary visual asset is wide/panoramic and deserves maximum width.",
  "space-hero-banner-style-08":
    "Split layout — bold uppercase title on the left (≈ 70 %), compact image on the right (≈ 30 %), with description text and CTA below the title. Unique for its all-caps title styling. Best for: bold campaign announcements, event pages, or brand-forward sections. Blueprint mapping: title should be short and punchy (works best ≤ 5 words); image is secondary to the typographic impact.",
  "space-hero-banner-style-09":
    "Split layout — oversized title on the left (≈ 60 %), right column (≈ 40 %) containing sub-headline, description, and CTA stacked vertically. Only hero with the description text in a separate column from the title. Best for: conceptual/messaging-forward introductions, manifesto-style pages. Blueprint mapping: title = bold statement; right column provides the narrative context and call-to-action.",
  "space-hero-banner-style-10":
    "Complex triple-column layout — small accent image on the far left (≈ 20 %), large title and sub-headline in the centre (≈ 60 %), and a medium featured image on the right (≈ 40 %). Unique for coordinating two distinct images. Best for: sophisticated multi-image hero showcases, creative agencies, or portfolio sites. Blueprint mapping: use when the page needs two complementary images (e.g., team + workspace, product + lifestyle).",
  "space-hero-banner-style-11":
    "Split layout — text on the left (≈ 60 %) and image on the right (≈ 40 %) with a gradient background overlay (white-to-light-primary). Best for: premium/branded landing pages where the gradient adds visual depth. Blueprint mapping: similar content model to Style-05 but choose this when the brand's primary colour should subtly backdrop the hero.",

  // ── CTA banners ───────────────────────────────────────────────────────
  "space-cta-banner-type-1":
    "Two-column CTA — title and description on the left, CTA button slot on the right. Supports boxed-width or full-width layout and left/centre alignment. No image. Best for: mid-page conversion prompts, newsletter sign-ups, or secondary CTAs between content sections. Blueprint mapping: title = conversion message, description = supporting value proposition; place a space-button in the cta_content slot.",
  "space-cta-banner-type-2":
    "Stacked CTA — title and description on top, CTA buttons below, with a full-width background image integrated. Has an image_type prop (large-image / small-image) controlling visual weight. Best for: dramatic conversion moments requiring visual impact — e.g., 'Start your free trial' with a product screenshot. Blueprint mapping: choose over Type-1 when an image strengthens the conversion message.",
  "space-cta-banner-type-3":
    "Stacked CTA — title, description, and image above, with CTA buttons positioned outside the main container below. Differs from Type-2 by separating the CTA from the banner body for emphasis. Best for: image-forward CTAs with sequential visual flow — e.g., showcase then convert. Blueprint mapping: use when the call-to-action needs visual separation from the content above.",

  // ── Team sections ─────────────────────────────────────────────────────
  "space-team-section-simple-1":
    "Minimal team display — intro section heading slot above, team member cards below (avatar-only, no images). Compact visual footprint. Best for: quick staff rosters, advisor lists, or footer-area team mentions. Blueprint mapping: maps to team_members content model; use when the page needs a lightweight team presence. Slot: intro_section → space-section-heading; team_member → space-people-card-people-with-avatar.",
  "space-team-section-simple-2":
    "Team display with intro section plus avatar cards that include inline bio text. Best for: formal staff directory pages or organisational charts where role descriptions matter. Blueprint mapping: maps to team_members with bio field populated. Differs from Simple-1 by adding biography context alongside avatars.",
  "space-team-section-simple-3":
    "Full-width team layout with intro section (including navigation links) above, team members with avatar and bio below. Best for: dedicated team pages with department filtering or role links. Blueprint mapping: maps to team_members; use the links slot for department/role navigation. Unique for positioning links inline with intro.",
  "space-team-section-image-card-1":
    "Visual-heavy team showcase — centred intro, centred links, team members displayed as large image cards with bio overlay. Largest image footprint among team variants. Best for: creative agencies, photography studios, or personality-driven brands. Blueprint mapping: maps to team_members; requires high-quality team photos. Slot: team_member → space-people-card-people-with-image-bio.",
  "space-team-section-image-card-2":
    "Team showcase with intro and links, team members displayed with images only (no bio cards). Cleanest/most minimalist image-based variant. Best for: headshot galleries, board-of-directors pages, or visual-first team pages. Blueprint mapping: maps to team_members (photo + name only). Slot: team_member → space-people-card-people-with-image.",
  "space-team-section-image-card-3":
    "Full-width team showcase — intro/links section, team members with image + bio cards extending full-bleed. Most immersive team variant. Best for: dedicated 'Meet the Team' pages or partner showcases. Blueprint mapping: maps to team_members with full bios; images break container boundaries for visual drama.",

  // ── Text-media sections ───────────────────────────────────────────────
  "space-text-media-default":
    "Two-column layout — title and description text on one side, single featured image on the other. The baseline text-to-image ratio for feature pages. Best for: about sections, service descriptions, mission statements, or any narrative paired with a supporting image. Blueprint mapping: title = section heading, description = body copy; image illustrates the topic.",
  "space-text-media-with-images":
    "Two-column layout with images on BOTH sides — no text content, purely visual. Best for: visual comparisons, before/after showcases, image galleries, or portfolio highlights. Blueprint mapping: use when the section's message is conveyed through imagery alone (e.g., project photos, product angles).",
  "space-text-media-with-checklist":
    "Two-column layout — title, description, and bulleted checklist on one side, image on the other. Best for: feature lists, process steps, benefits breakdowns, or requirements documentation. Blueprint mapping: title = section heading, description = context, checklist items = discrete features or steps. Maps to services or features content model.",
  "space-text-media-with-stats":
    "Two-column layout — title, description, and 2-column stats/KPI grid on one side, image on the other. Best for: metrics-driven narratives, case-study results, company milestones, or performance highlights. Blueprint mapping: stats map to stats_kpi content model (value + label pairs); image provides visual context.",
  "space-text-media-with-link":
    "Two-column layout — title, description, and link/button slot on one side, image on the other. Best for: feature introductions with a primary action, blog previews with 'Read More', or service teasers. Blueprint mapping: similar to default but adds a CTA link; use when the section needs a clear next-step action.",

  // ── Accordion sections ────────────────────────────────────────────────
  "space-accordion":
    "Base accordion — expandable/collapsible content panels. Supports icon types (PlusMinus, chevronDown, none), icon alignment (left/right), border styles, and container width (default, half-width, three-quarters-width). Best for: FAQ sections, service details, policy disclosures, or any content that benefits from progressive disclosure. Blueprint mapping: items slot → space-accordion-item components; maps to FAQ content model (question/answer pairs).",
  "space-accordion-with-image-variation-1":
    "Accordion paired with a featured image — no section heading, supports left/right icon alignment and optional borders. Most minimal accordion-with-image variant. Best for: sidebar FAQs or secondary reference sections where an image provides visual context. Blueprint mapping: maps to FAQ content model with an accompanying illustration.",
  "space-accordion-with-image-variation-2":
    "Accordion with optional pre-heading and main title above the items list, paired with a featured image. Best for: primary FAQ sections or expandable documentation blocks that need a clear section heading. Blueprint mapping: pre_heading = category label, title = section heading; maps to FAQ content model.",
  "space-accordion-with-image-variation-3":
    "Accordion inside a container wrapper with items in an inner-wrap, paired with an image. Container constraints improve visual hierarchy in busy layouts. Best for: sectioned FAQs within long-form pages or tabbed content blocks. Blueprint mapping: similar to Variation-2 but with tighter layout containment.",
  "space-accordion-with-image-variation-4":
    "OBSOLETE — carousel-synced accordion using Splide (10 slides max) that syncs accordion content to associated images. Most complex variant with dual-track image/content sync. Should not be used for new blueprints; prefer Variation-1 or Variation-2 instead.",

  // ── Other organisms ───────────────────────────────────────────────────
  "space-slider":
    "Splide-powered content carousel with up to 10 slide slots and 6 pagination styles (dot, line, dash-number, fraction-number, no-pagination, thumbnail-sync). Best for: testimonial rotations, image galleries, product showcases, or logo carousels. Blueprint mapping: slides slot → any repeatable card component (testimony-card, imagecard, etc.); maps to testimonials, portfolio items, or gallery images content model.",
  "space-sidebar-links":
    "Fixed-width (w-52) nested menu list with hover states and active-trail support. Supports border_style vs filled visual treatments. Best for: sidebar navigation, related-links sections, or documentation table-of-contents. Blueprint mapping: maps to navigation/menu items; use on pages with deep content hierarchies.",
  "space-sticky-jump-link":
    "Tab-based navigation with sticky content blocks synchronised via anchor links. Supports 1-10 tab items. Best for: long-form pages, tabbed service pages, multi-section landing pages, or documentation with in-page navigation. Blueprint mapping: each tab maps to a distinct content section; use when a single page covers multiple topics that benefit from quick navigation.",
};

// Molecule/atom-level hints — keyed by component file-name.
// These are building-block components composed inside organisms.
const BUILDING_BLOCK_HINTS = {
  // Atoms
  "space-container": "Layout wrapper that constrains child content width and applies background colours. Used by organisms to wrap sections. Blueprint: not placed directly — organisms use this internally.",
  "space-flexi": "Flexible grid/layout utility for arranging child elements in rows or columns with responsive breakpoints. Blueprint: not placed directly — organisms use this for internal layout.",
  "space-alert": "Dismissible alert banner for success, warning, error, or info messages. Blueprint mapping: use for compliance notices (HIPAA, attorney advertising), cookie consent, or system notifications. Place at page top or within form sections.",
  "space-avatar": "Circular user avatar showing initials or an image. Used inside team cards, testimonials, and user profile sections. Blueprint: composed inside space-people-card or space-team-section components.",
  "space-badge": "Small visual label or tag for categorisation, status indicators, or feature flags (e.g., 'New', 'Popular', 'Sale'). Blueprint: used inside cards or list items to highlight attributes.",
  "space-button": "Primary interactive element for navigation and form submission. Variants: primary, secondary, tertiary, link. Sizes: small to xlarge. Blueprint mapping: placed inside CTA slots, form actions, or hero content slots. Every CTA section needs at least one button.",
  "space-features": "Single feature item with icon, title, and description. Blueprint: composed inside feature grids or card layouts to represent individual services, benefits, or capabilities.",
  "space-form": "Form container wrapping input fields with layout and submission handling. Blueprint: used on contact pages; wraps space-input, space-select, space-textarea components.",
  "space-heading": "Semantic heading element (h1-h6) with configurable size, weight, and colour. Blueprint: used inside section headings, card titles, and hero banners for typography control.",
  "space-image": "Responsive image element with lazy loading and alt text. Supports various aspect ratios. Blueprint: used inside hero banners, cards, text-media sections, and galleries.",
  "space-input": "Text input field for forms — supports text, email, tel, password, number types. Blueprint: composed inside space-form on contact/registration pages.",
  "space-link": "Styled anchor element for inline or standalone navigation. Blueprint: used inside content sections, footers, and navigation menus.",
  "space-paragraph": "Rich text block for body copy, descriptions, and formatted content. Blueprint: used inside text sections, cards, and content areas for prose content.",
  "space-select": "Dropdown select field for forms — single selection from predefined options. Blueprint: composed inside space-form for fields like 'Subject', 'Department', 'Service type'.",
  "space-social-button": "Social media icon button (Facebook, Twitter, LinkedIn, Instagram, etc.). Blueprint: composed inside space-social-links component or footer sections.",
  "space-sticky-jump-link-tag": "Individual tab/tag item for the sticky jump-link navigation. Blueprint: composed inside space-sticky-jump-link; each tag anchors to a content section.",
  "space-textarea": "Multi-line text input for forms — used for message, description, or comment fields. Blueprint: composed inside space-form on contact pages.",
  "space-tooltip": "Hover-triggered contextual tooltip for additional information on interactive elements. Blueprint: used for explaining form fields, feature icons, or pricing details.",
  "space-video": "Video player embed supporting YouTube, Vimeo, or self-hosted files. Blueprint: used inside hero banners, content sections, or dedicated media pages.",

  // Molecules
  "space-accordion-item": "Single expandable accordion panel with a label and content. Blueprint: composed inside space-accordion organisms; maps to one FAQ question-answer pair.",
  "space-accordion-with-image-item": "Accordion panel variant designed for use inside accordion-with-image organisms. Blueprint: same as accordion-item but styled for image-paired layouts.",
  "space-accordion-with-image-variation-4-data": "Data panel for the obsolete Variation-4 carousel accordion. Blueprint: do not use for new blueprints.",
  "space-accordion-with-image-variation-4-image": "Image panel for the obsolete Variation-4 carousel accordion. Blueprint: do not use for new blueprints.",
  "space-avatar-group": "Row of stacked avatar circles showing multiple team members or users. Blueprint: used inside team sections or testimonial areas to show multiple contributors.",
  "space-avatar-group-label": "Avatar group with a text label (e.g., '+3 more'). Blueprint: used when showing a truncated list of team members or participants.",
  "space-breadcrumb": "Navigation breadcrumb trail showing page hierarchy (Home > Section > Page). Blueprint mapping: place at the top of inner pages for wayfinding. Maps to the site's page hierarchy.",
  "space-code-snippet": "Formatted code block with syntax highlighting. Blueprint: use on documentation, developer-focused, or technical pages.",
  "space-featured-card": "Large prominent card with image, title, description, and CTA link. Blueprint mapping: maps to featured content items (hero blog post, primary service, spotlight project). Use in card grids or as standalone featured content.",
  "space-footer-logo-content": "Footer section with logo and descriptive text. Blueprint: composed inside the site footer; maps to site name + tagline/mission statement.",
  "space-icon-card": "Card with icon, title, and description — no image. Blueprint mapping: maps to services or features content model. Use inside feature grids for service overviews, capability lists, or benefit highlights.",
  "space-imagecard": "Card with prominent image, title, optional description, and link. Blueprint mapping: maps to portfolio items, blog posts, case studies, or gallery entries. Use inside card grids or slider components.",
  "space-logo-grid": "Grid/row of partner, client, or certification logos. Blueprint mapping: maps to partner_logos or trust_signals content model. Use on homepage for social proof or on a dedicated partners page.",
  "space-notification-banner": "Prominent site-wide notification bar for announcements, compliance notices, or promotions. Blueprint mapping: use for HIPAA disclaimers, attorney advertising notices, cookie consent, sale announcements. Place at page top.",
  "space-pagination": "Page navigation controls (previous/next/numbered) for paginated content lists. Blueprint: used on blog listing, search results, or portfolio archive pages.",
  "space-people-card-people-with-avatar-bio": "Team member card with circular avatar, name, role, and bio text. Blueprint mapping: maps to team_members content model (name, role, bio). Composed inside space-team-section-simple variants.",
  "space-people-card-people-with-avatar": "Team member card with circular avatar, name, and role — no bio. Compact variant. Blueprint mapping: maps to team_members (name, role only). Use in space-team-section-simple-1.",
  "space-people-card-people-with-image-bio": "Team member card with large photo, name, role, and bio text. Blueprint mapping: maps to team_members with photo + full bio. Composed inside space-team-section-image-card variants.",
  "space-people-card-people-with-image": "Team member card with large photo, name, and role — no bio. Blueprint mapping: maps to team_members (photo, name, role). Use in space-team-section-image-card-2.",
  "space-people-card-testimony-with-avatar": "Testimonial card with avatar, quote, author name, and role. Blueprint mapping: maps to testimonials content model (quote, author_name, author_role). Use inside space-slider for testimonial carousels.",
  "space-people-card-testimony-with-image": "Testimonial card with large author photo, quote, name, and role. Blueprint mapping: maps to testimonials content model with photo. Use when testimonials need more visual weight.",
  "space-pricing-card": "Pricing plan card with plan name, price, feature list, and CTA button. Blueprint mapping: maps to pricing_plans content model (name, price, period, features, cta). Use inside pricing sections.",
  "space-pricing-featured-card": "Highlighted/featured pricing card variant — visually emphasised (e.g., 'Most Popular'). Blueprint mapping: same as pricing-card but for the recommended plan. Set highlighted=true in blueprint.",
  "space-quicklink-card": "Compact card with icon and title linking to another page. Blueprint mapping: maps to quick navigation items (e.g., 'Our Services', 'Contact Us'). Use in grid layouts for site navigation shortcuts.",
  "space-section-heading": "Section heading block with optional pre-heading, title, and description. Blueprint mapping: used inside organism intro slots (team sections, sliders) to introduce a page section. Maps to section title + subtitle.",
  "space-social-links": "Row of social media icon buttons. Blueprint mapping: maps to the site's social media profiles. Place in footer or contact page.",
  "space-stats-kpi": "Single statistic/KPI display with large number value and label. Blueprint mapping: maps to stats content model (value, label, suffix). Composed inside space-text-media-with-stats for metrics sections.",
  "space-sticky-jump-link-content": "Content block paired with a sticky jump-link tab. Blueprint: composed inside space-sticky-jump-link; holds the content for one tab section.",
  "space-testimony-card": "Standalone testimonial card with star rating, quote, and author info. Blueprint mapping: maps to testimonials content model (quote, author_name, rating). Alternative to people-card-testimony variants.",
  "space-text": "Rich text content block for body copy. Blueprint: used inside organisms for formatted content — descriptions, paragraphs, and inline markup.",
  "space-timeline-card": "Timeline entry with date/period, title, and description. Blueprint mapping: maps to milestones or history content model (date, title, description). Use on about pages for company history or project timelines.",
  "space-video-card": "Card with video thumbnail, play button overlay, title, and description. Blueprint mapping: maps to video content model. Use in galleries or media sections for video collections.",
};

/**
 * Generate a verbose, blueprint-aware usage hint for a component.
 *
 * Priority:
 * 1. Exact match in BLUEPRINT_HINTS (organisms) or BUILDING_BLOCK_HINTS (atoms/molecules)
 * 2. YAML description enriched with blueprint-mapping context
 * 3. Fallback generated from component name and props
 */
function generateUsageHint(name, description, group, category, props, slots, componentFileName) {
  // 1. Exact-match lookup
  const exactHint = BLUEPRINT_HINTS[componentFileName] || BUILDING_BLOCK_HINTS[componentFileName];
  if (exactHint) {
    return exactHint;
  }

  // 2. Enrich YAML description with blueprint context
  if (description && description.length > 20) {
    const cleanDesc = description.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
    // Add blueprint mapping context based on props and slots
    const blueprintContext = deriveBlueprintContext(name, props, slots, category);
    if (blueprintContext) {
      return `${cleanDesc} Blueprint mapping: ${blueprintContext}`;
    }
    return cleanDesc;
  }

  // 3. Fallback: generate from component name
  const blueprintContext = deriveBlueprintContext(name, props, slots, category);
  return blueprintContext
    ? `${name} component. ${blueprintContext}`
    : `${name} component for building structured page layouts.`;
}

/**
 * Derive blueprint-mapping context from component characteristics.
 */
function deriveBlueprintContext(name, props, slots, category) {
  const nameLower = name.toLowerCase();
  const propNames = props.map(p => p.name);
  const slotNames = slots.map(s => s.name);

  // Detect content model from prop names
  const hints = [];

  if (propNames.includes("title") && propNames.includes("description")) {
    hints.push("populate title from section heading and description from body copy");
  }
  if (propNames.some(p => p.includes("image") || p.includes("background"))) {
    hints.push("requires an image asset");
  }
  if (slotNames.includes("cta_content") || slotNames.some(s => s.includes("cta"))) {
    hints.push("place space-button components in the CTA slot for conversion actions");
  }
  if (slotNames.includes("items") || slotNames.includes("team_member")) {
    hints.push("populate items slot with repeatable child components");
  }

  return hints.length > 0 ? hints.join("; ") + "." : "";
}

// Extract prop info from the YAML schema
function extractProps(propsSchema) {
  if (!propsSchema || !propsSchema.properties) return [];

  const required = propsSchema.required || [];

  return Object.entries(propsSchema.properties).map(([name, schema]) => {
    const prop = {
      name,
      type: schema.type || "string",
      required: required.includes(name),
    };

    if (schema.title) prop.title = schema.title;
    if (schema.description && schema.description !== schema.title) {
      prop.description = schema.description;
    }
    if (schema.enum) prop.enum = schema.enum;
    if (schema.default !== undefined) prop.default = schema.default;

    // Handle $ref for complex types (e.g., image references)
    if (schema.$ref) {
      prop.type = "object";
      prop.ref = schema.$ref;
    }

    return prop;
  });
}

// Extract slot info
function extractSlots(slotsSchema) {
  if (!slotsSchema) return [];

  return Object.entries(slotsSchema).map(([name, schema]) => ({
    name,
    title: schema.title || name,
    description: schema.description || "",
  }));
}

// Main export
const files = findComponentFiles(COMPONENTS_DIR).sort();
console.log(`Found ${files.length} component files`);

const manifest = files.map((filePath) => {
  const content = readFileSync(filePath, "utf-8");
  const doc = yaml.load(content);

  const componentFileName = basename(filePath, ".component.yml");
  const id = `space_ds:${componentFileName}`;
  const name = doc.name || componentFileName;
  const description = typeof doc.description === "string" ? doc.description.trim() : "";
  const group = doc.group || "";
  const status = doc.status || "unknown";
  const category = deriveCategory(filePath);

  const props = extractProps(doc.props);
  const slots = extractSlots(doc.slots);
  const usage_hint = generateUsageHint(name, description, group, category, props, slots, componentFileName);

  return {
    id,
    name,
    description,
    status,
    group,
    category,
    props,
    slots,
    usage_hint,
  };
});

writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Wrote ${manifest.length} components to ${OUTPUT_PATH}`);
