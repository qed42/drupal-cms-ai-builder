# TASK-317: Add header/footer generation to provisioning pipeline

**Story:** Space DS v2 Migration
**Priority:** P1
**Estimated Effort:** L
**Milestone:** Space DS v2 Migration

## Description

Space DS v2 provides `space-header` and `space-footer` as Canvas components with slots. The provisioning pipeline must generate and import these as site-wide layout elements. This was previously a P0 gap (no header/footer) — now resolved by the theme upgrade.

## Technical Approach

### 1. Header generation

The `space-header` component needs:
- **Props:** `menu_align` (center recommended for most sites)
- **logo slot:** Site logo image component
- **navigation slot:** Main menu links
- **links slot:** CTA button(s)

**Implementation:**
- Add `buildHeaderTree()` to component-tree-builder
- Generate header from blueprint `site_data` (site name, logo, menu items)
- Place in Canvas layout as first element or in header region

### 2. Footer generation

The `space-footer` component needs:
- **Props:** `brand_name`, `brand_slogan`, `brand_description`, `disclaimer`, `copyright`, `brand_logo`
- **social_links slot:** Social media icon links
- **columns slot:** Footer navigation columns
- **footer_bottom_links slot:** Privacy, Terms, Cookies links
- **cookie_section slot:** Cookie consent

**Implementation:**
- Add `buildFooterTree()` to component-tree-builder
- Populate from blueprint `site_data`:
  - `brand_name` from site name
  - `brand_slogan` from tagline
  - `brand_description` from AI-generated company description
  - `copyright` from `© {year} {site_name}`
  - Footer columns from menu structure
  - Social links from onboarding data (if collected)

### 3. Update blueprint schema

Add to blueprint JSON:
```json
{
  "header": {
    "menu_align": "center",
    "cta_text": "Get Started",
    "cta_url": "/contact"
  },
  "footer": {
    "brand_slogan": "...",
    "brand_description": "...",
    "disclaimer": "...",
    "social_links": [
      { "platform": "twitter", "url": "..." },
      { "platform": "linkedin", "url": "..." }
    ],
    "legal_links": [
      { "title": "Privacy Policy", "url": "/privacy" },
      { "title": "Terms of Service", "url": "/terms" }
    ]
  }
}
```

### 4. Update BlueprintImportService.php

- Add `importHeader()` method to create header Canvas component with slots
- Add `importFooter()` method to create footer Canvas component with brand props
- Place header/footer in appropriate Canvas regions or as block content

### 5. Update AI content generation

- Generate footer content (brand description, disclaimer) during content phase
- Generate social media placeholder URLs based on business type
- Generate legal page placeholders (Privacy, Terms)

## Acceptance Criteria

- [ ] Header component generated with logo, navigation menu, CTA button
- [ ] Footer component generated with brand info, social links, nav columns, legal links
- [ ] Header renders correctly with mobile hamburger menu
- [ ] Footer renders correctly with all slot content
- [ ] Blueprint schema includes header/footer data
- [ ] BlueprintImportService creates Canvas header/footer entities

## Dependencies
- TASK-312 (manifest)
- TASK-314 (component tree builder)

## Files/Modules Affected
- `platform-app/src/lib/blueprint/component-tree-builder.ts`
- `platform-app/src/lib/ai/prompts/content-generation.ts`
- `provisioning/src/steps/08-import-blueprint.ts`
- `drupal-site/web/modules/custom/ai_site_builder/src/Service/BlueprintImportService.php`
