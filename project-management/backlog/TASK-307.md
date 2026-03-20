# TASK-307: Blog page type — content model, Views listing, and page design rules

**Story:** REQ-space-ds-component-gap-analysis §3.1 (Blog/Post Listing gap)
**Priority:** P1
**Estimated Effort:** XL
**Milestone:** Component Coverage Expansion

## Description

Blog is the most requested page type across all website builders and is currently impossible to generate. This task adds end-to-end blog support:

1. Drupal content type + fields for blog posts
2. Views-based blog listing page
3. New `blog` PageType in `page-design-rules.ts`
4. Component mapping using `space-featured-card` for blog post cards
5. Provisioning engine support for blog content import

## Technical Approach

### Phase 1: Drupal Content Model

1. **Create `article` content type config** in `ai_site_builder` module:
   - Title (core)
   - Body (formatted long text)
   - `field_featured_image` (media reference → image)
   - `field_summary` (text, plain, 280 chars — for card excerpt)
   - `field_category` (entity reference → taxonomy `blog_category`)
   - `field_published_date` (datetime)

2. **Create `blog_category` taxonomy** vocabulary config

3. **Create Views** for blog listing:
   - Machine name: `blog_listing`
   - Display: page at `/blog`
   - Format: Unformatted list of teasers
   - Sort: Published date descending
   - Pager: 10 per page
   - Canvas layout: use `space-featured-card` for each teaser

### Phase 2: Page Design Rules

4. **Add `"blog"` to `PageType` union** in `page-design-rules.ts`

5. **Create blog listing page rule:**
   ```
   sectionCountRange: [3, 5]
   sections:
     - hero (required, opening) → style-09
     - blog-listing (required, middle) → Views block
     - cta (optional, closing) → newsletter signup or contact
   slugPatterns: ["blog", "news", "articles", "insights"]
   ```

6. **Create blog post component mapping:**
   - Map `space-featured-card` for blog post teasers (image, title, excerpt, date, category badge)
   - Map body content to `space-text-media-default` sections

### Phase 3: Provisioning

7. **Update blueprint schema** to support blog post content:
   - Add `blog_posts` array to blueprint JSON
   - Each post: title, body, summary, category, featured_image

8. **Update `BlueprintImportService.php`**:
   - Add `importBlogPosts()` method
   - Create article nodes from blueprint data
   - Assign categories from taxonomy

9. **Update `ImportBlueprintCommands.php`** to call new import method

### Phase 4: AI Generation

10. **Update AI prompts** to generate blog post content when blog page is included
11. **Add blog content generation prompt** in `platform-app/src/lib/ai/prompts/`

## Acceptance Criteria

- [ ] `article` content type installs cleanly with all fields
- [ ] `blog_category` taxonomy vocabulary created
- [ ] Blog listing Views page renders at `/blog` with pager
- [ ] Blog teaser uses `space-featured-card` component via Canvas
- [ ] `"blog"` PageType added to `page-design-rules.ts` with complete rule
- [ ] Blueprint import creates article nodes from blueprint data
- [ ] AI generates 3-5 sample blog posts during site provisioning
- [ ] Existing tests pass, new tests cover blog import path

## Dependencies
- TASK-305 (wires `space-featured-card` into pipeline)

## Files/Modules Affected
- `drupal-site/web/modules/custom/ai_site_builder/config/install/` (new config YAMLs)
- `drupal-site/web/modules/custom/ai_site_builder/src/Service/BlueprintImportService.php`
- `drupal-site/web/modules/custom/ai_site_builder/src/Drush/Commands/ImportBlueprintCommands.php`
- `platform-app/src/lib/ai/page-design-rules.ts`
- `platform-app/src/lib/ai/prompts/` (new blog generation prompt)
- `platform-app/src/lib/blueprint/component-tree-builder.ts`
- `provisioning/src/steps/08-import-blueprint.ts`
