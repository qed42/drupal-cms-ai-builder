# TASK-336: Add interlinking rules to page generation prompt

**Story:** SEO-interlinking
**Priority:** P0
**Estimated Effort:** M
**Milestone:** SEO/GEO Interlinking

## Description

Add explicit rules to the page generation prompt that guide the AI to create contextual internal links between pages. Each page type should have a linking strategy — e.g., home page CTAs should point to services and contact, service pages should link to contact and about, etc.

## Technical Approach

1. **Add interlinking rules section** to `buildPageGenerationPrompt()`:

   ```
   ### Internal Linking Strategy (SEO Critical)
   - Every CTA banner MUST link to a real page from the Site Pages list above
   - Every composed section with a space-button SHOULD link to a relevant page
   - Use descriptive anchor text — not "Learn More" or "Click Here"
   - CTA text should hint at the destination: "Explore Our Services →", "Meet the Team →"
   ```

2. **Add page-type-specific linking rules** via a helper function `getInterlinkingRules(pageSlug, pageType, allPages)`:
   - **Home page**: CTA banner → /contact or /services; feature cards → individual service pages; about section → /about or /team
   - **Services/Features page**: Service cards with `url` → individual detail pages if they exist, otherwise /contact; closing CTA → /contact
   - **About/Team page**: CTA → /services or /contact; team cards → individual profiles if they exist
   - **Contact page**: No closing CTA banner needed (already the destination); but link back to /services or /about in supporting text
   - **Portfolio/Case Studies**: Cards → individual case study pages; CTA → /contact
   - **FAQ page**: CTA → /contact; relevant answers can link to /services
   - **Generic/Landing pages**: CTA → most relevant conversion page (/contact, /services)

3. **Leverage linkable components** — add explicit guidance:
   ```
   Components that support internal links:
   - space-button: set "url" to a page from the sitemap (e.g., "/contact")
   - space-imagecard / space-content-detail: set "url" for click-through cards + "full_box_link": true
   - space-link: for inline text links within space-text HTML content
   - space-cta-banner-type-1: closing CTA — always link to conversion page
   ```

4. **Inline links in space-text HTML** — guide AI to embed `<a href="/slug">anchor text</a>` within `<p>` content where natural (e.g., "Learn more about [our services](/services)").

## Acceptance Criteria

- [ ] Home page CTA banners link to real pages (services, contact)
- [ ] Service/feature cards use `url` prop pointing to relevant pages
- [ ] CTA anchor text is descriptive and page-specific (not generic)
- [ ] Contact page doesn't have a redundant "Contact Us" CTA
- [ ] At least 2-3 internal links per page (excluding header/footer nav)
- [ ] Inline `<a>` links appear naturally in space-text HTML content
- [ ] All generated URLs match actual page slugs from sitemap

## Dependencies
- TASK-335 (sitemap context must be available in prompt)

## Files/Modules Affected
- `platform-app/src/lib/ai/prompts/page-generation.ts`
- `platform-app/src/lib/ai/page-design-rules.ts` (optional: add linking patterns per page type)
