# Space DS v2 Theme Migration — Architecture Analysis

**Date:** 2026-03-20
**Author:** Sr. Drupal Technical Architect
**Status:** Ready for implementation

---

## 1. Executive Summary

The Space DS theme has been upgraded from v1 (84 components, pre-composed organisms) to v2 (31 components, compositional model). This is a **breaking change** that requires rewriting the entire AI generation pipeline.

**The paradigm shift:** Old theme had pre-composed organisms (e.g., `space-text-media-with-checklist`). New theme provides layout primitives (`space-flexi`, `space-container`) and atoms/molecules that compose into sections via **slots**. The AI must now generate **component trees** rather than picking pre-built organisms.

**What this unlocks:**
- Native header + footer components (P0 gap from gap analysis: RESOLVED)
- Flexible multi-column layouts for any content pattern
- Blog-ready imagecard with dates, categories, read times
- Article detail pages via content-detail component
- Contact cards with email/phone/FAQ
- Video banners for media-rich pages
- Brand colors + typography via native theme settings (no custom CSS generation)

**What this removes:**
- All text-media variants (5 components → 0)
- All hero styles except 2 (11 → 2 + 2 new heroes)
- All team section organisms (3 → 0, replaced by flexi + user-card)
- All pricing components (2 → 0)
- All form atoms (4 → 0 in theme, needs Webform or custom approach)
- All people card variants (4 → 1 user-card)

---

## 2. Component Inventory Comparison

### 2.1 Full New Inventory (31 components)

| Category | Component | Status | Notes |
|----------|-----------|--------|-------|
| **Base** | `space-container` | Enhanced | New: background patterns, 4xl/5xl widths, margin support |
| | `space-flexi` | Enhanced | **Core layout tool.** 1-4 columns, 11 width splits, direction, alignment, gap, wrap |
| **Atoms** | `space-button` | Retained | |
| | `space-heading` | Retained | |
| | `space-icon` | **NEW** | Icon component |
| | `space-image` | Retained | |
| | `space-input-submit` | **NEW** | Replaces form atoms |
| | `space-link` | Retained | |
| | `space-text` | Retained | Rich text block |
| **Molecules** | `space-accordion-item` | Retained | |
| | `space-breadcrumb` | Retained | |
| | `space-contact-card` | **NEW** | Email, phone, FAQ link, description |
| | `space-content-detail` | **NEW** | Article/detail with tags, date, conclusion, user-card slot |
| | `space-dark-bg-imagecard` | **NEW** | Dark variant of imagecard |
| | `space-imagecard` | Enhanced | Now has: date, read_time, categories, alignment, sizes, download link |
| | `space-logo-section` | Renamed | Was logo-grid. Now: pre_heading, heading, description, content slot |
| | `space-pagination` | Retained | |
| | `space-section-heading` | Enhanced | New: split alignment, with_image option |
| | `space-stats-kpi` | Enhanced | New: alignment prop, link slot for button |
| | `space-testimony-card` | Enhanced | New: company_logo prop (Canvas image ref) |
| | `space-user-card` | **NEW** | Name, description, image, Twitter/LinkedIn URLs |
| | `space-videocard` | Retained | Same structure as imagecard but video-oriented |
| **Organisms** | `space-accordion` | Enhanced | New: icon_type, alignment, border, container_width props |
| | `space-cta-banner-type-1` | Enhanced | New: background_image, alignment (left/center/stacked), width, cta_content slot |
| | `space-detail-page-hero-banner` | **NEW** | Detail/article hero with bg image, categories |
| | `space-footer` | **NEW** | Full footer: brand info, social_links, columns, legal links, cookie section slots |
| | `space-header` | **NEW** | Full header: logo, navigation, CTAs slots, menu_align |
| | `space-hero-banner-style-02` | Retained | Bg image, title, sub_headline, content slot, items slot (for stats) |
| | `space-hero-banner-with-media` | **NEW** | Hero with image, label, title, categories, download link |
| | `space-slider` | Enhanced | Splide-based, responsive breakpoints, loop/slide, pagination, arrows |
| | `space-video-banner` | **NEW** | Video hero with iframe embed, title, categories |

### 2.2 Removed Components (53 deleted)

**Heroes (9 removed):** style-01, style-03 through style-11
**Text-Media (5 removed):** default, with-checklist, with-images, with-link, with-stats
**Team (3 removed):** team-section-image-card-1/2/3, team-section-simple-1/2/3
**People Cards (4 removed):** people-card variants (with-avatar, with-avatar-bio, with-image, with-image-bio)
**Pricing (2 removed):** pricing-card, pricing-featured-card
**Form Atoms (4 removed):** form, input, select, textarea
**Accordion Variants (4 removed):** accordion-with-image variations 1-4
**CTA (2 removed):** cta-banner-type-2, cta-banner-type-3
**Social (2 removed):** social-button, social-links
**Other (18+ removed):** alert, avatar, avatar-group, badge, code-snippet, featured-card, features, icon-card, logo-grid, notification-banner, paragraph, quicklink-card, sidebar-links, sticky-jump-link variants, timeline-card, tooltip, video (atom)

---

## 3. Compositional Model — How Sections Are Built Now

### 3.1 Old Model (Pre-composed)
```
container → space-text-media-with-checklist (single organism, all props flat)
```

### 3.2 New Model (Composed via Flexi + Atoms)

A "features with checklist" section is now built as:
```
container (background_color, padding, width)
  └─ flexi (column_width: "50-50", gap: "large")
       ├─ [column_one slot]
       │    └─ space-heading (tag: h2, text: "Our Features")
       │    └─ space-text (rich HTML with checklist)
       │    └─ space-button (url, text, variant)
       └─ [column_two slot]
            └─ space-image (src, alt, width, height)
```

A "team section" is now:
```
container (background_color: "option-2")
  └─ space-section-heading (title, label, description, alignment: "center")
  └─ flexi (column_width: "25-25-25-25", gap: "medium")
       ├─ [column_one] → space-user-card (image, name, description, social urls)
       ├─ [column_two] → space-user-card
       ├─ [column_three] → space-user-card
       └─ [column_four] → space-user-card
```

A "testimonials carousel" is now:
```
container
  └─ space-section-heading (title, alignment: "center")
  └─ space-slider (slides_per_view_desktop: 3, arrows: true)
       └─ [slide_item slot]
            ├─ space-testimony-card (image, person_name, text, designation)
            ├─ space-testimony-card
            └─ space-testimony-card
```

### 3.3 Key Layout Primitives

**space-container** — Section wrapper. Controls: background color (11 options mapped to theme settings), width (boxed/full/4xl/5xl), padding, margin, background pattern.

**space-flexi** — Grid/flex layout. Controls: 1-4 columns, 11 column width splits (100, 50-50, 33-66, 66-33, 25-75, 75-25, 25-50-25, 50-25-25, 25-25-50, 33-33-33, 25-25-25-25), alignment, direction, gap, wrap. Has `content` + `column_one/two/three/four` slots.

**space-section-heading** — Section title block. Controls: label, title, description, tag level, alignment (left/center/split). Used to introduce sections before content.

---

## 4. Brand Tokens — Native Theme Settings

### 4.1 Old Approach
`BrandTokenService.php` reads `tokens.json` → generates CSS with `--space-color-*` variables → writes to `public://brand/brand-tokens.css`. Theme doesn't know about these tokens.

### 4.2 New Approach
Theme has native settings stored in `space_ds.settings` config:
- 11 brand colors (base_brand_color, accent_color_primary/secondary, neutral, heading, border, gray, success/danger/warning/info)
- 10 background colors (mapped to container `option-1` through `option-10`)
- Typography (base_font_size, font_family: Geist/sans-serif/serif)

Theme's `space_ds_preprocess_page()` reads these settings and generates `--sds-*` CSS variables at runtime, including auto-generated dark/light variants (±15%).

### 4.3 Migration
`BrandTokenService` should be rewritten to:
1. Read `tokens.json` from blueprint
2. Map token colors to `space_ds.settings` config keys
3. Write config via `\Drupal::configFactory()->getEditable('space_ds.settings')`
4. Let the theme handle CSS variable generation
5. Keep logo handling (still valid)
6. Keep custom font handling (may need adaptation)

**Color mapping needed:**
| Token Key | Theme Setting Key |
|-----------|------------------|
| primary | accent_color_primary |
| secondary | accent_color_secondary |
| brand/base | base_brand_color |
| neutral/text | neutral_color |
| heading | heading_color |
| border | border_color |
| gray | gray_color |
| success | success_color |
| danger | danger_color |
| warning | warning_color |
| info | info_color |
| background_1..10 | background_color_1..10 |
| font_family | font_family |
| font_size | base_font_size |

---

## 5. Header & Footer — Now Canvas Components

### 5.1 Header (`space-header`)
- Props: `menu_align` (left/center/right)
- Slots: `logo`, `navigation`, `links` (CTAs)
- Has JS for mobile hamburger menu

**Provisioning must:**
1. Place header component in header region (or as first Canvas element)
2. Populate logo slot with site branding
3. Populate navigation slot with main menu links
4. Populate links slot with CTA button(s)

### 5.2 Footer (`space-footer`)
- Props: `brand_name`, `brand_slogan`, `brand_description`, `disclaimer`, `copyright`, `brand_logo`
- Slots: `social_links`, `columns` (nav columns), `footer_bottom_links`, `cookie_section`

**Provisioning must:**
1. Place footer component in footer region
2. Set brand props from onboarding data
3. Populate columns slot with footer menu links
4. Populate footer_bottom_links with legal links
5. Set copyright from site name + year

---

## 6. Impact on Existing Pipeline

### 6.1 Files Requiring Complete Rewrite

| File | Impact | Reason |
|------|--------|--------|
| `platform-app/src/lib/ai/space-component-manifest.json` | **Full rebuild** | 84 → 31 components, all props changed |
| `platform-app/src/lib/ai/page-design-rules.ts` | **Full rewrite** | All `preferredComponents` reference deleted components; new compositional model |
| `platform-app/src/lib/blueprint/component-tree-builder.ts` | **Full rewrite** | Must generate slot-based trees with flexi layouts instead of flat organism lists |

### 6.2 Files Requiring Significant Updates

| File | Impact | Reason |
|------|--------|--------|
| `drupal-site/.../BrandTokenService.php` | **Rewrite** | Write to theme settings config, not CSS file |
| `drupal-site/.../BlueprintImportService.php` | **Update** | Handle new component tree with slots, header, footer |
| `platform-app/src/lib/ai/prompts/page-layout.ts` | **Update** | New component vocabulary |
| `platform-app/src/lib/ai/prompts/content-generation.ts` | **Update** | New content patterns |
| `provisioning/src/steps/08-import-blueprint.ts` | **Update** | Handle header/footer, new tree structure |

### 6.3 Files with Minor/No Impact

| File | Impact | Reason |
|------|--------|--------|
| `platform-app/src/lib/ai/prompts/form-generation.ts` | Needs review | Form atoms gone from theme; may need Webform integration |
| `platform-app/src/app/onboarding/*` | No change | Onboarding UX unchanged |
| `platform-app/src/app/dashboard/*` | No change | Dashboard unchanged |

---

## 7. Impact on Previous Tasks

| Task | Status | Notes |
|------|--------|-------|
| TASK-305 (wire unused components) | **INVALIDATED** | Those components no longer exist |
| TASK-306 (header/footer ADR) | **RESOLVED** | Header/footer are now Canvas components — decision made by upstream |
| TASK-307 (blog page type) | **APPROACH CHANGES** | `space-imagecard` IS a blog card now (date, categories, read_time). `space-content-detail` is an article detail page. Drupal content model still needed. |
| TASK-308 (gallery organism) | **STILL VALID** | Slider + imagecard composition approach confirmed |
| TASK-309 (map embed) | **STILL VALID** | No map component; iframe approach still applicable |
| TASK-310 (contact form in rules) | **APPROACH CHANGES** | `space-contact-card` handles contact info. Form atoms gone — need Webform or contrib solution for actual form |
| TASK-311 (upstream audit) | **COMPLETED** | This analysis IS the audit |

---

## 8. New Page Section Composition Patterns

### Hero Sections (4 options)
| Component | Best For |
|-----------|---------|
| `space-hero-banner-style-02` | Full-width bg image hero with title, subtitle, stats slot, content slot |
| `space-hero-banner-with-media` | Hero with featured image, label, categories (articles, portfolios) |
| `space-detail-page-hero-banner` | Article/blog detail page hero with bg image, categories |
| `space-video-banner` | Video-focused hero with iframe embed |

### Content Sections (via flexi composition)
| Pattern | Composition |
|---------|-------------|
| Text + Image (50/50) | `flexi(50-50)` → heading + text + button / image |
| Text + Image (66/33) | `flexi(66-33)` → heading + text / image |
| Features Grid | `flexi(33-33-33)` → 3x (icon + heading + text) |
| Full-width Text | `flexi(100)` → section-heading + text |
| Stats Row | `flexi(25-25-25-25)` → 4x stats-kpi |

### Card Sections (via slider or flexi)
| Pattern | Composition |
|---------|-------------|
| Testimonials Carousel | `slider(3/view)` → testimony-cards |
| Blog Listing Grid | `flexi(33-33-33)` → imagecards |
| Team Grid | `flexi(25-25-25-25)` → user-cards |
| Logo Section | `logo-section` → heading + content slot with image grid |
| Portfolio Gallery | `slider(3/view)` → imagecards or dark-bg-imagecards |

### Special Sections
| Pattern | Component |
|---------|-----------|
| CTA Banner | `cta-banner-type-1` (bg image, title, description, buttons slot) |
| FAQ | `accordion` → accordion-items |
| Contact Info | `flexi(33-33-33)` → contact-cards (email, phone, FAQ) |
| Blog Article | `content-detail` (text, tags, date, user-card slot, image slot) |

---

## 9. Container Background Color Mapping

The container's `background_color` enum maps to theme settings:

| Enum Value | CSS Variable | Default |
|------------|-------------|---------|
| `transparent` | none | transparent |
| `white` | #ffffff | white |
| `black` | #000000 | black |
| `base-brand` | `--sds-base-brand-color` | #cbddbb |
| `option-1` | `--sds-background-color-0` | Configurable |
| `option-2` | `--sds-background-color-1` | Configurable |
| ... | ... | ... |
| `option-10` | `--sds-background-color-9` | Configurable |

This means the AI should alternate section backgrounds for visual rhythm using: transparent → option-1 → white → option-2, etc.

---

*Generated 2026-03-20. This document supersedes the gap analysis (REQ-space-ds-component-gap-analysis.md) for component recommendations.*
