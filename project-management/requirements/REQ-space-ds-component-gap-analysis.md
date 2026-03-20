# REQ: Space DS Component Gap Analysis

**Date:** 2026-03-20
**Author:** Product Owner (AI-assisted)
**Status:** SUPERSEDED — Space DS v2 theme upgrade invalidates this analysis. See `architecture/space-ds-v2-migration.md` for current component inventory and migration plan.

---

## 1. Executive Summary

The Space DS component library contains **84 components** (2 base, 17 atoms, 32 molecules, 33 organisms) and currently supports generation of **10 page types**: home, about, services, contact, portfolio, pricing, FAQ, team, landing, and generic.

**Coverage assessment: ~45% of what modern website builders offer.**

Space DS has strong coverage for static informational sites — hero banners (11 styles), text-media sections (5 variants), CTAs (3 types), team sections (6 variants), pricing cards, testimonials, accordions, and stats/KPI blocks. This is sufficient for a professional services brochure site.

However, the library has **critical gaps** in interactive components, media handling, navigation/footer, forms, blog/content listing, e-commerce, and event/booking functionality. These gaps mean several high-demand page types are either impossible or severely degraded. Competitors like Squarespace, Wix, and WordPress/Elementor offer 2-4x the component breadth, particularly in dynamic content, embedded media, and conversion-focused widgets.

The bottom line: Space DS is a solid foundation for MVP launch targeting professional services, but the platform will hit a wall for restaurant, e-commerce, event, and content-marketing use cases without component additions.

---

## 2. Current Component Inventory

### 2.1 Components by Functional Category

| Category | Component IDs | Count | Notes |
|----------|--------------|-------|-------|
| **Hero Banners** | `space-hero-banner-style-01` through `style-11` | 11 | Excellent variety. Full-width, split, text-only, gradient, dual-image styles. |
| **Text + Media** | `space-text-media-default`, `-with-checklist`, `-with-images`, `-with-link`, `-with-stats` | 5 | Good workhorse sections. Used for features, about content, general text. |
| **CTA Banners** | `space-cta-banner-type-1`, `-type-2`, `-type-3` | 3 | Adequate for closing sections. |
| **Team Sections** | `space-team-section-image-card-1/2/3`, `space-team-section-simple-1/2/3` | 6 | Strong coverage for people-focused pages. |
| **Testimonials** | `space-testimony-card`, `space-people-card-testimony-with-avatar`, `space-people-card-testimony-with-image` | 3 | Basic testimonial needs covered. |
| **People Cards** | `space-people-card-people-with-avatar`, `-with-avatar-bio`, `-with-image`, `-with-image-bio` | 4 | Good for team/staff pages. |
| **Pricing** | `space-pricing-card`, `space-pricing-featured-card` | 2 | Basic pricing tiers. No comparison table. |
| **Accordion/FAQ** | `space-accordion`, `space-accordion-item`, `space-accordion-with-image` (4 variations) | 6 | Good for FAQ and collapsible content. |
| **Stats/KPI** | `space-stats-kpi` | 1 | Single stats component; limited flexibility. |
| **Cards** | `space-featured-card`, `space-icon-card`, `space-imagecard`, `space-quicklink-card`, `space-video-card`, `space-timeline-card` | 6 | Decent variety but no dedicated blog/post card. |
| **Navigation** | `space-breadcrumb`, `space-sidebar-links`, `space-sticky-jump-link` (+tag, +content) | 4 | In-page navigation only. **No header/navbar or footer.** |
| **Layout** | `space-container`, `space-flexi` | 2 | Internal layout primitives. |
| **Atoms** | `space-alert`, `space-avatar`, `space-badge`, `space-button`, `space-features`, `space-form`, `space-heading`, `space-image`, `space-input`, `space-link`, `space-paragraph`, `space-select`, `space-social-button`, `space-textarea`, `space-tooltip`, `space-video` | 16 | Building blocks. Form atoms exist but no composed form organism. |
| **Other** | `space-logo-grid`, `space-slider`, `space-code-snippet`, `space-notification-banner`, `space-pagination`, `space-social-links`, `space-section-heading`, `space-text` | 8 | Miscellaneous utilities. |

### 2.2 What Page Design Rules Currently Use

From `page-design-rules.ts`, the AI actively uses only **~20 unique component IDs** across all 10 page types:

- Heroes: `style-01`, `style-02`, `style-03`, `style-04`, `style-05`, `style-06`, `style-07`, `style-08`, `style-09`, `style-10`, `style-11`
- Text/Media: `space-text-media-default`, `-with-checklist`, `-with-images`, `-with-link`, `-with-stats`
- CTAs: `space-cta-banner-type-1`, `-type-2`, `-type-3`
- Team: `space-team-section-image-card-1`, `-image-card-2`, `-simple-1`
- Testimonials: `space-testimony-card`, `space-people-card-testimony-with-avatar`
- Stats: `space-stats-kpi`
- FAQ: `space-accordion`
- Pricing: `space-pricing-card`, `space-pricing-featured-card`

**Components in the manifest that are NEVER referenced in page design rules or component-tree-builder:**
- `space-logo-grid` (client logos / social proof)
- `space-slider` (carousel)
- `space-video-card` (video embed card)
- `space-timeline-card` (process/history timeline)
- `space-icon-card` (feature highlight with icon)
- `space-featured-card` (featured content card)
- `space-imagecard` (standalone image card)
- `space-quicklink-card` (quick navigation card)
- `space-notification-banner` (top-of-page notification)
- `space-code-snippet` (code display)
- `space-form` (form atom — exists but unused in page generation)
- All accordion-with-image variants (4 organisms)

This means ~30% of the manifest is untapped by the AI generation pipeline.

---

## 3. Gap Analysis

### 3.1 Critical Gaps (Blocks generation of common page types)

| Gap | What's Missing | Priority | User Impact | Competitor Coverage |
|-----|---------------|----------|-------------|-------------------|
| **Header / Navigation Bar** | No navbar, site menu, or hamburger menu component | **P0** | Every generated site needs a header. Currently impossible to generate site-wide navigation. | Squarespace: built-in. Wix: built-in. Elementor: Nav Menu widget + Mega Menu. |
| **Footer** | No footer organism. `space-footer-logo-content` molecule exists but no composed footer with columns, links, copyright, social. | **P0** | Every site needs a footer. Current molecule is insufficient for a complete footer. | All competitors: multi-column footer with social, links, copyright, newsletter. |
| **Contact Form (composed)** | Form atoms exist (`space-form`, `space-input`, `space-select`, `space-textarea`) but no pre-composed contact form organism. | **P0** | Contact page is a core page type but has no actual form section — just text-media content. | Squarespace: Form blocks with templates. Wix: Multi-step forms. Elementor: 20+ form widgets. |
| **Blog / Post Listing** | No blog card, post grid, or article listing component. No blog single-post layout. | **P1** | Blog is the most requested page type across all website builders. Currently impossible. | Squarespace: Blog sections, summary blocks, RSS. Wix: Blog app. Elementor: Posts widget, Post Grid, Archive. |
| **Image Gallery** | No dedicated gallery grid/masonry/lightbox organism. `space-text-media-with-images` is a text section with images, not a gallery. | **P1** | Portfolio page exists in design rules but uses text-media as a workaround. Restaurants and photographers need real galleries. | Squarespace: Gallery sections (grid, slideshow, carousel). Wix: Pro Gallery. Elementor: Gallery, Carousel, Lightbox. |
| **Map / Location Embed** | No map component or embed block. | **P1** | Contact and location pages for any local business are degraded without a map. Healthcare clinics, restaurants, real estate — all need maps. | Squarespace: Map block. Wix: Google Maps widget. Elementor: Google Maps widget. |
| **Video Embed Section** | `space-video` atom and `space-video-card` molecule exist but no section-level video embed organism. | **P2** | Video backgrounds, embedded YouTube/Vimeo sections are standard in modern sites. | All competitors: YouTube, Vimeo, and self-hosted video sections. |
| **Event / Calendar** | No event listing, event card, or calendar component. | **P2** | Events page type is impossible. Impacts community organizations, venues, educational institutions. | Squarespace: Calendar block, Events page. Wix: Events app. Elementor: Events Calendar integration. |

### 3.2 Important Gaps (Limit quality/differentiation of generated sites)

| Gap | What's Missing | Priority | User Impact | Competitor Coverage |
|-----|---------------|----------|-------------|-------------------|
| **Tabs Component** | No tabs for organizing content in a tabbed interface. | **P2** | Services pages, feature comparisons, and product details benefit from tabbed layouts. | Squarespace: Tabs section. Elementor: Tabs widget. |
| **Client Logo Bar** | `space-logo-grid` exists in the manifest but is NOT used in any page design rules. | **P2** | Social proof via client/partner logos is a standard home page section. Easy win — component exists, just needs integration into rules. | All competitors: Logo carousel/grid. |
| **Countdown Timer** | No countdown component. | **P3** | Landing pages for promotions, product launches, and events benefit from urgency timers. | Squarespace: no native. Elementor: Countdown widget. Wix: limited. |
| **Search** | No site search component. | **P3** | Important for content-heavy sites but less critical for MVP small business sites. | All competitors: search block/widget. |
| **Newsletter / Email Signup** | No dedicated email capture section (beyond generic form atoms). | **P2** | Email list building is a core conversion goal for many businesses. Usually placed in footer or as a standalone section. | Squarespace: Newsletter block. Wix: built-in. Elementor: Form + Mailchimp integration. |
| **Social Media Feed Embed** | No Instagram/social feed component. | **P3** | Restaurants, photographers, and lifestyle brands commonly embed Instagram feeds. | Squarespace: Instagram block. Wix: Social Feed. Elementor: via plugins. |
| **Pricing Comparison Table** | Only cards exist. No side-by-side comparison table with feature rows. | **P2** | Pricing pages work better with feature comparison tables for 3+ tiers. | Elementor: Comparison Table widget. Squarespace: custom via blocks. |
| **Progress Bar / Steps** | No step indicator or progress visualization. | **P3** | Useful for process pages ("How it Works") and onboarding flows. | Elementor: Progress Bar, Steps widget. |
| **Modal / Popup** | No modal or popup component. | **P3** | Exit-intent popups, newsletter popups, and promotional modals are conversion tools. | Elementor: Popup Builder (full feature). Wix: Lightbox. Squarespace: promotional popups. |
| **Dividers / Spacers** | No visual divider or decorative separator between sections. | **P3** | Minor but affects layout polish. | All competitors: shape dividers, spacers. |

### 3.3 Underutilized Existing Components

These components are in the manifest but not wired into the AI generation pipeline:

| Component | Current Status | Recommended Action |
|-----------|---------------|-------------------|
| `space-logo-grid` | In manifest, unused | **Wire into home/landing page rules** as "client logos" section type. Easy win. |
| `space-slider` | In manifest, unused | **Wire into portfolio/gallery page rules** for image carousels. |
| `space-video-card` | In manifest, unused | **Wire into services/about page rules** for video content sections. |
| `space-timeline-card` | In manifest, unused | **Wire into about page rules** for company history/milestones. |
| `space-icon-card` | In manifest, unused | **Wire into services/features** as an alternative to text-media for icon-led feature grids. |
| `space-featured-card` | In manifest, unused | Could serve as blog post card or featured content highlight. |
| `space-quicklink-card` | In manifest, unused | Useful for resource pages, sitemap-style navigation. |
| Accordion-with-image variants (4) | In manifest, unused | **Wire into services/FAQ rules** as richer alternative to plain accordion. |
| `space-notification-banner` | In manifest, unused | **Wire into all page types** for compliance notices, promotions. |

---

## 4. Competitor Comparison Matrix

| Component Category | Space DS | Squarespace | Wix | Elementor (Pro) |
|-------------------|----------|-------------|-----|-----------------|
| Hero/Banner | 11 styles | 5+ section types | Multiple | 5+ widgets |
| Text + Media | 5 variants | Text block + image block + embed | Unlimited via editor | 10+ widgets |
| CTA Sections | 3 types | Built into sections | Button sections | CTA widget |
| Team | 6 variants | Staff page type | Team section | Team Member widget |
| Testimonials | 3 types | Quote block | Testimonials app | Testimonial widget + carousel |
| Pricing | 2 card types | Price list block | Pricing Plans | Price Table + Comparison |
| FAQ/Accordion | 6 variants | Accordion block | FAQ app | Accordion, Toggle, FAQ Schema |
| **Navigation/Header** | **None** | Built-in | Built-in | Nav Menu, Mega Menu |
| **Footer** | **Partial** (1 molecule) | Built-in multi-column | Built-in | Theme Builder footer |
| **Blog/Posts** | **None** | Blog pages, summary blocks | Blog app, post cards | Posts, Post Grid, Archive |
| **Forms** | Atoms only, no organism | Form block (8+ field types) | Forms app, multi-step | 20+ form widgets, multi-step |
| **Image Gallery** | **None** (workaround) | Gallery sections (4 layouts) | Pro Gallery (20+ layouts) | Gallery, Carousel, Lightbox |
| **Maps** | **None** | Map block | Google Maps widget | Google Maps widget |
| **Video Sections** | Atom + card (unused) | Video block + backgrounds | Video widget + backgrounds | Video, Media Carousel |
| **Events/Calendar** | **None** | Calendar block, Events | Events app | Events Calendar plugin |
| **Tabs** | **None** | Tabs section (2025) | Tabs widget | Tabs widget |
| **Countdown** | **None** | No native | Limited | Countdown widget |
| **Newsletter Signup** | **None** | Newsletter block | Built-in | Form + integrations |
| **Search** | **None** | Search block | Site search | Search widget |
| **Popups/Modals** | **None** | Promotional popups | Lightbox | Popup Builder |
| **Social Feed** | **None** | Instagram block | Social Feed | Via plugins |
| **Logo Carousel** | Exists (unused) | Logo section | Logo strip | Image Carousel |
| **Slider/Carousel** | Exists (unused) | Slideshow section | Slider widget | Slides widget |
| **Estimated Total** | **~25 usable** | **~50+ blocks** | **~60+ elements** | **~100+ widgets** |

---

## 5. Page Types: Feasibility Assessment

| Page Type | Current Feasibility | Key Blockers | Competitor Baseline |
|-----------|-------------------|--------------|-------------------|
| Home | **Good** | Missing: logo bar, newsletter signup | All competitors: fully supported |
| About | **Good** | Could use: timeline, video section | All competitors: fully supported |
| Services | **Good** | Could use: tabs, icon-card grids | All competitors: fully supported |
| Contact | **Poor** | **No composed form section, no map** | All competitors: form + map standard |
| Portfolio | **Fair** | No real gallery component; using text-media workaround | All competitors: gallery/lightbox standard |
| Pricing | **Fair** | No comparison table for feature-by-feature comparison | Elementor: comparison table. Others: custom. |
| FAQ | **Good** | Accordion works well for this | All competitors: similar |
| Team | **Good** | Well covered with 6 team section variants | All competitors: similar |
| Landing | **Fair** | Missing: countdown timer, form embed, video section | Elementor: full landing page toolkit. Squarespace/Wix: similar. |
| **Blog** | **Impossible** | No blog listing, post card, archive, or article layout | All competitors: core feature |
| **E-commerce** | **Impossible** | No product card, cart, product gallery, or checkout | Squarespace: Commerce plan. Wix: Stores app. Elementor: WooCommerce widgets. |
| **Events** | **Impossible** | No event card, calendar, or booking component | Squarespace: Calendar. Wix: Events app. |
| **Restaurant/Menu** | **Impossible** | No menu item, food card, or reservation component | Squarespace: OpenTable/Tock. Wix: Restaurants app. |
| **Booking/Appointments** | **Impossible** | No scheduling or booking component | Squarespace: Acuity. Wix: Bookings. |

---

## 6. Recommendations

### 6.1 Immediate Actions (Sprint-addressable, no new components needed)

1. **Wire underutilized components into page design rules.** The following require zero new component development:
   - Add `space-logo-grid` as "client logos" section type in home and landing page rules
   - Add `space-slider` for portfolio/gallery carousel sections
   - Add `space-icon-card` as alternative features rendering in services/home pages
   - Add `space-video-card` for video content sections in about/services
   - Add `space-timeline-card` for "our story" / "how it works" sections in about pages
   - Add accordion-with-image variants as alternatives in FAQ and services pages
   - Add `space-notification-banner` for compliance/promotional notices

2. **Build a composed form section** using existing form atoms (`space-form`, `space-input`, `space-select`, `space-textarea`). This could be a new organism or a page-design-rule that composes them within a container. This unblocks the contact page.

### 6.2 Short-Term Component Development (1-2 sprints)

| Component | Priority | Rationale |
|-----------|----------|-----------|
| **Footer organism** | P0 | Every site needs one. Compose from existing atoms: logo, links, social-links, paragraph. |
| **Header / Navbar organism** | P0 | Every site needs one. Requires: logo, navigation links, mobile hamburger, optional CTA button. |
| **Contact Form organism** | P0 | Compose from existing form atoms. Add Drupal Webform integration. |
| **Blog Post Card** | P1 | Card with image, title, date, excerpt, category badge, read-more link. Enables blog listing. |
| **Blog Listing Section** | P1 | Grid/list of blog post cards with pagination. |
| **Image Gallery organism** | P1 | Grid/masonry/carousel layout with optional lightbox. Enables proper portfolio pages. |
| **Map Embed organism** | P1 | Google Maps or OpenStreetMap embed with address, marker. Enables proper contact/location pages. |

### 6.3 Medium-Term Component Development (3-5 sprints)

| Component | Priority | Rationale |
|-----------|----------|-----------|
| Newsletter signup section | P2 | Email capture for footer or standalone sections. |
| Tabs organism | P2 | Content organization for services, features, product details. |
| Pricing comparison table | P2 | Feature-by-feature comparison grid for pricing pages. |
| Video section organism | P2 | Full-width or split video embed section (YouTube/Vimeo). |
| Event card + listing | P2 | Enables events page type for community organizations. |
| Countdown timer | P3 | Urgency widget for landing/promo pages. |
| Modal/popup | P3 | Promotional and newsletter capture popups. |
| Search widget | P3 | Site-wide search for content-heavy sites. |

### 6.4 Strategic Decision: Fill Gaps vs. Supplement DS

**Option A: Build missing components within Space DS**
- Pros: Consistent design language, single dependency, full control over component API
- Cons: Significant development effort (estimate: 8-12 new organisms needed), slower time to market
- Best for: MVP where you control the full stack

**Option B: Supplement Space DS with Drupal contrib components**
- Pros: Faster coverage, leverage community work (e.g., Drupal Webform, Views for blog listing, Google Maps module)
- Cons: Inconsistent styling, Canvas compatibility risk, maintenance burden
- Best for: Quick gap-filling while Space DS evolves

**Option C: Hybrid approach (recommended)**
- Build P0 components (header, footer, contact form) in Space DS since they appear on every page
- Use Drupal contrib for P1-P2 functionality (blog via Views, maps via module, gallery via media library) styled to match Space DS tokens
- Long-term, migrate contrib solutions into Space DS organisms

---

## 7. Impact on PRD Industry Coverage

Per PRD Appendix B, the MVP targets 6 industries. Here is how component gaps affect each:

| Industry | PRD Key Pages | Blocked By Gaps | Severity |
|----------|--------------|----------------|----------|
| **Healthcare** | Home, About, Services, Doctors, Locations, Contact, Appointments | No contact form, no map for locations, no booking component | **High** — Contact and Locations pages severely degraded |
| **Legal** | Home, About, Practice Areas, Attorneys, Case Results, Contact | No contact form, no case study/blog card, no map | **High** — Contact degraded, Case Results impossible without blog/card component |
| **Real Estate** | Home, Listings, Agents, Neighborhoods, Contact | No listing card, no gallery for property photos, no map, no contact form | **Critical** — Listings page impossible |
| **Restaurant** | Home, Menu, About, Gallery, Reservations, Contact | No menu component, no gallery, no reservation/booking, no map, no contact form | **Critical** — Menu and Gallery pages impossible |
| **Professional Services** | Home, About, Services, Team, Testimonials, Contact | No contact form, no map | **Medium** — Most pages work; Contact degraded |
| **Other (Generic)** | Home, About, Services, Contact | No contact form | **Medium** — Contact degraded |

**Conclusion:** Only Professional Services and Generic industries can produce acceptable sites with current components. Healthcare and Legal are degraded. Real Estate and Restaurant are critically blocked.

---

## 8. Handoff Note for `/drupal-architect`

### Context
This analysis identifies the gap between Space DS component coverage and what's needed for the MVP industry targets. The AI generation pipeline (`page-design-rules.ts`, `component-tree-builder.ts`, `space-component-manifest.json`) currently uses only ~20 of the 84 available components.

### Immediate Technical Tasks to Create

1. **TASK: Wire unused manifest components into page design rules** — Update `page-design-rules.ts` to include `space-logo-grid`, `space-slider`, `space-icon-card`, `space-video-card`, `space-timeline-card`, accordion-with-image variants, and `space-notification-banner`. No Drupal work needed — this is purely AI prompt plumbing.

2. **TASK: Compose contact form organism** — Either create a new Space DS organism that wraps form atoms, or create a page-design-rule pattern that generates a form section from atoms. This is the single highest-impact gap since Contact is a required page for every site.

3. **TASK: Audit Space DS upstream for planned components** — Check if the Space DS theme maintainers have header, footer, gallery, or blog components in development. This determines whether to build or wait.

4. **TASK: Design header/footer component architecture** — Determine whether header/footer should be Space DS organisms, Drupal block types, or handled at the theme level (regions). This is an architectural decision that affects every generated site.

5. **TASK: Evaluate Drupal contrib for blog, maps, gallery** — Assess Views + node templates for blog, Webform for forms, Google Maps module, and Media Library for gallery as interim solutions that can be styled with Space DS tokens.

### Key Files
- Component manifest: `platform-app/src/lib/ai/space-component-manifest.json`
- Page design rules: `platform-app/src/lib/ai/page-design-rules.ts`
- Component tree builder: `platform-app/src/lib/blueprint/component-tree-builder.ts`

### Priority Order
P0: Contact Form > Footer > Header/Navbar
P1: Blog Card/Listing > Image Gallery > Map Embed
P2: Tabs > Newsletter > Pricing Table > Video Section

---

*Generated 2026-03-20. This document should be revisited after the Space DS upstream audit (Task 3 above).*
