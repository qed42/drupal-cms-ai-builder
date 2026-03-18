# TASK-109: Blueprint Generation (AI Content Pipeline)

**Story:** US-012, US-013, US-014, US-015, US-017, US-018
**Priority:** P0
**Estimated Effort:** XL
**Milestone:** M3 — Blueprint & Provisioning

## Description
After the user clicks "Visualize my site" on the final wizard screen, generate the full site blueprint as markdown files. This is the heavy AI call that produces all page content, component layouts, form definitions, and content items.

## Technical Approach
- **API Route: `/api/provision/generate-blueprint`**
  - Input: complete onboarding_sessions.data (all wizard inputs)
  - Orchestrates multiple AI calls to produce the blueprint bundle

- **Blueprint generation pipeline:**
  1. **Site metadata** — Compose `site.md` from onboarding data (name, tagline, industry, audience, pages, compliance)
  2. **Content items** — AI generates structured content for each content type relevant to the industry (services, team members, testimonials, etc.)
  3. **Page layouts** — For each page in the user's page list, AI generates:
     - Component layout (which Space SDC components to use)
     - Component props (headings, body text, CTAs)
     - Content type references (e.g., `source: content_type:service`)
     - SEO meta title and description
  4. **Form definitions** — Generate contact form field list based on industry
  5. **Brand tokens** — Write `tokens.json` from extracted colors and fonts

- **SDC Component awareness:** The prompt must include the Space component manifest (available components + their props) so AI generates valid layouts. The manifest is either:
  - Fetched from the Drupal codebase at build time (static JSON)
  - Maintained as a JSON file in the platform app

- **Output:** Write all files to blueprint storage (local: `storage/blueprints/{site_id}/`, prod: S3)
- **Update DB:** Set `blueprints.status = "ready"`, `sites.status = "provisioning"`

## Acceptance Criteria
- [ ] Blueprint generates `site.md` with correct metadata
- [ ] Blueprint generates `pages/*.md` for each user-selected page
- [ ] Each page markdown has valid component layout sections
- [ ] Blueprint generates `content/*.md` with industry-appropriate content
- [ ] Blueprint generates `forms/contact.md` with form fields
- [ ] Blueprint generates `brand/tokens.json` with user's colors and fonts
- [ ] Logo file copied to blueprint `brand/` directory
- [ ] Healthcare sites include HIPAA disclaimer component
- [ ] Legal sites include attorney advertising disclaimer
- [ ] All generated content is relevant to the user's business description
- [ ] Blueprint generation completes in < 60 seconds

## Dependencies
- TASK-108 (Font screen — final wizard step triggers generation)
- TASK-104 (AI client + industry inference)

## Files/Modules Affected
- `platform-app/src/app/api/provision/generate-blueprint/route.ts`
- `platform-app/src/lib/ai/blueprint-generator.ts`
- `platform-app/src/lib/ai/prompts/page-layout.ts`
- `platform-app/src/lib/ai/prompts/content-generation.ts`
- `platform-app/src/lib/ai/prompts/form-generation.ts`
- `platform-app/src/lib/blueprint/writer.ts`
- `platform-app/src/lib/blueprint/types.ts`
- `platform-app/storage/blueprints/` (output directory)
